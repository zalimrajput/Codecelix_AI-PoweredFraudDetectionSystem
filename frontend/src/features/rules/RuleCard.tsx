import React, { useState } from 'react';
import { FraudRule, RuleAction, RuleSeverity } from '../../types/rule';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Sliders, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export interface RuleCardProps {
  rule: FraudRule;
  onUpdate: (id: string, updates: Partial<FraudRule>) => void;
  onDelete: (id: string) => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  onUpdate,
  onDelete,
}) => {
  const [scoreImpact, setScoreImpact] = useState(rule.scoreImpact);

  const severityVariant: Record<RuleSeverity, 'low' | 'medium' | 'high'> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  };

  return (
    <div
      className={`bg-slate-900 border rounded-xl p-5 shadow-card transition-all duration-200 ${
        rule.isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-100">{rule.name}</h3>
            <Badge variant={severityVariant[rule.severity]} size="sm">
              {rule.severity}
            </Badge>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {rule.ruleType}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rule.description}</p>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300 select-none">
            <input
              type="checkbox"
              checked={rule.isActive}
              onChange={(e) => onUpdate(rule.id, { isActive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
            <span className="text-[11px] font-mono text-slate-400">
              {rule.isActive ? 'ACTIVE' : 'DISABLED'}
            </span>
          </label>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(rule.id)}
            className="text-slate-500 hover:text-rose-400 p-1.5"
            aria-label="Delete rule"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Logic Expression */}
      <div className="py-3 font-mono text-xs text-slate-300 flex items-center gap-2 bg-slate-950/40 px-3 rounded-lg my-3 border border-slate-800/60">
        <span className="text-indigo-400 font-semibold">{rule.field}</span>
        <span className="text-slate-500 uppercase">{rule.operator.replace('_', ' ')}</span>
        <span className="text-emerald-400 font-semibold">{rule.threshold}</span>
      </div>

      {/* Dynamic Controls: Score Impact Slider & Action Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 items-center">
        {/* Score Impact Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Risk Score Impact Weight:
            </span>
            <span className="font-mono font-bold text-slate-200">+{scoreImpact} pts</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={scoreImpact}
            onChange={(e) => {
              const val = Number(e.target.value);
              setScoreImpact(val);
            }}
            onMouseUp={() => onUpdate(rule.id, { scoreImpact })}
            onTouchEnd={() => onUpdate(rule.id, { scoreImpact })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Action Selector */}
        <div>
          <Select
            label="Automated Remediation Action"
            value={rule.action}
            onChange={(e) => onUpdate(rule.id, { action: e.target.value as RuleAction })}
            options={[
              { value: 'BLOCK', label: 'Block Immediately' },
              { value: 'FLAG_FOR_REVIEW', label: 'Flag for Manual Investigation' },
              { value: 'REQUIRE_2FA', label: 'Step-Up Authentication (2FA)' },
              { value: 'ALLOW', label: 'Allow Transaction' },
              { value: 'ALERT_ANALYST', label: 'Emit High Priority Alert' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
