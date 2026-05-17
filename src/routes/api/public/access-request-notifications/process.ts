import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { processAccessRequestNotificationQueue } from "@/lib/access-request.server";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function isAuthorized(request: Request) {
  const expected = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!expected) return false;
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  return !!token && safeEqual(token, expected.trim());
}

async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const result = await processAccessRequestNotificationQueue({ limit: 10 });
  return Response.json({ ok: true, ...result });
}

export const Route = createFileRoute("/api/public/access-request-notifications/process")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
