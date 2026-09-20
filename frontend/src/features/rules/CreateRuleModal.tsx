import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { createRule } from '../../api/rules';
import { useToast } from '../../context/ToastContext';
import { CreateRulePayload, RuleAction, RuleOperator, RuleSeverity } from '../../types/rule';
import { Sliders, Plus, AlertCircle } from 'lucide-react';

export interface CreateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateRuleModal: React.FC<CreateRuleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateRulePayload>({
    name: '',
    description: '',
    ruleType: 'VELOCITY',
    field: 'transaction.amount',
    operator: 'GREATER_THAN',
    threshold: '',
    action: 'FLAG_FOR_REVIEW',
    scoreImpact: 35,
    severity: 'MEDIUM',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Rule name is required';
    if (!formData.field.trim()) errs.field = 'Field expression is required';
    if (!formData.threshold.trim()) errs.threshold = 'Threshold comparison value is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading) return;

    setIsLoading(true);
    setApiNotice(null);

    try {
      await createRule(formData);
      showToast('success', 'Rule Created', 'Fraud rule published to evaluation engine.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setApiNotice(
        err instanceof Error
          ? err.message
          : 'Backend endpoint POST /api/rules is ready for teammate integration.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Fraud Detection Rule"
      description="Define conditional heuristics that trigger score penalties and automated actions"
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Rule
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiNotice && (
          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-indigo-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-200">API Integration Notice</p>
              <p className="mt-0.5">{apiNotice}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Rule Name"
            placeholder="e.g. Excessive Transaction Velocity"
            value={formData.name}
            error={errors.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Rule Category / Type"
            value={formData.ruleType}
            onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
            options={[
              { value: 'VELOCITY', label: 'Transaction Velocity' },
              { value: 'GEOGRAPHIC', label: 'Geographic Mismatch' },
              { value: 'AMOUNT_THRESHOLD', label: 'Amount Anomaly' },
              { value: 'DEVICE_FINGERPRINT', label: 'Device Integrity' },
              { value: 'BEHAVIORAL', label: 'Behavioral Pattern' },
            ]}
          />

          <div className="md:col-span-2">
            <Input
              label="Description"
              placeholder="Explain the detection hypothesis and rationale..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <Select
            label="Payload Field"
            value={formData.field}
            onChange={(e) => setFormData({ ...formData, field: e.target.value })}
            options={[
              { value: 'transaction.amount', label: 'transaction.amount' },
              { value: 'device.velocity_10m', label: 'device.velocity_10m' },
              { value: 'ip.is_vpn_proxy', label: 'ip.is_vpn_proxy' },
              { value: 'customer.country_mismatch', label: 'customer.country_mismatch' },
              { value: 'card.failure_rate_1h', label: 'card.failure_rate_1h' },
            ]}
          />

          <Select
            label="Comparison Operator"
            value={formData.operator}
            onChange={(e) => setFormData({ ...formData, operator: e.target.value as RuleOperator })}
            options={[
              { value: 'GREATER_THAN', label: 'GREATER THAN (>)' },
              { value: 'LESS_THAN', label: 'LESS THAN (<)' },
              { value: 'EQUALS', label: 'EQUALS (==)' },
              { value: 'NOT_EQUALS', label: 'NOT EQUALS (!=)' },
              { value: 'CONTAINS', label: 'CONTAINS' },
              { value: 'GEO_MISMATCH', label: 'GEO MISMATCH' },
            ]}
          />

          <Input
            label="Evaluation Threshold Value"
            placeholder="e.g. 5000 or true"
            value={formData.threshold}
            error={errors.threshold}
            onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
            required
          />

          <Select
            label="Severity Classification"
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value as RuleSeverity })}
            options={[
              { value: 'LOW', label: 'Low Severity' },
              { value: 'MEDIUM', label: 'Medium Severity' },
              { value: 'HIGH', label: 'High Severity' },
            ]}
          />

          <Select
            label="Automated Action"
            value={formData.action}
            onChange={(e) => setFormData({ ...formData, action: e.target.value as RuleAction })}
            options={[
              { value: 'BLOCK', label: 'Block Immediately' },
              { value: 'FLAG_FOR_REVIEW', label: 'Flag for Review' },
              { value: 'REQUIRE_2FA', label: 'Require 2FA Challenge' },
              { value: 'ALERT_ANALYST', label: 'Dispatch Analyst Alert' },
            ]}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Score Impact (+{formData.scoreImpact})</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={formData.scoreImpact}
              onChange={(e) => setFormData({ ...formData, scoreImpact: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
