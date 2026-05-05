import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProgress } from "@/hooks/use-progress";
import { courseModules } from "@/data/course-data";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ModuleCard } from "@/components/course/ModuleCard";
import { OverallProgress } from "@/components/course/OverallProgress";
import { Link } from "@tanstack/react-router";
import { LogOut, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="flex min-h-screen">
      {/* Left side - brand */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-primary p-12">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/10">
            <span className="text-4xl">💆</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-primary-foreground">
            Curso Premium de Massoterapia
          </h1>
          <p className="mt-4 text-primary-foreground/80 leading-relaxed">
            Domine técnicas profissionais de massoterapia com mais de 100 aulas em vídeo.
            Do iniciante ao especialista.
          </p>
          <div className="mt-8 flex justify-center gap-6 text-primary-foreground/60 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-foreground">14</p>
              <p>Módulos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-foreground">100+</p>
              <p>Aulas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-foreground">∞</p>
              <p>Acesso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden text-center">
            <span className="text-4xl">💆</span>
            <h1 className="mt-2 font-heading text-xl font-bold text-foreground">Curso de Massoterapia</h1>
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
            {view === "login" && "Bem-vindo de volta"}
            {view === "register" && "Crie sua conta"}
            {view === "forgot" && "Recuperar senha"}
          </h2>
          {view === "login" && (
            <LoginForm onLogin={login} onSwitchToRegister={() => setView("register")} onSwitchToForgot={() => setView("forgot")} />
          )}
          {view === "register" && (
            <RegisterForm onRegister={register} onSwitchToLogin={() => setView("login")} />
          )}
          {view === "forgot" && (
            <ForgotPasswordForm onReset={resetPassword} onSwitchToLogin={() => setView("login")} />
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const { getModuleProgress, isModuleUnlocked, overallProgress } = useProgress();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💆</span>
            <span className="font-heading text-lg font-bold text-foreground hidden sm:inline">Massoterapia</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">Olá, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">Meu Curso</h1>
          <p className="mt-1 text-sm text-muted-foreground">Continue de onde parou e avance no seu aprendizado.</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <OverallProgress {...overallProgress} />
        </div>

        {/* Modules */}
        <div className="space-y-3">
          {courseModules.map((mod, i) => (
            <Link key={mod.id} to="/modulo/$moduleId" params={{ moduleId: mod.id }} className="block">
              <ModuleCard
                module={mod}
                index={i}
                unlocked={isModuleUnlocked(i)}
                progress={getModuleProgress(mod.id)}
                onOpen={() => {}}
              />
            </Link>
          ))}
        </div>

        {/* Support buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <a
            href="https://t.me/example"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Send className="h-4 w-4 text-primary" />
            Grupo no Telegram
          </a>
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <MessageCircle className="h-4 w-4 text-success" />
            Suporte via WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}

function Index() {
  const { user } = useAuth();
  if (!user) return <AuthPage />;
  return <Dashboard />;
}
