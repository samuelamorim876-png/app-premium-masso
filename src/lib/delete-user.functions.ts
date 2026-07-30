import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const deleteAuthUser = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ userId: z.string().uuid() }).parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // Delete profile first (cascade won't help since profiles.id references auth.users)
    await supabaseAdmin.from("profiles").delete().eq("id", data.userId);

    // Delete the auth user — this fully removes them from the system
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) {
      throw new Error(`Erro ao excluir usuário: ${error.message}`);
    }

    return { success: true };
  });
