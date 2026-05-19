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
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

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
        desired_password: data.password,
      });
    } else {
      await supabaseAdmin
        .from("profiles")
        .update({
          is_active: true,
          name: data.name,
          email: data.email,
          desired_password: data.password,
        })
        .eq("id", userId);
    }

    await supabaseAdmin
      .from("access_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.requestId);

    return { success: true, userId };
  });

export const createStudentDirect = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(255),
        password: z.string().min(6).max(72),
        premium: z.boolean().optional(),
        markBuyer: z.boolean().optional(),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const email = data.email.toLowerCase();

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: data.password,
        email_confirm: true,
        user_metadata: { name: data.name },
      });

    if (authError) {
      throw new Error(`Erro ao criar usuário: ${authError.message}`);
    }

    const userId = authData.user.id;

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    const profileData = {
      id: userId,
      name: data.name,
      email,
      is_active: true,
      premium_access: !!data.premium,
      desired_password: data.password,
    };

    if (!existingProfile) {
      await supabaseAdmin.from("profiles").insert(profileData);
    } else {
      await supabaseAdmin.from("profiles").update(profileData).eq("id", userId);
    }

    if (data.markBuyer) {
      await supabaseAdmin
        .from("official_buyers")
        .upsert(
          { email, name: data.name, source: "manual_admin" },
          { onConflict: "email", ignoreDuplicates: false }
        );
    }

    return { success: true, userId };
  });

export const updateStudentPassword = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        userId: z.string().uuid(),
        password: z.string().min(6).max(72),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      data.userId,
      { password: data.password }
    );
    if (error) throw new Error(`Erro ao atualizar senha: ${error.message}`);

    await supabaseAdmin
      .from("profiles")
      .update({ desired_password: data.password })
      .eq("id", data.userId);

    return { success: true };
  });
