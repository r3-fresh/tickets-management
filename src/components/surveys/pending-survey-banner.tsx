"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { submitSurveyAction } from "@/actions/surveys";
import { toast } from "sonner";
import { Star, Send, SkipForward, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SURVEY_QUESTIONS, SURVEY_RATING_STYLES, SURVEY_RATING_SELECTED_STYLES } from "@/lib/constants/tickets";
import type { SurveyRating } from "@/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PendingSurveyBannerProps {
  ticketId: number;
}

type SurveyRatings = {
  responseTimeRating: SurveyRating | null;
  communicationRating: SurveyRating | null;
  solutionRating: SurveyRating | null;
  overallRating: SurveyRating | null;
};

export function PendingSurveyBanner({ ticketId }: PendingSurveyBannerProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ratings, setRatings] = useState<SurveyRatings>({
    responseTimeRating: null,
    communicationRating: null,
    solutionRating: null,
    overallRating: null,
  });
  const [suggestion, setSuggestion] = useState("");

  if (dismissed || submitted) return null;

  const handleSetRating = (key: keyof SurveyRatings, value: SurveyRating) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const allRatingsComplete = Object.values(ratings).every(r => r !== null);

  const handleSubmitSurvey = () => {
    if (!allRatingsComplete) return;

    startTransition(async () => {
      const result = await submitSurveyAction({
        ticketId,
        responseTimeRating: ratings.responseTimeRating!,
        communicationRating: ratings.communicationRating!,
        solutionRating: ratings.solutionRating!,
        overallRating: ratings.overallRating!,
        improvementSuggestion: suggestion.trim() || undefined,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Encuesta enviada. Gracias por tu retroalimentación");
        setSubmitted(true);
      }
    });
  };

  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 overflow-hidden">
      <Collapsible open={showForm} onOpenChange={setShowForm}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 shrink-0">
            <Star className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              Cuéntanos tu experiencia
            </p>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70">
              Tu opinión nos ayuda a mejorar el servicio
            </p>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            >
              {showForm ? "Ocultar" : "Completar encuesta"}
              <ChevronDown className={cn(
                "ml-1 h-4 w-4 transition-transform duration-200",
                showForm && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-1 space-y-4 border-t border-emerald-200/50 dark:border-emerald-800/30">
            {/* Questions */}
            {SURVEY_QUESTIONS.map((q) => {
              const key = q.key as keyof SurveyRatings;
              const currentRating = ratings[key];
              return (
                <div key={q.key} className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {q.label}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground w-16 text-right shrink-0">
                      {q.lowLabel}
                    </span>
                    <div className="flex gap-1.5 flex-1 justify-center">
                      {([1, 2, 3, 4, 5] as SurveyRating[]).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleSetRating(key, value)}
                          disabled={isPending}
                          className={cn(
                            "h-9 w-9 rounded-lg border text-sm font-bold transition-all duration-200 cursor-pointer",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                            currentRating === value
                              ? SURVEY_RATING_SELECTED_STYLES[value]
                              : SURVEY_RATING_STYLES[value],
                            isPending && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground w-16 shrink-0">
                      {q.highLabel}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Improvement Suggestion */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Sugerencias de mejora <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="¿Cómo podemos mejorar?"
                maxLength={1000}
                disabled={isPending}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 resize-none h-16 disabled:opacity-50"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleSubmitSurvey}
                disabled={!allRatingsComplete || isPending}
                className="flex-1 h-10"
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar encuesta
              </Button>
              <Button
                variant="ghost"
                onClick={() => setDismissed(true)}
                disabled={isPending}
                className="h-10"
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Omitir
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
