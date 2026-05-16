import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PRINCIPAL_ADMIN_EMAIL = "pastororxiamorim@gmail.com";

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

type PushInvokeResult = {
  sent: number;
  attempted?: number;
  reason: string;
  detail?: {};
};

async function invokePushNotify(payload: Record<string, unknown>): Promise<PushInvokeResult> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[push] Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return { sent: 0, attempted: 0, reason: "missing_env" };
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/push-notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    console.info("[push] edge response", { status: res.status, parsed });

    if (!res.ok) {
      console.error("[push] push-notify edge function failed", res.status, text);
      return { sent: 0, attempted: 0, reason: `edge_${res.status}`, detail: parsed };
    }

    return {
      sent: parsed.sent ?? 0,
      attempted: parsed.attempted ?? parsed.results?.length ?? 0,
      reason: parsed.reason ?? "sent",
      detail: parsed,
    };
  } catch (err) {
    console.error("[push] fetch error", err);
    return { sent: 0, attempted: 0, reason: "fetch_error" };
  }
}

async function isPrincipalAdmin(userId: string) {
  const supabaseAdmin = await getSupabaseAdmin();
  const [{ data: role }, { data: profile }] = await Promise.all([
    supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle(),
    supabaseAdmin.from("profiles").select("email").eq("id", userId).maybeSingle(),
  ]);

  return !!role && (profile?.email ?? "").toLowerCase() === PRINCIPAL_ADMIN_EMAIL;
}

function normalizeTelegramToken(raw: string) {
  const cleaned = raw.trim().replace(/^['"]|['"]$/g, "");
  const match = cleaned.match(/\d{6,}:[A-Za-z0-9_-]{20,}/);
  return (match?.[0] ?? cleaned.replace(/^bot/i, "")).trim();
}

async function sendTelegram(text: string): Promise<{ ok: boolean; status?: number; body?: string; reason?: string }> {
  const token = normalizeTelegramToken(process.env.TELEGRAM_BOT_TOKEN ?? "");
  const chatId = (process.env.TELEGRAM_CHAT_ID ?? "").trim().replace(/^['"]|['"]$/g, "");
  if (!token || !chatId) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID ausentes");
    return { ok: false, reason: "missing_telegram_env" };
  }
  try {
    console.info("[telegram] 4. API Telegram será chamada", { tokenLength: token.length, chatIdLength: chatId.length });
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const body = await res.text();
    console.info("[telegram] 5. API Telegram respondeu", { status: res.status, body: body.slice(0, 300) });
    return { ok: res.ok, status: res.status, body: body.slice(0, 500), reason: res.ok ? "sent" : "telegram_api_failed" };
  } catch (err) {
    console.error("[telegram] fetch error", err);
    return { ok: false, reason: "fetch_error" };
  }
}

export const submitAccessRequestAndNotify = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(180),
        password: z.string().min(6).max(120),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    console.info("[access-request] 2. Função automática iniciada", { email: data.email });
    try {
      const supabaseAdmin = await getSupabaseAdmin();
      // Retry insert up to 2x for transient DB/network blips
      let request: { id: string; status: string; created_at: string } | null = null;
      let lastError: any = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const { data: row, error } = await supabaseAdmin
            .from("access_requests")
            .insert({
              name: data.name,
              email: data.email,
              desired_password: data.password,
              status: "pending",
            })
            .select("id,status,created_at")
            .single();
          if (!error && row) {
            request = row;
            break;
          }
          lastError = error;
          console.warn(`[access-request] insert attempt ${attempt} failed`, error);
        } catch (e) {
          lastError = e;
          console.warn(`[access-request] insert attempt ${attempt} threw`, e);
        }
        if (attempt < 2) await new Promise((r) => setTimeout(r, 400));
      }

      if (!request) {
        console.error("[access-request] Erro ao salvar solicitação após retries", lastError);
        return {
          ok: false as const,
          reason: "insert_failed",
          error: lastError?.message ?? "Não foi possível salvar a solicitação no momento.",
        };
      }

      console.info("[access-request] 3. Usuário salvo no banco com status pending", {
        requestId: request.id,
        status: request.status,
      });

      // Telegram is best-effort — never let it fail the request
      let telegram: Awaited<ReturnType<typeof sendTelegram>> = { ok: false, reason: "skipped" };
      try {
        const text = `🆕 Nova solicitação de acesso\n\nNome: ${data.name}\nEmail: ${data.email}\nStatus: Pendente`;
        telegram = await sendTelegram(text);
      } catch (e) {
        console.error("[access-request] telegram threw (ignored)", e);
      }

      console.info("[access-request] 6. Fluxo automático finalizado", {
        requestId: request.id,
        telegramOk: telegram.ok,
      });

      return { ok: true as const, requestId: request.id, status: request.status, telegram };
    } catch (err) {
      // Catastrophic fallback — never throw out of the serverFn, so the client
      // always gets JSON (not a 500 HTML page → "Ocorreu um erro inesperado").
      console.error("[access-request] Erro inesperado no handler", err);
      return {
        ok: false as const,
        reason: "unexpected",
        error: err instanceof Error ? err.message : "unknown",
      };
    }
  });

