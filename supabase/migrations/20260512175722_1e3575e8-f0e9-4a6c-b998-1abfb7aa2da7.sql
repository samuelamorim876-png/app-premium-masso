
-- Official buyers list
CREATE TABLE public.official_buyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  source text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE INDEX idx_official_buyers_email ON public.official_buyers (lower(email));

ALTER TABLE public.official_buyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage official buyers" ON public.official_buyers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Settings (singleton)
CREATE TABLE public.verification_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  auto_block_unverified boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.verification_settings (id, auto_block_unverified) VALUES (1, false);

ALTER TABLE public.verification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage verification settings" ON public.verification_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated read verification settings" ON public.verification_settings
  FOR SELECT TO authenticated
  USING (true);

-- Helper: check official buyer
CREATE OR REPLACE FUNCTION public.is_official_buyer(_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.official_buyers
    WHERE lower(email) = lower(coalesce(_email, ''))
  )
$$;

-- Trigger: auto-block new profile if not an official buyer and auto-block enabled
CREATE OR REPLACE FUNCTION public.auto_block_unverified_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _auto boolean;
BEGIN
  SELECT auto_block_unverified INTO _auto FROM public.verification_settings WHERE id = 1;
  IF coalesce(_auto, false) = true AND NEW.email IS NOT NULL THEN
    IF NOT public.is_official_buyer(NEW.email) THEN
      NEW.is_active := false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_block_unverified_profile
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_block_unverified_profile();

-- Trigger: when buyer added, reactivate matching profile
CREATE OR REPLACE FUNCTION public.reactivate_profile_on_buyer_add()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
    SET is_active = true
    WHERE lower(email) = lower(NEW.email) AND is_active = false;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reactivate_profile_on_buyer_add
  AFTER INSERT ON public.official_buyers
  FOR EACH ROW
  EXECUTE FUNCTION public.reactivate_profile_on_buyer_add();
