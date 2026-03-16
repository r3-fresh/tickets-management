"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { approveTicketValidation, rejectTicketValidation } from "@/actions/tickets";
import { submitSurveyAction } from "@/actions/surveys";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, ChevronUp, ChevronDown, Star, Send, SkipForward } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils/cn";
import { SURVEY_QUESTIONS, SURVEY_RATING_STYLES, SURVEY_RATING_SELECTED_STYLES } from "@/lib/constants/tickets";
import type { SurveyRating } from "@/types";

interface UserValidationControlsProps {
  ticketId: number;
  isTSI?: boolean;
}

type SurveyRatings = {
  responseTimeRating: SurveyRating | null;
  communicationRating: SurveyRating | null;
  solutionRating: SurveyRating | null;
  overallRating: SurveyRating | null;
};

export function UserValidationControls({ ticketId, isTSI = false }: UserValidationControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);
  const [ratings, setRatings] = useState<SurveyRatings>({
    responseTimeRating: null,
    communicationRating: null,
    solutionRating: null,
    overallRating: null,
  });
  const [suggestion, setSuggestion] = useState("");

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveTicketValidation(ticketId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Ticket validado y cerrado correctamente");
        // If TSI ticket, transform to show survey
        if (isTSI) {
          setShowSurvey(true);
        }
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectTicketValidation(ticketId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Ticket regresado a 'En progreso' para ajustes");
      }
    });
  };

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
        setShowSurvey(false);
      }
    });
  };

  const handleSkipSurvey = () => {
    setShowSurvey(false);
  };

  // Survey mode: show the survey inline in the floating bar
  if (showSurvey) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div
          className={cn(
            "rounded-2xl border shadow-2xl transition-all duration-300 overflow-hidden",
            "bg-card backdrop-blur-sm",
            "border-border",
            "animate-in slide-in-from-bottom-4 fade-in duration-500",
            isExpanded ? "w-[480px] max-h-[85vh] overflow-y-auto" : "w-auto min-w-[280px]"
          )}
        >
          {isExpanded ? (
            <>
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-3.5 border-b bg-emerald-50/50 dark:bg-emerald-950/20 cursor-pointer"
                onClick={() => setIsExpanded(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <Star className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    Encuesta de satisfacción
                  </span>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>

              {/* Survey Body */}
              <div className="px-5 py-4 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tu opinión nos ayuda a mejorar. Califica tu experiencia del 1 al 5.
                </p>

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
                <div className="flex gap-3 pt-1">
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
                    onClick={handleSkipSurvey}
                    disabled={isPending}
                    className="h-10"
                  >
                    <SkipForward className="mr-2 h-4 w-4" />
                    Omitir
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors w-full"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <Star className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-foreground">Encuesta de satisfacción</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Normal validation controls mode
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className={cn(
          "rounded-2xl border shadow-2xl transition-all duration-300 overflow-hidden",
          "bg-card backdrop-blur-sm",
          "border-border",
          "animate-in slide-in-from-bottom-4 fade-in duration-500",
          isExpanded ? "w-[420px]" : "w-auto min-w-[280px]"
        )}
      >
        {isExpanded ? (
          <>
            <div
              className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/30 cursor-pointer"
              onClick={() => setIsExpanded(false)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                  <AlertCircle className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  Acción requerida
                </span>
              </div>
              <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                El responsable informó que el ticket fue resuelto. Por favor, valida el trabajo y confirma el cierre, o solicita los ajustes que consideres necesarios.
              </p>

              <div className="flex gap-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="flex-1 h-10"
                      disabled={isPending}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirmar solución
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Confirmar solución?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Al confirmar, el ticket se marcará como resuelto y se cerrará.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleApprove}>
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 h-10"
                      disabled={isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Solicitar mejoras
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Solicitar mejoras?</AlertDialogTitle>
                      <AlertDialogDescription>
                        El ticket volverá a "En progreso". Agrega un comentario indicando qué necesita ajustarse.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReject}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Solicitar mejoras
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors w-full"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
              <AlertCircle className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Acción requerida</span>
            <div className="ml-auto flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
