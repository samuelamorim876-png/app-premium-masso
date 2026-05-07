
CREATE TABLE public.access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  desired_password TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public signup request)
CREATE POLICY "Anyone can submit access request"
ON public.access_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view requests
CREATE POLICY "Admins can view access requests"
ON public.access_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update requests (approve/reject)
CREATE POLICY "Admins can update access requests"
ON public.access_requests
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete requests
CREATE POLICY "Admins can delete access requests"
ON public.access_requests
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
