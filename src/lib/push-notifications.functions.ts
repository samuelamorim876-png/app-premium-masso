import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PRINCIPAL_ADMIN_EMAIL = "pastororxiamorim@gmail.com";

type PushInvokeResult = {
  sent: number;
  attempted?: number;
  reason: string;
  detail?: unknown;
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
    return invokePushNotify({
      type: "access_request",
      requestId: data.requestId,
      name: data.name,
      email: data.email,
    });
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
        .select("id,user_id,endpoint,p256dh,auth_key,created_at,device_info,permission_status,fcm_endpoint,last_saved_at,last_received_at,last_error")
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

    return {
      allowed: true as const,
      principalAdminEmail: PRINCIPAL_ADMIN_EMAIL,
      adminUserId,
      adminMarked: (roleRes.data ?? []).length > 0,
      firebaseConnected: subscriptions.some((sub: any) => sub.fcm_endpoint),
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
