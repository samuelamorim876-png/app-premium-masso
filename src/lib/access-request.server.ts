import { supabaseAdmin } from "@/integrations/supabase/client.server";

type AccessRequestInput = {
  name: string;
  email: string;
  password: string;
};

function normalizeTelegramToken(raw: string) {
  const cleaned = raw.trim().replace(/^["']|["']$/g, "");
  const match = cleaned.match(/\d{6,}:[A-Za-z0-9_-]{20,}/);
  return (match?.[0] ?? cleaned.replace(/^bot/i, "")).trim();
}

export async function sendAccessRequestTelegram(name: string, email: string) {
  const token = normalizeTelegramToken(process.env.TELEGRAM_BOT_TOKEN ?? "");
  const chatId = (process.env.TELEGRAM_CHAT_ID ?? "").trim().replace(/^["']|["']$/g, "");
  if (!token || !chatId) return { ok: false, reason: "missing_telegram_env" as const };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🆕 Nova solicitação de acesso\n\nNome: ${name}\nEmail: ${email}\nStatus: Pendente`,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    return { ok: res.ok, status: res.status, reason: res.ok ? "sent" : "telegram_api_failed" };
  } catch {
    return { ok: false, reason: "fetch_error" as const };
  }
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

  const telegram = await sendAccessRequestTelegram(input.name, input.email);
  return { ok: true as const, requestId: request.id, status: request.status, telegram };
}