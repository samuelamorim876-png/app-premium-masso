import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function invokePushNotify(payload: Record<string, unknown>) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[push] Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return { sent: 0, reason: "missing_env" as const };
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
    try { parsed = JSON.parse(text); } catch {}
    if (!res.ok) {
      console.error("[push] push-notify edge function failed", res.status, text);
      return { sent: 0, reason: `edge_${res.status}` as const, detail: text };
    }
    return { sent: parsed.sent ?? 0, reason: "sent" as const, detail: parsed };
  } catch (err) {
    console.error("[push] fetch error", err);
    return { sent: 0, reason: "fetch_error" as const };
  }
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
      name: data.name,
      email: data.email,
    });
  });

export const sendTestAdminPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) {
      return { sent: 0, reason: "not_admin" as const };
    }
    return invokePushNotify({
      type: "test",
      title: "🔔 Teste de notificação",
      message: "Se você recebeu isto, suas notificações de admin estão ativas.",
    });
  });
