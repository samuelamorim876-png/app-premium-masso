import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Eventos que devem bloquear o usuário
const BLOCK_EVENTS = new Set([
  // Genéricos
  "refund",
  "refunded",
  "cancel",
  "canceled",
  "cancelled",
  "cancellation",
  "chargeback",
  "dispute",
  "reversal",
  "estorno",
  // Stripe
  "charge.refunded",
  "charge.dispute.created",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  // Hotmart
  "purchase_refunded",
  "purchase_chargeback",
  "purchase_canceled",
  "subscription_cancellation",
  // Monetizze / Eduzz / AppMax
  "venda_reembolsada",
  "venda_estornada",
  "assinatura_cancelada",
  "order.refunded",
  "order.canceled",
  "subscription.canceled",
]);

function extractEmail(payload: any): string | null {
  if (!payload || typeof payload !== "object") return null;
  // Tenta vários campos comuns
  const candidates = [
    payload.email,
    payload.customer_email,
    payload.buyer_email,
    payload?.customer?.email,
    payload?.buyer?.email,
    payload?.data?.buyer?.email,
    payload?.data?.customer?.email,
    payload?.data?.object?.customer_email,
    payload?.data?.object?.receipt_email,
    payload?.data?.object?.billing_details?.email,
    payload?.Customer?.email,
    payload?.user?.email,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.includes("@")) return c.toLowerCase().trim();
  }
  return null;
}

function extractEventType(payload: any, headers: Headers): string {
  return (
    payload?.event ||
    payload?.type ||
    payload?.event_type ||
    payload?.action ||
    payload?.status ||
    headers.get("x-event-type") ||
    "unknown"
  )
    .toString()
    .toLowerCase();
}

function extractProvider(payload: any, headers: Headers): string {
  if (headers.get("stripe-signature")) return "stripe";
  if (headers.get("x-hotmart-hottok") || payload?.hottok) return "hotmart";
  if (payload?.token_postback) return "monetizze";
  if (payload?.appmax_event || payload?.event?.includes?.("appmax")) return "appmax";
  return (payload?.provider || headers.get("x-provider") || "unknown").toString();
}

function findHeaderCaseInsensitive(headers: Headers, name: string): string | null {
  const target = name.toLowerCase();
  for (const [k, v] of headers.entries()) {
    if (k.toLowerCase() === target) return v;
  }
  return null;
}

function getMivvoToken(headers: Headers): string | null {
  // Tenta variações: x-mivvo-token, mivvo-token, authorization: Bearer ...
  return (
    findHeaderCaseInsensitive(headers, "x-mivvo-token") ||
    findHeaderCaseInsensitive(headers, "mivvo-token") ||
    findHeaderCaseInsensitive(headers, "x-mivvo-webhook-token") ||
    null
  );
}

function verifySignature(rawBody: string, headers: Headers): { ok: boolean; reason?: string } {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  const mivvoToken = process.env.MIVVO_WEBHOOK_TOKEN;
  const mivvoHeader = getMivvoToken(headers);

  if (mivvoToken) {
    if (!mivvoHeader) return { ok: false, reason: "missing_x_mivvo_token_header" };
    if (mivvoHeader.trim().toLowerCase() === mivvoToken.trim().toLowerCase()) return { ok: true };
    // ainda tenta secret abaixo
  }

  if (mivvoHeader && secret && mivvoHeader.trim().toLowerCase() === secret.trim().toLowerCase()) {
    return { ok: true };
  }

  if (secret) {
    const direct = findHeaderCaseInsensitive(headers, "x-webhook-secret");
    if (direct && direct.trim() === secret.trim()) return { ok: true };

    const sig =
      findHeaderCaseInsensitive(headers, "x-webhook-signature") ||
      findHeaderCaseInsensitive(headers, "x-signature") ||
      findHeaderCaseInsensitive(headers, "x-hub-signature-256")?.replace(/^sha256=/, "");

    if (sig) {
      const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
      try {
        const a = Buffer.from(sig);
        const b = Buffer.from(expected);
        if (a.length === b.length && timingSafeEqual(a, b)) return { ok: true };
      } catch {
        /* ignore */
      }
      return { ok: false, reason: "signature_mismatch" };
    }
  }

  if (!mivvoToken && !secret) {
    // nenhuma config — modo aberto
    return { ok: true };
  }

  return { ok: false, reason: mivvoHeader ? "token_mismatch" : "no_credentials_provided" };
}

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token.trim()}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch {
    /* silent */
  }
}

async function handle(request: Request) {
  const rawBody = await request.text();
  let payload: any = {};
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    payload = { raw: rawBody };
  }

  const headers = request.headers;
  const provider = extractProvider(payload, headers);
  const eventType = extractEventType(payload, headers);
  const email = extractEmail(payload);

  // Validação de segurança
  if (!verifySignature(rawBody, headers)) {
    await supabaseAdmin.from("payment_webhook_logs").insert({
      provider,
      event_type: eventType,
      email,
      action: "rejected",
      status: "unauthorized",
      raw_payload: payload,
      error_message: "Token inválido ou ausente (X-Mivvo-Token)",
    });
    return new Response(
      JSON.stringify({ ok: false, error: "unauthorized", message: "X-Mivvo-Token inválido ou ausente" }),
      { status: 401, headers: { "Content-Type": "application/json", ...CORS } }
    );
  }

  const shouldBlock = BLOCK_EVENTS.has(eventType) || /refund|cancel|chargeback|estorno|reversal|dispute/i.test(eventType);

  let userId: string | null = null;
  let action = "ignored";
  let errorMessage: string | null = null;

  if (shouldBlock && email) {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, name, email")
      .ilike("email", email)
      .maybeSingle();

    if (error) {
      errorMessage = error.message;
    } else if (profile) {
      userId = profile.id;
      const { error: updErr } = await supabaseAdmin
        .from("profiles")
        .update({ is_active: false })
        .eq("id", profile.id);
      if (updErr) {
        errorMessage = updErr.message;
        action = "block_failed";
      } else {
        action = "blocked";
        await sendTelegram(
          `🚫 Acesso bloqueado automaticamente\n\nNome: ${profile.name}\nEmail: ${profile.email}\nMotivo: ${eventType}\nProvedor: ${provider}`
        );
      }
    } else {
      action = "user_not_found";
    }
  } else if (shouldBlock && !email) {
    action = "missing_email";
  }

  await supabaseAdmin.from("payment_webhook_logs").insert({
    provider,
    event_type: eventType,
    email,
    user_id: userId,
    action,
    status: errorMessage ? "error" : "ok",
    raw_payload: payload,
    error_message: errorMessage,
  });

  return new Response(
    JSON.stringify({ ok: true, received: true, event: eventType, provider, email, action }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS } }
  );
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Mivvo-Token, X-Webhook-Secret, X-Webhook-Signature, X-Hub-Signature-256, X-Signature",
  "Access-Control-Max-Age": "86400",
};

export const Route = createFileRoute("/api/public/webhook/payment")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => handle(request),
      GET: async () =>
        new Response(
          JSON.stringify({ ok: true, status: "online", endpoint: "payment-webhook", methods: ["POST"] }),
          { status: 200, headers: { "Content-Type": "application/json", ...CORS } }
        ),
    },
  },
});

