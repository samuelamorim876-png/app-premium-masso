import { StickyNote, Save, Loader2 } from "lucide-react";

interface LessonNotesProps {
  content: string;
  onChange: (text: string) => void;
  saving: boolean;
}

export function LessonNotes({ content, onChange, saving }: LessonNotesProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-primary" />
          <h4 className="font-heading text-sm font-semibold text-card-foreground">Suas Anotações</h4>
        </div>
        {saving && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Salvando...
          </span>
        )}
        {!saving && content.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-success">
            <Save className="h-3 w-3" /> Salvo
          </span>
        )}
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Anote abaixo o que aprendeu para fixar melhor o conteúdo. Você poderá acessar suas anotações a qualquer momento."
        className="w-full min-h-[120px] resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      />
    </div>
  );
}
