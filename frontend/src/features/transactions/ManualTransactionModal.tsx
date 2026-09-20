import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { createTransaction } from '../../api/transactions';
import { useToast } from '../../context/ToastContext';
import { ManualTransactionPayload, PaymentMethod } from '../../types/transaction';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export interface ManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ManualTransactionModal: React.FC<ManualTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState<ManualTransactionPayload>({
    customerId: '',
    amount: 0,
    currency: 'USD',
    paymentMethod: 'CREDIT_CARD',
    ipAddress: '',
    deviceId: '',
    location: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.customerId.trim()) errs.customerId = 'Customer ID is required';
    if (!formData.amount || formData.amount <= 0) errs.amount = 'Amount must be greater than 0';
    if (!formData.ipAddress.trim()) errs.ipAddress = 'IP Address is required';
    if (!formData.deviceId.trim()) errs.deviceId = 'Device ID is required';
    if (!formData.location.trim()) errs.location = 'Location is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading) return;

    setIsLoading(true);
    setApiNotice(null);

    try {
      await createTransaction(formData);
      showToast('success', 'Transaction Submitted', 'Transaction sent to neural fraud evaluation pipeline.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setApiNotice(
        err instanceof Error
          ? err.message
          : 'Backend endpoint POST /api/transactions/manual is ready for teammate integration.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Manual Transaction"
      description="Inject an evaluation transaction directly into the fraud scoring engine"
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
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Submit for Risk Scoring
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
            label="Customer ID"
            placeholder="e.g. CUST-90218"
            value={formData.customerId}
            error={errors.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            required
          />

          <Input
            label="Amount (USD)"
            type="number"
            step="0.01"
            placeholder="250.00"
            value={formData.amount || ''}
            error={errors.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            required
          />

          <Select
            label="Payment Method"
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
            options={[
              { value: 'CREDIT_CARD', label: 'Credit Card' },
              { value: 'DEBIT_CARD', label: 'Debit Card' },
              { value: 'WIRE_TRANSFER', label: 'Wire Transfer' },
              { value: 'CRYPTO', label: 'Cryptocurrency' },
              { value: 'ACH', label: 'ACH Transfer' },
              { value: 'DIGITAL_WALLET', label: 'Digital Wallet' },
            ]}
          />

          <Input
            label="Location"
            placeholder="e.g. San Francisco, US"
            value={formData.location}
            error={errors.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />

          <Input
            label="IP Address"
            placeholder="e.g. 198.51.100.42"
            value={formData.ipAddress}
            error={errors.ipAddress}
            onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
            required
          />

          <Input
            label="Device Fingerprint"
            placeholder="e.g. dev_mac_a81f03"
            value={formData.deviceId}
            error={errors.deviceId}
            onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
            required
          />
        </div>
      </form>
    </Modal>
  );
};
