import React from 'react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { AiExplanation } from '../../types/investigation';
import { Bot, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

export interface AiExplanationPanelProps {
  explanation?: AiExplanation | null;
  isLoading?: boolean;
}

export const AiExplanationPanel: React.FC<AiExplanationPanelProps> = ({
  explanation,
  isLoading = false,
}) => {
  return (
    <Card
      header={
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Gemini AI Diagnostic Assessment
            </h3>
            <p className="text-xs text-slate-400">
              Autonomous synthesized risk narrative and anomaly reasoning
            </p>
          </div>
        </div>
      }
      className="h-full"
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ) : !explanation ? (
        <EmptyState
          icon={Bot}
          title="No AI Diagnostic Available"
          description="AI assessment will populate upon backend model generation for this investigation."
        />
      ) : (
        <div className="space-y-4 text-xs font-sans">
          {/* Gemini Synthesis */}
          <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-900/30 leading-relaxed text-slate-200">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block mb-1">
              Neural Narrative
            </span>
            {explanation.geminiSummary}
          </div>

          {/* Deterministic Explanation */}
          <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800 leading-relaxed text-slate-300">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
              Deterministic Logic
            </span>
            {explanation.deterministicExplanation}
          </div>

          {/* Key Risk Factors */}
          {explanation.riskFactors && explanation.riskFactors.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                Identified Risk Factors
              </span>
              <ul className="space-y-1.5 font-mono text-[11px]">
                {explanation.riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Recommendation */}
          {explanation.recommendedAction && (
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-emerald-200">Recommended Remediation:</span>
                <span className="mt-0.5 block">{explanation.recommendedAction}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
