import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProgress } from "@/hooks/use-progress";
import heroImage from "@/assets/hero-massage-dark.jpg";
import { courseModules } from "@/data/course-data";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ModuleCard } from "@/components/course/ModuleCard";
import { OverallProgress } from "@/components/course/OverallProgress";
import { Link } from "@tanstack/react-router";
import { LogOut, MessageCircle, Send, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";

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

const moduleImages: Record<string, string> = {
  "mi-a": modIntroImg,
  "mc-1": modStudyImg,
  "mc-2": modStudyImg,
  "mc-3": modStudyImg,
  "mc-4": modStudyImg,
  "mod-5": modProductsImg,
  "mod-6": modAnatomyImg,
  "mod-7": modEthicsImg,
  "mod-8": modRelaxanteImg,
  "mod-9": modDrenagemImg,
  "mod-10": modReflexoImg,
  "mod-12": modModeladoraImg,
  "mod-13": modAuriculoImg,
  "mod-14": modMoxaImg,
  "mod-15": modAvancadoImg,
  "mod-16": modAvancadoImg,
  "mod-17": modAvancadoImg,
  "mod-18": modAvancadoImg,
  "mod-19": modBonusImg,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Curso Premium de Massoterapia" },
      { name: "description", content: "Domine a arte da massoterapia com nosso curso completo e profissional." },
    ],
  }),
  component: Index,
});

type AuthView = "login" | "register" | "forgot";

function AuthPage() {
  const { login, register, resetPassword } = useAuth();
  const [view, setView] = useState<AuthView>("login");

  const handleGoogleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) return;
    if (result.redirected) return;
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - brand */}
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

      {/* Right side - form */}
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
            {view === "register" && "Crie sua conta"}
            {view === "forgot" && "Recuperar senha"}
          </h2>

          {view !== "forgot" && (
            <div className="mb-6">
              <Button variant="outline" className="w-full" size="lg" onClick={handleGoogleSignIn}>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Entrar com Google
              </Button>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>
            </div>
          )}

          {view === "login" && (
            <LoginForm
              onLogin={login}
              onSwitchToRegister={() => setView("register")}
              onSwitchToForgot={() => setView("forgot")}
            />
          )}
          {view === "register" && <RegisterForm onRegister={register} onSwitchToLogin={() => setView("login")} />}
          {view === "forgot" && <ForgotPasswordForm onReset={resetPassword} onSwitchToLogin={() => setView("login")} />}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const { getModuleProgress, isModuleUnlocked, daysUntilUnlock, overallProgress, loading } = useProgress(user?.id);

  if (loading) {
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
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground hidden sm:inline">Massoterapia</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">Olá, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Hero section */}
        <div className="mb-10 animate-fade-up">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Meu Curso</h1>
          <p className="mt-2 text-base text-muted-foreground">Continue de onde parou e avance no seu aprendizado.</p>
        </div>

        {/* Overall progress */}
        <div className="mb-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <OverallProgress {...overallProgress} />
        </div>

        {/* Section title */}
        <div className="mb-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <h2 className="font-heading text-xl font-bold text-foreground">Todos os Módulos</h2>
          <p className="mt-1 text-sm text-muted-foreground">{courseModules.length} módulos disponíveis</p>
        </div>

        {/* Module grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courseModules.map((mod, i) => {
            const unlocked = isModuleUnlocked(i);
            const daysLeft = daysUntilUnlock(i);
            const img = moduleImages[mod.id];
            return unlocked ? (
              <Link
                key={mod.id}
                to="/modulo/$moduleId"
                params={{ moduleId: mod.id }}
                className="block animate-fade-up"
                style={{ animationDelay: `${(i + 3) * 60}ms` }}
              >
                <ModuleCard
                  module={mod}
                  index={i}
                  unlocked
                  progress={getModuleProgress(mod.id)}
                  onOpen={() => {}}
                  daysLeft={daysLeft}
                  image={img}
                />
              </Link>
            ) : (
              <div key={mod.id} className="animate-fade-up" style={{ animationDelay: `${(i + 3) * 60}ms` }}>
                <ModuleCard
                  module={mod}
                  index={i}
                  unlocked={false}
                  progress={getModuleProgress(mod.id)}
                  onOpen={() => {}}
                  daysLeft={daysLeft}
                  image={img}
                />
              </div>
            );
          })}
        </div>

        {/* Footer links */}
        <div className="mt-12 flex flex-col sm:flex-row gap-3">
          <a
            href="https://t.me/example"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground transition-all hover:bg-accent hover:border-primary/30"
          ></a>
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground transition-all hover:bg-accent hover:border-success/30"
          ></a>
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
