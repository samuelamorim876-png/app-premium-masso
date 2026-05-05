import { Lightbulb } from "lucide-react";

interface CuriosityBlockProps {
  text: string;
}

export function CuriosityBlock({ text }: CuriosityBlockProps) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5 animate-fade-up">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Você sabia?</p>
          <p className="text-sm leading-relaxed text-foreground/90">{text}</p>
        </div>
      </div>
    </div>
  );
}
