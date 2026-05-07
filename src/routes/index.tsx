import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { useProgress } from "@/hooks/use-progress";
import { useGamification } from "@/hooks/use-gamification";
import { useManagedModules } from "@/hooks/use-managed-modules";
import heroImage from "@/assets/hero-massage-dark.jpg";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { InstallBanner } from "@/components/pwa/InstallPrompt";
import { ModuleCard } from "@/components/course/ModuleCard";
import { OverallProgress } from "@/components/course/OverallProgress";
import { GamificationBar } from "@/components/course/GamificationBar";
import { DailyChallenge } from "@/components/course/DailyChallenge";
import { RewardPopup } from "@/components/course/RewardPopup";
import { Link } from "@tanstack/react-router";
import { LogOut, GraduationCap, Stethoscope, ClipboardList, User, Bot, Notebook, BookOpen, ShoppingBag, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

import modIntroImg from "@/assets/hero-massage-dark.jpg";
import modStudyImg from "@/assets/mod-study.jpg";
import modProductsImg from "@/assets/mod-products.jpg";
import modAnatomyImg from "@/assets/mod-anatomy.jpg";
import modRelaxanteImg from "@/assets/mod-relaxante.jpg";
import modDrenagemImg from "@/assets/mod-drenagem.jpg";
import modReflexoImg from "@/assets/mod-reflexo.jpg";
import modModeladoraImg from "@/assets/mod-modeladora.jpg";
import modAuriculoImg from "@/assets/mod-auriculo.jpg";
import modMoxaImg from "@/assets/mod-moxa.jpg";
import modAvancadoImg from "@/assets/mod-avancado.jpg";
import modBonusImg from "@/assets/mod-bonus.jpg";
import modEthicsImg from "@/assets/hero-massage-dark.jpg";

// Fallback images by title keywords
const imageKeywords: [string, string][] = [
  ["Apresentação", modIntroImg],
  ["Complementares 1", modStudyImg],
  ["Complementares 2", modStudyImg],
  ["Complementares 3", modStudyImg],
  ["Complementares 4", modStudyImg],
  ["Áudios", modRelaxanteImg],
  ["Início do Curso", modProductsImg],
  ["Anatomia", modAnatomyImg],
  ["Ética", modEthicsImg],
  ["Relaxante", modRelaxanteImg],
  ["Drenagem", modDrenagemImg],
  ["Reflexologia", modReflexoImg],
  ["Modeladora", modModeladoraImg],
  ["Auriculoterapia", modAuriculoImg],
  ["Moxabustão", modMoxaImg],
  ["Avançad", modAvancadoImg],
  ["Bônus", modBonusImg],
  ["Certificado", modBonusImg],
  ["Avisos", modStudyImg],
];

function getModuleImage(title: string): string {
  for (const [keyword, img] of imageKeywords) {
    if (title.includes(keyword)) return img;
  }
  return modStudyImg;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Curso Premium de Massoterapia" },
      { name: "description", content: "Domine a arte da massoterapia com nosso curso completo e profissional." },
    ],
  }),
  component: Index,
});

type AuthView = "login" | "forgot";

