import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const approveAccessRequest = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        requestId: z.string(),
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    // Dynamic import to keep server-only code out of client bundle
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // 1. Create auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { name: data.name },
      });

    if (authError) {
      throw new Error(`Erro ao criar usuário: ${authError.message}`);
    }

    const userId = authData.user.id;

    // 2. Ensure profile exists (trigger may have created it, but let's be safe)
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existingProfile) {
      await supabaseAdmin.from("profiles").insert({
        id: userId,
        name: data.name,
        email: data.email,
        is_active: true,
      });
    } else {
      await supabaseAdmin
        .from("profiles")
        .update({ is_active: true, name: data.name, email: data.email })
        .eq("id", userId);
    }

    // 3. Update access request status
    await supabaseAdmin
      .from("access_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.requestId);

    return { success: true, userId };
  });
