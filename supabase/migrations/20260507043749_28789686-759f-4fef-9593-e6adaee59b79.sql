-- Revoke execute from anon and authenticated on the trigger function
REVOKE EXECUTE ON FUNCTION public.notify_new_access_request() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_new_access_request() FROM authenticated;