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

type QueueRow = {
  id: string;
  access_request_id: string;
  status: string;
  attempt_count: number;
  payload: { name?: string; email?: string; password?: string; created_at?: string } | null;
};

const TELEGRAM_TIMEOUT_MS = 7000;
const TELEGRAM_RETRY_DELAYS_MS = [2000, 5000, 10000];
const QUEUE_RETRY_DELAYS_SECONDS = [2, 5, 10, 60, 300, 900, 1800];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeTelegramToken(raw: string) {
  const cleaned = raw.trim().replace(/^["']|["']$/g, "");
  const match = cleaned.match(/\d{6,}:[A-Za-z0-9_-]{20,}/);
  return (match?.[0] ?? cleaned.replace(/^bot/i, "")).trim();
}

function secondsUntilNextRetry(totalAttempts: number) {
  return QUEUE_RETRY_DELAYS_SECONDS[Math.min(totalAttempts, QUEUE_RETRY_DELAYS_SECONDS.length - 1)];
}

function nextRetryIso(totalAttempts: number) {
  return new Date(Date.now() + secondsUntilNextRetry(totalAttempts) * 1000).toISOString();
}

async function logTelegramDelivery(params: {
  requestId?: string;
  queueId?: string;
  name: string;
  email: string;
  result: TelegramSendResult;
}) {
  try {
    await (supabaseAdmin.from("push_notification_logs") as any).insert({
      notification_type: "access_request",
      title: params.result.ok ? "Telegram enviado" : "Telegram pendente de reenvio",
      body: `Solicitação de acesso: ${params.name} (${params.email})`,
      status: params.result.ok ? "sent" : "error",
      provider: "telegram",
      provider_status: params.result.status ?? null,
      provider_response: params.result.response?.slice(0, 2000) ?? null,
      error_message: params.result.ok ? null : params.result.reason,
      metadata: {
        requestId: params.requestId ?? null,
        queueId: params.queueId ?? null,
        email: params.email,
        attempts: params.result.attempts,
        reason: params.result.reason,
        retryable: !params.result.ok,
      },
    });
  } catch (error) {
    console.error("[telegram] falha ao registrar log persistente", error);
  }
}

async function fetchAccessRequestPayload(requestId: string) {
  const { data, error } = await supabaseAdmin
    .from("access_requests")
    .select("id,name,email,status,created_at,desired_password")
    .eq("id", requestId)
    .maybeSingle();

  if (error) {
    console.error("[access-request] falha ao buscar payload para notificação", { requestId, error });
    return null;
  }

  return data
    ? { name: data.name, email: data.email, password: (data as any).desired_password as string | undefined, created_at: data.created_at as string | undefined }
    : null;
}

function escapeHtml(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatBrDateTime(date = new Date()) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

export async function sendAccessRequestTelegram(
  name: string,
  email: string,
  requestId?: string,
  queueId?: string,
  password?: string,
  createdAt?: string,
): Promise<TelegramSendResult> {
  const rawToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const rawChat = process.env.TELEGRAM_CHAT_ID ?? "";
  const token = normalizeTelegramToken(rawToken);
  const chatId = rawChat.trim().replace(/^["']|["']$/g, "");

  console.info("[telegram] env diag", {
    rawTokenLen: rawToken.length,
    normTokenLen: token.length,
    tokenHead: token.slice(0, 6),
    tokenTail: token.slice(-4),
    rawChatLen: rawChat.length,
    normChatLen: chatId.length,
    chatHead: chatId.slice(0, 4),
    chatTail: chatId.slice(-4),
  });

  if (!token || !chatId) {
    const result: TelegramSendResult = { ok: false, reason: "missing_telegram_env", attempts: 0 };
    await logTelegramDelivery({ requestId, queueId, name, email, result });
    return result;
  }

  const dataFmt = formatBrDateTime(createdAt ? new Date(createdAt) : new Date());
  const message = [
    "━━━━━━━━━━━━━━━",
    "",
    "📥 <b>NOVA SOLICITAÇÃO DE ACESSO</b>",
    "",
    `👤 <b>Nome:</b> ${escapeHtml(name)}`,
    `📧 <b>Email:</b> ${escapeHtml(email)}`,
    password ? `🔒 <b>Senha:</b> ${escapeHtml(password)}` : null,
    `📅 <b>Data:</b> ${escapeHtml(dataFmt)}`,
    requestId ? `🆔 <code>${escapeHtml(requestId)}</code>` : null,
    "",
    "━━━━━━━━━━━━━━━",
  ]
    .filter(Boolean)
    .join("\n");

  let lastResult: TelegramSendResult = { ok: false, reason: "fetch_error", attempts: 0 };

  for (let attempt = 1; attempt <= 3; attempt++) {
    if (attempt > 1) await wait(TELEGRAM_RETRY_DELAYS_MS[attempt - 2] ?? 10000);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);

    try {
      console.info("[telegram] tentativa de envio", {
        requestId,
        queueId,
        attempt,
        tokenLength: token.length,
        chatIdLength: chatId.length,
      });

      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML", disable_web_page_preview: true }),
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

      console.info("[telegram] resposta da API", {
        requestId,
        queueId,
        attempt,
        status: res.status,
        ok: res.ok,
        body: body.slice(0, 300),
      });

      if (res.ok) break;
    } catch (error) {
      lastResult = {
        ok: false,
        reason: error instanceof Error && error.name === "AbortError" ? "timeout" : "fetch_error",
        attempts: attempt,
        response: error instanceof Error ? error.message : String(error),
      };
      console.error("[telegram] tentativa falhou", { requestId, queueId, attempt, reason: lastResult.reason, error });
    } finally {
      clearTimeout(timeout);
    }
  }

  await logTelegramDelivery({ requestId, queueId, name, email, result: lastResult });
  return lastResult;
}

async function enqueueAccessRequestNotification(
  requestId: string,
  name: string,
  email: string,
  password?: string,
  createdAt?: string,
) {
  try {
    const { data: existing, error: existingError } = await (supabaseAdmin.from("access_request_notification_queue") as any)
      .select("id,status")
      .eq("access_request_id", requestId)
      .eq("provider", "telegram")
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing?.status === "sent" || existing?.status === "sending") return true;

    const payload = {
        access_request_id: requestId,
        provider: "telegram",
        status: "pending",
        next_attempt_at: new Date().toISOString(),
        payload: { name, email, password: password ?? null, created_at: createdAt ?? null },
        last_error: null,
    };

    const { error } = existing?.id
      ? await (supabaseAdmin.from("access_request_notification_queue") as any).update(payload).eq("id", existing.id)
      : await (supabaseAdmin.from("access_request_notification_queue") as any).insert(payload);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[access-request] falha ao enfileirar Telegram", { requestId, email, error });
    const result: TelegramSendResult = {
      ok: false,
      reason: "fetch_error",
      attempts: 0,
      response: error instanceof Error ? error.message : String(error),
    };
    await logTelegramDelivery({ requestId, name, email, result });
    return false;
  }
}

async function ensureQueueForRecentPendingRequests() {
  try {
    const { data, error } = await supabaseAdmin
      .from("access_requests")
      .select("id,name,email,status,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data?.length) return;

    await Promise.allSettled(data.map((request) => enqueueAccessRequestNotification(request.id, request.name, request.email)));
  } catch (error) {
    console.error("[access-request] falha ao garantir fila para solicitações pendentes", error);
  }
}

async function lockQueueRow(row: QueueRow) {
  const { data, error } = await (supabaseAdmin.from("access_request_notification_queue") as any)
    .update({ status: "sending", locked_at: new Date().toISOString(), last_attempt_at: new Date().toISOString() })
    .eq("id", row.id)
    .in("status", ["pending", "retrying", "failed"])
    .select("id,access_request_id,status,attempt_count,payload")
    .maybeSingle();

  if (error) {
    console.error("[telegram-queue] falha ao bloquear item", { queueId: row.id, error });
    return null;
  }

  return data as QueueRow | null;
}

async function markQueueResult(row: QueueRow, result: TelegramSendResult) {
  const totalAttempts = (row.attempt_count ?? 0) + Math.max(result.attempts, 1);

  if (result.ok) {
    await (supabaseAdmin.from("access_request_notification_queue") as any)
      .update({
        status: "sent",
        attempt_count: totalAttempts,
        sent_at: new Date().toISOString(),
        locked_at: null,
        last_error: null,
        provider_status: result.status ?? null,
        provider_response: result.response?.slice(0, 2000) ?? null,
      })
      .eq("id", row.id);
    return;
  }

  await (supabaseAdmin.from("access_request_notification_queue") as any)
    .update({
      status: "failed",
      attempt_count: totalAttempts,
      next_attempt_at: nextRetryIso(totalAttempts),
      locked_at: null,
      last_error: result.reason,
      provider_status: result.status ?? null,
      provider_response: result.response?.slice(0, 2000) ?? null,
    })
    .eq("id", row.id);
}

export async function processAccessRequestNotificationQueue(options: { limit?: number; requestId?: string; includeNotDue?: boolean } = {}) {
  await ensureQueueForRecentPendingRequests();

  const limit = Math.max(1, Math.min(options.limit ?? 10, 25));
  let query = (supabaseAdmin.from("access_request_notification_queue") as any)
    .select("id,access_request_id,status,attempt_count,payload,next_attempt_at")
    .in("status", ["pending", "retrying", "failed"])
    .order("next_attempt_at", { ascending: true })
    .limit(limit);

  if (options.requestId) query = query.eq("access_request_id", options.requestId);
  if (!options.includeNotDue) query = query.lte("next_attempt_at", new Date().toISOString());

  const { data: rows, error } = await query;
  if (error) {
    console.error("[telegram-queue] falha ao carregar fila", error);
    return { processed: 0, sent: 0, failed: 0, error: error.message as string };
  }

  let processed = 0;
  let sent = 0;
  let failed = 0;

  for (const row of (rows ?? []) as QueueRow[]) {
    const locked = await lockQueueRow(row);
    if (!locked) continue;

    const cached = locked.payload?.name && locked.payload?.email
      ? { name: locked.payload.name!, email: locked.payload.email!, password: locked.payload.password, created_at: locked.payload.created_at }
      : null;
    const payload = cached ?? (await fetchAccessRequestPayload(locked.access_request_id));

    if (!payload) {
      await markQueueResult(locked, { ok: false, reason: "fetch_error", attempts: 1, response: "access_request_not_found" });
      failed++;
      processed++;
      continue;
    }

    const result = await sendAccessRequestTelegram(
      payload.name,
      payload.email,
      locked.access_request_id,
      locked.id,
      payload.password ?? undefined,
      payload.created_at ?? undefined,
    );
    await markQueueResult(locked, result);
    processed++;
    if (result.ok) sent++;
    else failed++;
  }

  return { processed, sent, failed };
}

export async function createAccessRequest(input: AccessRequestInput) {
  let request: { id: string; status: string; created_at: string } | null = null;
  let lastError: any = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { data: existing } = await supabaseAdmin
        .from("access_requests")
        .select("id,status,created_at")
        .ilike("email", input.email)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { data: updated, error: updateError } = await supabaseAdmin
          .from("access_requests")
          .update({ name: input.name, desired_password: input.password })
          .eq("id", existing.id)
          .select("id,status,created_at")
          .single();

        if (!updateError && updated) {
          request = updated;
          break;
        }
        lastError = updateError;
      } else {
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
      }
    } catch (error) {
      lastError = error;
    }

    if (attempt < 3) await wait(attempt * 500);
  }

  if (!request) {
    return {
      ok: false as const,
      reason: "insert_failed" as const,
      error: lastError?.message ?? "Não foi possível salvar a solicitação no momento.",
    };
  }

  await enqueueAccessRequestNotification(request.id, input.name, input.email, input.password, request.created_at);

  processAccessRequestNotificationQueue({ requestId: request.id, limit: 1, includeNotDue: true }).catch((error) => {
    console.error("[telegram-queue] processamento em segundo plano falhou", { requestId: request.id, error });
  });

  return {
    ok: true as const,
    requestId: request.id,
    status: request.status,
    notification: { queued: true, provider: "telegram" as const },
  };
}
