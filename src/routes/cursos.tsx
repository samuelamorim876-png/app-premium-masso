import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [{ title: "Nossos Cursos — Massoterapia" }],
  }),
  component: CursosPage,
});

interface CourseItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
  link?: string;
  available: boolean;
}

const courses: CourseItem[] = [
  {
    id: "massoterapia-completo",
    title: "Curso Completo de Massoterapia",
    description: "Do básico ao avançado — técnicas, anatomia, protocolos e prática profissional.",
    badge: "Ativo",
    available: true,
  },
  {
    id: "aromaterapia",
    title: "Aromaterapia Aplicada",
    description: "Óleos essenciais, blends terapêuticos e aplicações clínicas.",
    badge: "Em breve",
    available: false,
  },
  {
    id: "ventosaterapia",
    title: "Ventosaterapia Profissional",
    description: "Técnicas de ventosa, indicações e protocolos de atendimento.",
    badge: "Em breve",
    available: false,
  },
  {
    id: "auriculoterapia-avancada",
    title: "Auriculoterapia Avançada",
    description: "Aprofundamento em auriculoterapia com mapas e protocolos clínicos.",
    badge: "Em breve",
    available: false,
  },
];

function CursosPage() {
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
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-6">Nossos Cursos</h1>

        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`group rounded-2xl border bg-card p-5 transition-all ${
                course.available
                  ? "border-primary/20 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                  : "border-border opacity-60"
              }`}
              onClick={() => {
                if (course.available && course.link) {
                  window.open(course.link, "_blank");
                }
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading text-base font-bold text-foreground">{course.title}</h3>
                      {course.badge && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            course.available
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {course.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>
                  </div>
                </div>
                {course.available && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
