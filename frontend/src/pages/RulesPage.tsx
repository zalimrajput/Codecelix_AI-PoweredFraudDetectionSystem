import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { RuleCard } from '../features/rules/RuleCard';
import { CreateRuleModal } from '../features/rules/CreateRuleModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { getRules, updateRule, deleteRule } from '../api/rules';
import { FraudRule } from '../types/rule';
import { Sliders, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const RulesPage: React.FC = () => {
  const { showToast } = useToast();
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  const fetchRulesList = async () => {
    setIsLoading(true);
    try {
      const data = await getRules();
      setRules(data || []);
    } catch {
      // Backend not connected yet: empty array triggers clean empty state
      setRules([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRulesList();
  }, []);

  const handleUpdateRule = async (id: string, updates: Partial<FraudRule>) => {
    // Optimistic UI update
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    try {
      await updateRule(id, updates);
      showToast('success', 'Rule Updated', 'Fraud evaluation heuristics synchronized.');
    } catch {
      showToast('info', 'Integration Notice', 'Endpoint PATCH /api/rules/:id is pending backend integration.');
    }
  };

  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;
    const targetId = ruleToDelete;
    setRules((prev) => prev.filter((r) => r.id !== targetId));
    setRuleToDelete(null);
    try {
      await deleteRule(targetId);
      showToast('success', 'Rule Deleted', 'Rule removed from evaluation engine.');
    } catch {
      showToast('info', 'Integration Notice', 'Endpoint DELETE /api/rules/:id is pending backend integration.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Rules Engine"
        description="Deterministic conditional logic rules enforcing transaction scoring adjustments and instant actions"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Rules Engine' },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRulesList}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Rules
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create New Rule
            </Button>
          </>
        }
      />

      {/* Rules Stream */}
      {rules.length === 0 ? (
        <EmptyState
          icon={Sliders}
          title="No fraud rules available"
          description="Create your first rule or connect your backend to populate deterministic fraud evaluation logic."
          actionLabel="Create First Rule"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onUpdate={handleUpdateRule}
              onDelete={(id) => setRuleToDelete(id)}
            />
          ))}
        </div>
      )}

      {/* Create Rule Modal */}
      <CreateRuleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchRulesList}
      />

      {/* Delete Rule Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(ruleToDelete)}
        onClose={() => setRuleToDelete(null)}
        onConfirm={handleDeleteRule}
        title="Delete Fraud Rule"
        message="Are you sure you want to delete this rule? Transactions matching this condition will no longer receive the specified score penalty."
        confirmLabel="Delete Rule"
        variant="danger"
      />
    </div>
  );
};
