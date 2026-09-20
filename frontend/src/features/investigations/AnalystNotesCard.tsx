import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { InvestigationDecision } from '../../types/investigation';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateInvestigationNotes } from '../../api/investigations';
import { useToast } from '../../context/ToastContext';

export interface AnalystNotesCardProps {
  investigationId: string;
  initialNotes?: string;
  initialConclusion?: InvestigationDecision;
  onUpdateSuccess?: () => void;
}

export const AnalystNotesCard: React.FC<AnalystNotesCardProps> = ({
  investigationId,
  initialNotes = '',
  initialConclusion = 'PENDING_INFO',
  onUpdateSuccess,
}) => {
  const { showToast } = useToast();
  const [notes, setNotes] = useState(initialNotes);
  const [conclusion, setConclusion] = useState<InvestigationDecision>(initialConclusion);
  const [isSaving, setIsSaving] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  const handleSave = async (closeCase: boolean = false) => {
    setIsSaving(true);
    setApiNotice(null);

    try {
      await updateInvestigationNotes(investigationId, {
        investigationId,
        notes,
        conclusion,
        closeCase,
      });
      showToast(
        'success',
        closeCase ? 'Investigation Resolved & Closed' : 'Analyst Notes Saved',
        'Case notes and formal conclusion updated in audit repository.'
      );
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      setApiNotice(
        err instanceof Error
          ? err.message
          : 'Backend endpoint PATCH /api/investigations/:id is prepared for teammate integration.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      title="Analyst Findings & Disposition"
      description="Formal evidentiary documentation, disposition selection, and case closure"
    >
      <div className="space-y-4 text-xs">
        {apiNotice && (
          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-indigo-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-200">API Integration Notice</p>
              <p className="mt-0.5">{apiNotice}</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Analyst Investigation Notes & Evidence Log
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record transaction anomalies, identity verification observations, or customer outreach details..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <Select
            label="Case Conclusion Disposition"
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value as InvestigationDecision)}
            options={[
              { value: 'PENDING_INFO', label: 'Pending Customer Information' },
              { value: 'CONFIRMED_FRAUD', label: 'Confirmed Fraud (Block & Report)' },
              { value: 'SUSPICIOUS_CLEARED', label: 'Suspicious Cleared (Approved)' },
              { value: 'FALSE_POSITIVE', label: 'False Positive (Adjust Rule Weight)' },
            ]}
          />

          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleSave(false)}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Notes
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => handleSave(true)}
              isLoading={isSaving}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Close Investigation
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