function AuthPage() {
  const { login, resetPassword } = useAuth();
  const [view, setView] = useState<AuthView>("login");

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center relative overflow-hidden">
        <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" width={1920} height={800} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="max-w-md text-center relative z-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 backdrop-blur-md border border-primary/30">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">Curso Premium de Massoterapia</h1>
          <p className="mt-4 text-white/70 leading-relaxed">
            Domine técnicas profissionais de massoterapia com mais de 100 aulas em vídeo. Do iniciante ao especialista.
          </p>
          <div className="mt-8 flex justify-center gap-8 text-white/50 text-sm">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">19</p>
              <p>Módulos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">120+</p>
              <p>Aulas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">∞</p>
              <p>Acesso</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-background">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mt-2 font-heading text-xl font-bold text-foreground">Curso de Massoterapia</h1>
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
            {view === "login" && "Bem-vindo de volta"}
            {view === "forgot" && "Recuperar senha"}
          </h2>

          {view === "login" && (
            <LoginForm
              onLogin={login}
              onSwitchToForgot={() => setView("forgot")}
            />
          )}
          {view === "forgot" && <ForgotPasswordForm onReset={resetPassword} onSwitchToLogin={() => setView("login")} />}

          <InstallBanner />
          {/* install popup removed */}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const { isAdmin } = useAdmin(user?.id);
  const { modules: courseModules, loading: modulesLoading } = useManagedModules();
  const { getModuleProgress, isModuleUnlocked, daysUntilUnlock, overallProgress, loading } = useProgress(user?.id, courseModules);
  const { data: gamData, badges, showReward, addPoints } = useGamification(user?.id);

  if (loading || modulesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando seu curso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showReward && <RewardPopup points={showReward.points} badge={showReward.badge} />}

      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground hidden sm:inline">Massoterapia</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                  <Shield className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link to="/perfil">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <User className="h-4 w-4" />
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:inline">Olá, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Meu Curso</h1>
          <p className="mt-2 text-base text-muted-foreground">Continue de onde parou e avance no seu aprendizado.</p>
        </div>

        <div className="mb-6">
          <GamificationBar data={gamData} badges={badges} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <Link to="/assistente" className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-all">
            <Bot className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Assistente IA</p>
              <p className="text-[10px] text-muted-foreground">Tire dúvidas do curso</p>
            </div>
          </Link>
          <Link to="/simulador" className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-all">
            <Stethoscope className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Simulador</p>
              <p className="text-[10px] text-muted-foreground">Pratique atendimentos</p>
            </div>
          </Link>
          <Link to="/protocolos" className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-all">
            <ClipboardList className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Protocolos</p>
              <p className="text-[10px] text-muted-foreground">Planos de atendimento</p>
            </div>
          </Link>
          <Link to="/indicacoes" className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-all">
            <BookOpen className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Leitura</p>
              <p className="text-[10px] text-muted-foreground">Indicações e contraindicações</p>
            </div>
          </Link>
          <Link to="/anotacoes" className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-all">
            <Notebook className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Anotações</p>
              <p className="text-[10px] text-muted-foreground">Seu caderno digital</p>
            </div>
          </Link>
          <Link to="/cursos" className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-all">
            <ShoppingBag className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Nossos Cursos</p>
              <p className="text-[10px] text-muted-foreground">Veja todos os cursos</p>
            </div>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_320px] mb-8">
          <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
            <OverallProgress {...overallProgress} />
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
            <DailyChallenge userId={user?.id ?? ""} onComplete={() => addPoints(25)} />
          </div>
        </div>

        <div className="mb-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <h2 className="font-heading text-xl font-bold text-foreground">Todos os Módulos</h2>
          <p className="mt-1 text-sm text-muted-foreground">{courseModules.length} módulos disponíveis</p>
        </div>

        <div className="-mx-4 sm:-mx-6">
          <div className="flex gap-4 overflow-x-auto px-4 sm:px-6 pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {courseModules.map((mod, i) => {
              const unlocked = isModuleUnlocked(i);
              const daysLeft = daysUntilUnlock(i);
              const img = getModuleImage(mod.title);
              const card = (
                <ModuleCard
                  module={mod}
                  index={i}
                  unlocked={unlocked}
                  progress={getModuleProgress(mod.id)}
                  onOpen={() => {}}
                  daysLeft={daysLeft}
                  image={img}
                />
              );
              return (
                <div
                  key={mod.id}
                  className="w-[160px] sm:w-[180px] md:w-[200px] flex-shrink-0 snap-start animate-fade-up"
                  style={{ animationDelay: `${(i + 3) * 60}ms` }}
                >
                  {unlocked ? (
                    <Link to="/modulo/$moduleId" params={{ moduleId: mod.id }} className="block">
                      {card}
                    </Link>
                  ) : (
                    card
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <AuthPage />;
  return <Dashboard />;
}
