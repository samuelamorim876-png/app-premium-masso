import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PRINCIPAL_ADMIN_EMAIL = "pastororxiamorim@gmail.com";

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [A-Z ]+-----/g, "")
    .replace(/-----END [A-Z ]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(b64);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf.buffer;
}

async function getFcmAccessToken(serviceAccount: any): Promise<{ accessToken: string; projectId: string }> {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const header = { alg: "RS256", typ: "JWT" };
  const unsignedJwt = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claims))}`;

  const keyBuf = pemToArrayBuffer(serviceAccount.private_key);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuf,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(unsignedJwt));
  const jwt = `${unsignedJwt}.${base64UrlEncode(new Uint8Array(sigBuf))}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok || !tokenJson.access_token) {
    throw new Error(`oauth_failed: ${tokenRes.status} ${JSON.stringify(tokenJson)}`);
  }
  return { accessToken: tokenJson.access_token, projectId: serviceAccount.project_id };
}

async function readBody(req: Request) {
  try { return await req.json(); } catch { return {}; }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceAccountRaw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
  const authHeader = req.headers.get("Authorization") ?? "";

  if (!serviceRoleKey || !authHeader.includes(serviceRoleKey)) {
    return new Response(JSON.stringify({ sent: 0, reason: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  if (!supabaseUrl || !serviceAccountRaw) {
    return new Response(JSON.stringify({ sent: 0, reason: "missing_env", missing: { supabaseUrl: !supabaseUrl, serviceAccount: !serviceAccountRaw } }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  let serviceAccount: any;
  try {
    serviceAccount = JSON.parse(serviceAccountRaw);
    if (!serviceAccount.private_key || !serviceAccount.client_email || !serviceAccount.project_id) {
      throw new Error("incomplete service account");
    }
  } catch (err) {
    return new Response(JSON.stringify({ sent: 0, reason: "invalid_service_account", error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const body = await readBody(req);
  const { type, name, email, requestId, title: customTitle, message: customMessage } = body;
  if (type !== "access_request" && type !== "test") {
    return new Response(JSON.stringify({ sent: 0, reason: "unknown_type" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Send Telegram notification (independent of FCM)
  if (type === "access_request" || type === "test") {
    const tgToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const tgChatId = Deno.env.get("TELEGRAM_CHAT_ID");
    if (tgToken && tgChatId) {
      try {
        const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
        const text =
          type === "test"
            ? `🔔 *Teste de notificação*\nEnviado em: ${now}`
            : `🆕 *Nova solicitação de acesso*\n\n*Nome:* ${name ?? "—"}\n*Email:* ${email ?? "—"}\n*Data:* ${now}\n*Status:* Pendente`;
        const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: tgChatId, text, parse_mode: "Markdown" }),
        });
        const tgBody = await tgRes.text();
        console.log("[telegram] status", tgRes.status, tgBody.slice(0, 300));
      } catch (err) {
        console.error("[telegram] erro:", err);
      }
    } else {
      console.warn("[telegram] TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID ausente");
    }
  }

  // Find the principal admin
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id,email")
    .ilike("email", PRINCIPAL_ADMIN_EMAIL)
    .maybeSingle();

  if (!adminProfile?.id) {
    return new Response(JSON.stringify({ sent: 0, reason: "principal_admin_profile_not_found" }), { headers: { "Content-Type": "application/json" } });
  }
  const adminUserId = adminProfile.id;

  const { data: adminRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", adminUserId)
    .eq("role", "admin")
    .maybeSingle();
  if (!adminRole) {
    return new Response(JSON.stringify({ sent: 0, reason: "principal_admin_not_marked_admin", adminUserId }), { headers: { "Content-Type": "application/json" } });
  }

  const { data: subs, error: subsErr } = await supabase
    .from("push_subscriptions")
    .select("id, fcm_token, device_label, device_info")
    .eq("user_id", adminUserId)
    .not("fcm_token", "is", null);

  if (subsErr) console.error("[push] erro ao ler tokens:", subsErr);

  const tokens = (subs ?? []).filter((s: any) => s.fcm_token);
  if (!tokens.length) {
    await supabase.from("push_notification_logs").insert({
      user_id: adminUserId,
      notification_type: type,
      title: customTitle || "Push não enviado",
      body: "Nenhum token FCM registrado para o administrador. Abra o painel admin e clique no sino para ativar.",
      status: "no_subscription",
      provider: "fcm_v1",
      metadata: { requestId, adminEmail: PRINCIPAL_ADMIN_EMAIL },
    });
    return new Response(JSON.stringify({ sent: 0, attempted: 0, reason: "no_admin_fcm_token", adminUserId }), { headers: { "Content-Type": "application/json" } });
  }

  let accessToken: string;
  let projectId: string;
  try {
    const t = await getFcmAccessToken(serviceAccount);
    accessToken = t.accessToken;
    projectId = t.projectId;
    console.log("[push] OAuth token obtido, projectId:", projectId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await supabase.from("push_notification_logs").insert({
      user_id: adminUserId,
      notification_type: type,
      title: customTitle || "Push não enviado",
      body: "Falha ao obter access token do Firebase.",
      status: "error",
      provider: "fcm_v1",
      error_message: msg,
      metadata: { requestId, adminEmail: PRINCIPAL_ADMIN_EMAIL },
    });
    return new Response(JSON.stringify({ sent: 0, reason: "oauth_failed", error: msg }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const notification =
    type === "test"
      ? {
          title: customTitle || "🔔 Teste de Push Notification",
          body: customMessage || "Teste real enviado para o dispositivo administrador via FCM.",
        }
      : {
          title: "Novo pedido de acesso",
          body: `${name ?? "Aluno"} (${email ?? "—"}) solicitou acesso ao aplicativo.`,
        };

  const dataPayload = {
    url: "/admin",
    type,
    requestId: requestId ?? "",
    title: notification.title,
    body: notification.body,
  };

  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  const results: any[] = [];

  for (const sub of tokens) {
    const message = {
      message: {
        token: sub.fcm_token,
        notification,
        data: dataPayload,
        webpush: {
          headers: { Urgency: "high", TTL: "86400" },
          notification: {
            ...notification,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            requireInteraction: true,
            tag: type,
          },
          fcm_options: { link: "/admin" },
        },
        android: { priority: "HIGH", notification: { click_action: "/admin" } },
      },
    };

    const resp = await fetch(fcmUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    const respText = await resp.text();
    console.log("[push] FCM response", resp.status, respText.slice(0, 400));

    const ok = resp.ok;
    const status = resp.status;

    await supabase.from("push_notification_logs").insert({
      user_id: adminUserId,
      notification_type: type,
      title: notification.title,
      body: notification.body,
      target_endpoint: sub.fcm_token,
      status: ok ? "sent" : "rejected",
      provider: "fcm_v1",
      provider_status: status,
      provider_response: respText.slice(0, 2000),
      metadata: { requestId, deviceLabel: sub.device_label, adminEmail: PRINCIPAL_ADMIN_EMAIL },
    });

    if (status === 404 || status === 400) {
      // Likely "UNREGISTERED" or invalid — clean it up
      if (respText.includes("UNREGISTERED") || respText.includes("INVALID_ARGUMENT") || respText.includes("registration-token-not-registered")) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
    if (!ok) {
      await supabase.from("push_subscriptions").update({ last_error: respText.slice(0, 500) }).eq("id", sub.id);
    }

    results.push({ id: sub.id, status, ok, response: respText.slice(0, 500) });
  }

  const sent = results.filter((r) => r.ok).length;
  return new Response(
    JSON.stringify({
      sent,
      attempted: results.length,
      reason: sent > 0 ? "sent" : "all_failed",
      adminUserId,
      projectId,
      results,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
