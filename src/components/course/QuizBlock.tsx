import { useState } from "react";
import { Brain, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/data/quiz-data";
import { supabase } from "@/integrations/supabase/client";

interface QuizBlockProps {
  lessonId: string;
  questions: QuizQuestion[];
  userId: string;
  onCorrectAnswer: () => void;
}

export function QuizBlock({ lessonId, questions, userId, onCorrectAnswer }: QuizBlockProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const question = questions[currentQ];
  if (!question) return null;

  const isCorrect = selected === question.correctIndex;
  const allDone = results.length === questions.length;

  const handleAnswer = async () => {
    if (selected === null) return;
    setAnswered(true);
    const correct = selected === question.correctIndex;
    setResults((prev) => [...prev, correct]);

    if (correct) onCorrectAnswer();

    await supabase.from("quiz_answers").upsert({
      user_id: userId,
      lesson_id: lessonId,
      question_index: currentQ,
      selected_answer: selected,
      is_correct: correct,
    }, { onConflict: "user_id,lesson_id,question_index" });
  };

  const handleNext = () => {
    setCurrentQ((prev) => prev + 1);
    setSelected(null);
    setAnswered(false);
  };

  if (allDone) {
    const correctCount = results.filter(Boolean).length;
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center animate-scale-in">
        <Brain className="mx-auto h-8 w-8 text-primary mb-2" />
        <p className="font-heading text-lg font-bold text-foreground">Quiz Concluído!</p>
        <p className="text-sm text-muted-foreground mt-1">
          Você acertou {correctCount} de {questions.length} pergunta{questions.length > 1 ? "s" : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-4 w-4 text-primary" />
        <h4 className="font-heading text-sm font-semibold text-card-foreground">
          Quiz — Pergunta {currentQ + 1} de {questions.length}
        </h4>
      </div>

      <p className="text-sm font-medium text-foreground mb-4">{question.question}</p>

      <div className="space-y-2">
        {question.options.map((opt, i) => {
          let styles = "border-border hover:border-primary/30 hover:bg-accent/50";
          if (answered) {
            if (i === question.correctIndex) styles = "border-success bg-success/10";
            else if (i === selected && !isCorrect) styles = "border-destructive bg-destructive/10";
            else styles = "border-border opacity-50";
          } else if (selected === i) {
            styles = "border-primary bg-primary/10";
          }

          return (
            <button
              key={i}
              onClick={() => !answered && setSelected(i)}
              disabled={answered}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${styles}`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-foreground">{opt}</span>
              {answered && i === question.correctIndex && <CheckCircle2 className="ml-auto h-4 w-4 text-success" />}
              {answered && i === selected && !isCorrect && i !== question.correctIndex && <XCircle className="ml-auto h-4 w-4 text-destructive" />}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        {!answered ? (
          <Button onClick={handleAnswer} disabled={selected === null} size="sm" className="rounded-xl">
            Confirmar Resposta
          </Button>
        ) : currentQ < questions.length - 1 ? (
          <Button onClick={handleNext} size="sm" className="rounded-xl">
            Próxima Pergunta
          </Button>
        ) : (
          <Button onClick={handleNext} size="sm" className="rounded-xl">
            Ver Resultado
          </Button>
        )}
      </div>
    </div>
  );
}
