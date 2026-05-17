import { supabaseAdmin } from "@/integrations/supabase/client.server";

type AccessRequestInput = {
  name: string;
  email: string;
  password: string;
};

type TelegramSendResult = {
  ok: boolean;
  status?: number;
  reason: "sent" | "missing_telegram_env" | "telegram_api_failed" | "timeout" | "fetch_error";
  response?: string;
  attempts: number;
};

function normalizeTelegramToken(raw: string) {
  const cleaned = raw.trim().replace(/^["']|["']$/g, "");
  const match = cleaned.match(/\d{6,}:[A-Za-z0-9_-]{20,}/);
  return (match?.[0] ?? cleaned.replace(/^bot/i, "")).trim();
}

async function logTelegramDelivery(params: {
  requestId?: string;
  name: string;
  email: string;
  result: TelegramSendResult;
}) {
  try {
    await (supabaseAdmin.from("push_notification_logs") as any).insert({
      notification_type: "access_request",
      title: params.result.ok ? "Telegram enviado" : "Telegram não enviado",
      body: `Solicitação de acesso: ${params.name} (${params.email})`,
      status: params.result.ok ? "sent" : "error",
      provider: "telegram",
      provider_status: params.result.status ?? null,
      provider_response: params.result.response?.slice(0, 2000) ?? null,
      error_message: params.result.ok ? null : params.result.reason,
      metadata: {
        requestId: params.requestId ?? null,
        email: params.email,
        attempts: params.result.attempts,
        reason: params.result.reason,
      },
    });
  } catch (error) {
    console.error("[telegram] falha ao registrar log persistente", error);
  }
}

export async function sendAccessRequestTelegram(name: string, email: string, requestId?: string): Promise<TelegramSendResult> {
  const token = normalizeTelegramToken(process.env.TELEGRAM_BOT_TOKEN ?? "");
  const chatId = (process.env.TELEGRAM_CHAT_ID ?? "").trim().replace(/^["']|["']$/g, "");
  if (!token || !chatId) {
    const result: TelegramSendResult = { ok: false, reason: "missing_telegram_env", attempts: 0 };
    await logTelegramDelivery({ requestId, name, email, result });
    return result;
  }

  const message = `🆕 Nova solicitação de acesso\n\nNome: ${name}\nEmail: ${email}\nStatus: Pendente`;
  let lastResult: TelegramSendResult = { ok: false, reason: "fetch_error", attempts: 0 };

  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      console.info("[telegram] envio de solicitação iniciado", { requestId, attempt, tokenLength: token.length, chatIdLength: chatId.length });
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message }),
        signal: controller.signal,
      });
      const body = await res.text();
      lastResult = {
        ok: res.ok,
        status: res.status,
        reason: res.ok ? "sent" : "telegram_api_failed",
        response: body.slice(0, 2000),
        attempts: attempt,
      };
      console.info("[telegram] resposta da API", { requestId, attempt, status: res.status, ok: res.ok, body: body.slice(0, 300) });
      if (res.ok) break;
      if (![408, 429, 500, 502, 503, 504].includes(res.status)) break;
    } catch (error) {
      lastResult = {
        ok: false,
        reason: error instanceof Error && error.name === "AbortError" ? "timeout" : "fetch_error",
        attempts: attempt,
        response: error instanceof Error ? error.message : String(error),
      };
      console.error("[telegram] tentativa falhou", { requestId, attempt, reason: lastResult.reason, error });
    } finally {
      clearTimeout(timeout);
    }

    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 700));
  }

  await logTelegramDelivery({ requestId, name, email, result: lastResult });
  return lastResult;
}

export async function createAccessRequest(input: AccessRequestInput) {
  let request: { id: string; status: string; created_at: string } | null = null;
  let lastError: any = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { data: row, error } = await supabaseAdmin
        .from("access_requests")
        .insert({
          name: input.name,
          email: input.email,
          desired_password: input.password,
          status: "pending",
        })
        .select("id,status,created_at")
        .single();

      if (!error && row) {
        request = row;
        break;
      }
      lastError = error;
    } catch (error) {
      lastError = error;
    }

    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 400));
  }

  if (!request) {
    return {
      ok: false as const,
      reason: "insert_failed" as const,
      error: lastError?.message ?? "Não foi possível salvar a solicitação no momento.",
    };
  }

  const telegram = await sendAccessRequestTelegram(input.name, input.email, request.id);
  return { ok: true as const, requestId: request.id, status: request.status, telegram };
}