export const sendAccessRequestPush = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        requestId: z.string().uuid(),
        name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(180),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const text = `🆕 *Nova solicitação de acesso*\n\n*Nome:* ${data.name}\n*Email:* ${data.email}\n*Data:* ${now}\n*Status:* Pendente`;
    const [pushResult, telegramResult] = await Promise.all([
      invokePushNotify({
        type: "access_request",
        requestId: data.requestId,
        name: data.name,
        email: data.email,
      }),
      sendTelegram(text),
    ]);
    return { ...pushResult, telegram: telegramResult };
  });

export const sendTelegramTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isPrincipalAdmin(context.userId))) {
      return { ok: false, reason: "not_principal_admin" as const };
    }
    const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    return sendTelegram(`🔔 *Teste de notificação*\nEnviado em: ${now}`);
  });

export const sendTestAdminPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isPrincipalAdmin(context.userId))) {
      return { sent: 0, attempted: 0, reason: "not_principal_admin" as const };
    }

    return invokePushNotify({
      type: "test",
      title: "🔔 Teste de Push Notification",
      message: "Teste real enviado para o dispositivo administrador.",
    });
  });

export const getAdminPushDiagnostics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const allowed = await isPrincipalAdmin(context.userId);
    if (!allowed) {
      return { allowed: false as const, reason: "not_principal_admin" as const };
    }

    const supabaseAdmin = await getSupabaseAdmin();

    const { data: adminProfile } = await supabaseAdmin
      .from("profiles")
      .select("id,email,name")
      .ilike("email", PRINCIPAL_ADMIN_EMAIL)
      .maybeSingle();

    const adminUserId = adminProfile?.id ?? context.userId;

    const [roleRes, subsRes, logsRes] = await Promise.all([
      supabaseAdmin
        .from("user_roles")
        .select("role,created_at")
        .eq("user_id", adminUserId)
        .eq("role", "admin"),
      (supabaseAdmin.from("push_subscriptions") as any)
        .select("id,user_id,endpoint,fcm_token,platform,device_label,created_at,device_info,permission_status,fcm_endpoint,last_saved_at,last_received_at,last_error")
        .eq("user_id", adminUserId)
        .order("last_saved_at", { ascending: false }),
      (supabaseAdmin.from("push_notification_logs") as any)
        .select("id,user_id,notification_type,title,body,target_endpoint,status,provider,provider_status,provider_response,error_message,metadata,created_at")
        .eq("user_id", adminUserId)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    const subscriptions = subsRes.data ?? [];
    const logs = logsRes.data ?? [];
    const latestSubscription = subscriptions[0] ?? null;
    const latestSent = logs.find((log: any) => log.status === "sent" || log.status === "accepted") ?? logs[0] ?? null;
    const latestReceived = logs.find((log: any) => log.status === "received") ?? null;
    const fcmConfigured = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON && !!process.env.FIREBASE_WEB_CONFIG_JSON;

    return {
      allowed: true as const,
      principalAdminEmail: PRINCIPAL_ADMIN_EMAIL,
      adminUserId,
      adminMarked: (roleRes.data ?? []).length > 0,
      firebaseConnected: fcmConfigured && subscriptions.some((sub: any) => sub.fcm_token),
      fcmConfigured,
      tokensCount: subscriptions.filter((s: any) => s.fcm_token).length,
      subscriptionCount: subscriptions.length,
      latestSubscription,
      latestSent,
      latestReceived,
      subscriptions,
      logs,
    };
  });

export const markPushReceived = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        endpoint: z.string().url().optional(),
        notificationId: z.string().uuid().optional(),
      })
      .parse(data)
  )
  .handler(async ({ context, data }) => {
    if (!(await isPrincipalAdmin(context.userId))) {
      return { ok: false, reason: "not_principal_admin" as const };
    }

    const supabaseAdmin = await getSupabaseAdmin();
    const now = new Date().toISOString();
    if (data.endpoint) {
      await (supabaseAdmin.from("push_subscriptions") as any)
        .update({ last_received_at: now, last_error: null })
        .eq("user_id", context.userId)
        .eq("endpoint", data.endpoint);
    }

    if (data.notificationId) {
      const { data: existing } = await (supabaseAdmin.from("push_notification_logs") as any)
        .select("id,user_id,notification_type,title,body,target_endpoint,provider,provider_status,provider_response,metadata")
        .eq("id", data.notificationId)
        .maybeSingle();

      if (existing) {
        await (supabaseAdmin.from("push_notification_logs") as any).insert({
          user_id: existing.user_id,
          notification_type: existing.notification_type,
          title: existing.title,
          body: existing.body,
          target_endpoint: existing.target_endpoint,
          status: "received",
          provider: existing.provider,
          provider_status: existing.provider_status,
          provider_response: existing.provider_response,
          metadata: { ...(existing.metadata ?? {}), received_at: now, confirmed_by: "admin_device" },
        });
      }
    }

    return { ok: true, receivedAt: now };
  });
