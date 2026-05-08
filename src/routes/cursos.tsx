import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, ChevronRight, ShoppingBag, Sparkles, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useGamification } from "@/hooks/use-gamification";
import { useCourseDiscounts } from "@/hooks/use-course-discounts";
import { toast } from "sonner";

export const Route = createFileRoute("/cursos")({
  head: () => ({ meta: [{ title: "Nossos Cursos — Massoterapia" }] }),
  component: CursosPage,
});

interface CourseItem {
  id: string;
  title: string;
  description: string;
  badge: string | null;
  purchase_link: string | null;
  available: boolean;
}

function CursosPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: gam, refresh: refreshGam } = useGamification(user?.id) as ReturnType<typeof useGamification> & { refresh?: () => void };
  const { getDiscountFor, getRedemptionFor, redeem, refresh: refreshDiscounts } = useCourseDiscounts(user?.id);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("managed_courses")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setCourses((data as CourseItem[]) || []);
        setLoading(false);
      });
  }, []);

  const handleRedeem = async (course: CourseItem) => {
    if (!confirm(`Aplicar XP e desbloquear desconto em "${course.title}"? Seu XP será descontado.`)) return;
    setRedeeming(course.id);
    const result = await redeem(course.id);
    setRedeeming(null);
    if (!result.success) {
      toast.error(result.message || "Não foi possível resgatar.");
      return;
    }
    toast.success(`Desconto de ${result.percent}% liberado! Redirecionando...`);
    refreshGam?.();
    refreshDiscounts();
    if (result.link) window.open(result.link, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
              <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Nossos Cursos</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">Nossos Cursos</h1>
        <p className="mb-6 flex items-center gap-2 text-sm font-semibold text-amber-500">
          <Sparkles className="h-4 w-4" />
          Aplicar XP e desbloquear desconto nos cursos — você tem <span className="text-foreground">{gam.xp} XP</span>
        </p>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : courses.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Nenhum curso disponível no momento.</p>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => {
              const discount = getDiscountFor(course.id);
              const redemption = getRedemptionFor(course.id);
              const canRedeem = !!discount && !redemption && gam.xp >= discount.xp_required;
              const xpMissing = discount && !redemption ? Math.max(0, discount.xp_required - gam.xp) : 0;

              return (
                <div
                  key={course.id}
                  className={`group rounded-2xl border bg-card p-5 transition-all ${
                    course.available ? "border-primary/20" : "border-border opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading text-base font-bold text-foreground">{course.title}</h3>
                          {course.badge && (
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                course.available ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {course.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>
                      </div>
                    </div>
                    {course.available && course.purchase_link && !redemption && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(course.purchase_link!, "_blank")}
                        className="shrink-0"
                      >
                        Acessar <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Discount block */}
                  {course.available && discount && (
                    <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                      {redemption ? (
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            <span>
                              <strong>{redemption.discount_percent}% de desconto</strong> desbloqueado
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                            onClick={() => window.open(redemption.discount_link, "_blank")}
                          >
                            Acessar oferta
                          </Button>
                        </div>
                      ) : canRedeem ? (
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <p className="text-sm text-foreground">
                            <Sparkles className="inline h-4 w-4 text-amber-500 mr-1" />
                            <strong>{discount.discount_percent}% OFF</strong> disponível por {discount.xp_required} XP
                          </p>
                          <Button
                            size="sm"
                            disabled={redeeming === course.id}
                            className="bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-lg shadow-amber-500/25"
                            onClick={() => handleRedeem(course)}
                          >
                            {redeeming === course.id ? "Resgatando..." : "Aplicar XP e desbloquear desconto"}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          Faltam <strong className="text-foreground">{xpMissing} XP</strong> para desbloquear{" "}
                          <strong className="text-amber-500">{discount.discount_percent}% de desconto</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
