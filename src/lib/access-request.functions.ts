import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createAccessRequest } from "./access-request.server";

export const submitAccessRequestAndNotify = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(180),
        password: z.string().min(6).max(120),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    try {
      console.info("[access-request] envio iniciado", { email: data.email });
      const result = await createAccessRequest(data);
      console.info("[access-request] envio finalizado", {
        ok: result.ok,
        requestId: result.ok ? result.requestId : undefined,
        notificationQueued: result.ok ? result.notification?.queued : undefined,
        notificationProvider: result.ok ? result.notification?.provider : undefined,
        reason: result.ok ? undefined : result.reason,
      });
      return result;
    } catch (error) {
      console.error("[access-request] erro inesperado isolado", error);
      return {
        ok: false as const,
        reason: "unexpected" as const,
        error: "Servidor temporariamente ocupado. Tente novamente em instantes.",
      };
    }
  });