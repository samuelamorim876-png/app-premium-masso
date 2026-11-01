-- The Telegram/push notification for access requests is sent directly by the app server.
-- This trigger depended on an extension that is not installed and always silently failed.
DROP TRIGGER IF EXISTS on_new_access_request ON public.access_requests;
DROP FUNCTION IF EXISTS public.notify_new_access_request();