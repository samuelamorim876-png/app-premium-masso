import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_EMAIL = "pastororxiamorim@gmail.com";
const VAPID_PUBLIC_KEY = "BO_lrjJGy9nSOdiN5zsaQwMPZa8ine1JBQiCjrKrNWKFgPt34Bq9YFN0vuaYZS3z0JTEXoG-7nTsQSMBgAQy6Zk";

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
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    if (!vapidPrivateKey) {
      console.error("[push] VAPID_PRIVATE_KEY is not configured");
      return { sent: 0, reason: "missing_vapid_private_key" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: request, error: requestError } = await supabaseAdmin
      .from("access_requests")
      .select("id,email,status,created_at")
      .eq("id", data.requestId)
      .eq("email", data.email)
      .maybeSingle();

    if (requestError || !request || request.status !== "pending") {
      console.error("[push] Access request validation failed", requestError);
      return { sent: 0, reason: "invalid_access_request" };
    }

    const { data: adminProfile } = await supabaseAdmin
      .from("profiles")
      .select("id,email")
      .eq("email", ADMIN_EMAIL)
      .maybeSingle();

    if (!adminProfile?.id) return { sent: 0, reason: "admin_profile_not_found" };

    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("user_id", adminProfile.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) return { sent: 0, reason: "admin_role_not_found" };

    const { data: subscriptions } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id,endpoint,p256dh,auth_key")
      .eq("user_id", adminProfile.id);

    if (!subscriptions?.length) return { sent: 0, reason: "no_admin_push_subscription" };

    const webPushModule = await import("web-push");
    const webPush = webPushModule.default ?? webPushModule;
    webPush.setVapidDetails(`mailto:${ADMIN_EMAIL}`, VAPID_PUBLIC_KEY, vapidPrivateKey);

    const payload = JSON.stringify({
      title: "Novo pedido de acesso",
      body: `${data.name} (${data.email}) solicitou acesso ao aplicativo.`,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: "/admin" },
    });

    let sent = 0;
    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          payload,
          { TTL: 86400 }
        );
        sent += 1;
      } catch (error: any) {
        console.error("[push] Failed to send notification", error?.statusCode ?? error?.message ?? error);
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }

    return { sent, reason: sent > 0 ? "sent" : "delivery_failed" };
  });