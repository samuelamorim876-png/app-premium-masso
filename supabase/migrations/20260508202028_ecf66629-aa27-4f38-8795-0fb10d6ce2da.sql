-- Course XP Discounts configuration (admin-managed)
CREATE TABLE public.course_xp_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL UNIQUE REFERENCES public.managed_courses(id) ON DELETE CASCADE,
  xp_required INTEGER NOT NULL DEFAULT 1000,
  discount_percent INTEGER NOT NULL DEFAULT 20,
  discount_link TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.course_xp_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view discounts"
  ON public.course_xp_discounts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage discounts"
  ON public.course_xp_discounts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_course_xp_discounts_updated_at
  BEFORE UPDATE ON public.course_xp_discounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User XP redemptions history
CREATE TABLE public.user_xp_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.managed_courses(id) ON DELETE CASCADE,
  xp_spent INTEGER NOT NULL,
  discount_percent INTEGER NOT NULL,
  discount_link TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_xp_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
  ON public.user_xp_redemptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions"
  ON public.user_xp_redemptions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Daily login streaks
CREATE TABLE public.daily_login_streaks (
  user_id UUID NOT NULL PRIMARY KEY,
  current_streak INTEGER NOT NULL DEFAULT 1,
  longest_streak INTEGER NOT NULL DEFAULT 1,
  last_login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_logins INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_login_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak"
  ON public.daily_login_streaks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON public.daily_login_streaks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON public.daily_login_streaks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all streaks"
  ON public.daily_login_streaks FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Atomic redemption RPC: deducts XP and returns discount link
CREATE OR REPLACE FUNCTION public.redeem_xp_discount(_course_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT, discount_link TEXT, xp_spent INTEGER, discount_percent INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _cfg public.course_xp_discounts%ROWTYPE;
  _new_xp INTEGER;
BEGIN
  IF _uid IS NULL THEN
    RETURN QUERY SELECT false, 'not authenticated'::TEXT, ''::TEXT, 0, 0;
    RETURN;
  END IF;

  SELECT * INTO _cfg FROM public.course_xp_discounts
    WHERE course_id = _course_id AND enabled = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Desconto não disponível para este curso'::TEXT, ''::TEXT, 0, 0;
    RETURN;
  END IF;

  -- Atomic XP debit
  UPDATE public.user_gamification
    SET xp = xp - _cfg.xp_required,
        updated_at = now()
    WHERE user_id = _uid AND xp >= _cfg.xp_required
    RETURNING xp INTO _new_xp;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'XP insuficiente'::TEXT, ''::TEXT, 0, 0;
    RETURN;
  END IF;

  INSERT INTO public.user_xp_redemptions(user_id, course_id, xp_spent, discount_percent, discount_link)
    VALUES (_uid, _course_id, _cfg.xp_required, _cfg.discount_percent, _cfg.discount_link);

  RETURN QUERY SELECT true, 'ok'::TEXT, _cfg.discount_link, _cfg.xp_required, _cfg.discount_percent;
END;
$$;