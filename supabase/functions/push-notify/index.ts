import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildPushHTTPRequest } from "npm:@pushforge/builder@2.0.5";

const PRINCIPAL_ADMIN_EMAIL = "pastororxiamorim@gmail.com";
const VAPID_PUBLIC_KEY = "BO_lrjJGy9nSOdiN5zsaQwMPZa8ine1JBQiCjrKrNWKFgPt34Bq9YFN0vuaYZS3z0JTEXoG-7nTsQSMBgAQy6Zk";

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function getPrivateJwk(secret: string): JsonWebKey {
  const trimmed = secret.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const publicBytes = base64UrlDecode(VAPID_PUBLIC_KEY);
  if (publicBytes.length !== 65 || publicBytes[0] !== 4) throw new Error("Invalid VAPID public key");
  return {
    kty: "EC",
    crv: "P-256",
    x: base64UrlEncode(publicBytes.slice(1, 33)),
    y: base64UrlEncode(publicBytes.slice(33, 65)),
    d: trimmed,
    ext: true,
  };
}

async function readBody(req: Request) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!serviceRoleKey || !authHeader.includes(serviceRoleKey)) return new Response("Unauthorized", { status: 401 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  if (!supabaseUrl || !vapidPrivateKey) {
    return new Response(JSON.stringify({ sent: 0, reason: "missing_env" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const body = await readBody(req);
  const { name, email, type, title: customTitle, message: customMessage, requestId } = body;
  if (type !== "access_request" && type !== "test") {
    return new Response(JSON.stringify({ sent: 0, reason: "unknown_type" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id,email,name")
    .ilike("email", PRINCIPAL_ADMIN_EMAIL)
    .maybeSingle();

  if (!adminProfile?.id) {
    return new Response(JSON.stringify({ sent: 0, reason: "principal_admin_profile_not_found" }), { headers: { "Content-Type": "application/json" } });
  }

  const { data: adminRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", adminProfile.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!adminRole) {
    return new Response(JSON.stringify({ sent: 0, reason: "principal_admin_not_marked_admin", adminUserId: adminProfile.id }), { headers: { "Content-Type": "application/json" } });
  }

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", adminProfile.id)
    .order("last_saved_at", { ascending: false });

  if (!subscriptions?.length) {
    await supabase.from("push_notification_logs").insert({
      user_id: adminProfile.id,
      notification_type: type,
      title: customTitle || "Push não enviado",
      body: "Nenhum token/assinatura push do administrador está salvo no banco.",
      status: "no_subscription",
      provider: "web_push",
      metadata: { requestId, adminEmail: PRINCIPAL_ADMIN_EMAIL },
    });
    return new Response(JSON.stringify({ sent: 0, attempted: 0, reason: "no_admin_subscription", adminUserId: adminProfile.id }), { headers: { "Content-Type": "application/json" } });
  }

  const notificationId = crypto.randomUUID();
  const payload = type === "test"
    ? {
        title: customTitle || "🔔 Teste de Push Notification",
        body: customMessage || "Teste real enviado para o dispositivo administrador.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: "/admin", notificationId, type },
      }
    : {
        title: "Novo pedido de acesso",
        body: `${name} (${email}) solicitou acesso ao aplicativo.`,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: "/admin", notificationId, requestId, type },
      };

  const privateJWK = getPrivateJwk(vapidPrivateKey);
  const results: Array<{ id: string; endpoint: string; status: number; ok: boolean; response: string }> = [];

  for (const sub of subscriptions) {
    let status = 0;
    let responseText = "";
    let logStatus = "failed";
    try {
      const pushRequest = await buildPushHTTPRequest({
        privateJWK,
        subscription: { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        message: { payload, adminContact: `mailto:${PRINCIPAL_ADMIN_EMAIL}`, options: { ttl: 86400, urgency: "high" } },
      });
      const resp = await fetch(pushRequest.endpoint, { method: "POST", headers: pushRequest.headers, body: pushRequest.body });
      status = resp.status;
      responseText = await resp.text().catch(() => "");
      logStatus = resp.ok ? "sent" : "rejected";
      results.push({ id: sub.id, endpoint: sub.endpoint, status, ok: resp.ok, response: responseText });
      if (status === 404 || status === 410) await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      await supabase.from("push_notification_logs").insert({
        id: notificationId,
        user_id: adminProfile.id,
        notification_type: type,
        title: payload.title,
        body: payload.body,
        target_endpoint: sub.endpoint,
        status: logStatus,
        provider: sub.endpoint.includes("fcm.googleapis.com") ? "fcm_web_push" : "web_push",
        provider_status: status,
        provider_response: responseText,
        metadata: { requestId, adminEmail: PRINCIPAL_ADMIN_EMAIL, deviceInfo: sub.device_info ?? {} },
      });
    } catch (err) {
      responseText = err instanceof Error ? err.message : String(err);
      results.push({ id: sub.id, endpoint: sub.endpoint, status: 0, ok: false, response: responseText });
      await supabase.from("push_notification_logs").insert({
        user_id: adminProfile.id,
        notification_type: type,
        title: payload.title,
        body: payload.body,
        target_endpoint: sub.endpoint,
        status: "error",
        provider: sub.endpoint.includes("fcm.googleapis.com") ? "fcm_web_push" : "web_push",
        provider_status: 0,
        error_message: responseText,
        metadata: { requestId, adminEmail: PRINCIPAL_ADMIN_EMAIL },
      });
      await supabase.from("push_subscriptions").update({ last_error: responseText }).eq("id", sub.id);
    }
  }

  return new Response(JSON.stringify({
    sent: results.filter((r) => r.ok).length,
    attempted: results.length,
    reason: results.some((r) => r.ok) ? "sent" : "all_failed",
    adminUserId: adminProfile.id,
    onlyPrincipalAdmin: true,
    results,
  }), { headers: { "Content-Type": "application/json" } });
});
