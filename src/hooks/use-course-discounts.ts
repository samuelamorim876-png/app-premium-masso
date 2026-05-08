import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CourseDiscount {
  id: string;
  course_id: string;
  xp_required: number;
  discount_percent: number;
  discount_link: string;
  enabled: boolean;
}

export interface UserRedemption {
  course_id: string;
  discount_link: string;
  discount_percent: number;
  redeemed_at: string;
}

export function useCourseDiscounts(userId: string | undefined) {
  const [discounts, setDiscounts] = useState<CourseDiscount[]>([]);
  const [redemptions, setRedemptions] = useState<UserRedemption[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const dRes = await supabase.from("course_xp_discounts" as never).select("*");
    setDiscounts(((dRes.data as unknown) as CourseDiscount[]) || []);

    if (userId) {
      const rRes = await supabase
        .from("user_xp_redemptions" as never)
        .select("course_id,discount_link,discount_percent,redeemed_at")
        .eq("user_id", userId)
        .order("redeemed_at", { ascending: false });
      setRedemptions(((rRes.data as unknown) as UserRedemption[]) || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const getDiscountFor = useCallback(
    (courseId: string) => discounts.find((d) => d.course_id === courseId && d.enabled),
    [discounts],
  );

  const getRedemptionFor = useCallback(
    (courseId: string) => redemptions.find((r) => r.course_id === courseId),
    [redemptions],
  );

  const redeem = useCallback(async (courseId: string) => {
    const { data, error } = await supabase.rpc("redeem_xp_discount" as never, { _course_id: courseId } as never);
    if (error) return { success: false, message: error.message } as const;
    const row = (Array.isArray(data) ? data[0] : data) as
      | { success: boolean; message: string; discount_link: string; xp_spent: number; discount_percent: number }
      | undefined;
    if (!row?.success) return { success: false, message: row?.message ?? "Falha ao resgatar" } as const;
    await refresh();
    return { success: true, link: row.discount_link, xpSpent: row.xp_spent, percent: row.discount_percent } as const;
  }, [refresh]);

  return { discounts, redemptions, loading, getDiscountFor, getRedemptionFor, redeem, refresh };
}
