import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { createTransaction } from '../../api/transactions';
import { useToast } from '../../context/ToastContext';
import { ManualTransactionPayload } from '../../types/transaction';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export interface ManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type NumericField =
  | 'deviceAgeDays'
  | 'accountAgeDays'
  | 'customerAvgAmount'
  | 'distanceFromHomeKm'
  | 'ipAccountCount'
  | 'deviceCustomerCount';

type BooleanField = 'isNewDevice' | 'sharedIp' | 'sharedDevice';

const BOOLEAN_OPTIONS = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

const DEVICE_TYPE_OPTIONS = [
  { value: '', label: 'Auto' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'tablet', label: 'Tablet' },
];

const SectionLabel: React.FC<{ title: string }> = ({ title }) => (
  <div className="col-span-1 md:col-span-2 border-t border-slate-800/80 pt-3">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300/90">{title}</p>
  </div>
);

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
    country: '',
    city: '',
    deviceType: '',
  });

  const update = (patch: Partial<ManualTransactionPayload>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const updateNumber = (key: NumericField, raw: string) => {
    if (raw === '') {
      update({ [key]: undefined } as Partial<ManualTransactionPayload>);
      return;
    }
    const parsed = Number(raw);
    update({ [key]: Number.isNaN(parsed) ? undefined : parsed } as Partial<ManualTransactionPayload>);
  };

  const updateBool = (key: BooleanField, raw: string) => {
    update({ [key]: raw === 'auto' ? undefined : raw === 'true' } as Partial<ManualTransactionPayload>);
  };

  const boolValue = (v: boolean | undefined) => (v === undefined ? 'auto' : String(v));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.customerId.trim()) errs.customerId = 'Customer ID is required';
    if (!formData.amount || formData.amount <= 0) errs.amount = 'Amount must be greater than 0';
    if (!formData.ipAddress.trim()) errs.ipAddress = 'IP Address is required';
    if (!formData.deviceId.trim()) errs.deviceId = 'Device ID is required';
    if (!formData.country.trim()) errs.country = 'Country is required';

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
      maxWidth="xl"
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
          <SectionLabel title="Transaction Details" />

          <Input
            label="Customer ID"
            placeholder="e.g. CUST-90218"
            value={formData.customerId}
            error={errors.customerId}
            onChange={(e) => update({ customerId: e.target.value })}
            required
          />

          <Input
            label="Amount (USD)"
            type="number"
            step="0.01"
            placeholder="250.00"
            value={formData.amount || ''}
            error={errors.amount}
            onChange={(e) => update({ amount: parseFloat(e.target.value) || 0 })}
            required
          />

          <Select
            label="Payment Method"
            value={formData.paymentMethod}
            onChange={(e) => update({ paymentMethod: e.target.value as ManualTransactionPayload['paymentMethod'] })}
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
            label="Country"
            placeholder="e.g. Pakistan"
            value={formData.country}
            error={errors.country}
            onChange={(e) => update({ country: e.target.value })}
            required
          />

          <Input
            label="City"
            placeholder="e.g. Lahore"
            value={formData.city || ''}
            onChange={(e) => update({ city: e.target.value })}
          />

          <SectionLabel title="Customer Profile" />

          <Input
            label="Account Age (days)"
            type="number"
            min="0"
            placeholder="e.g. 720"
            value={formData.accountAgeDays ?? ''}
            onChange={(e) => updateNumber('accountAgeDays', e.target.value)}
            helperText="Overrides customer history when provided"
          />

          <Input
            label="Customer Average Amount (USD)"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 350.00"
            value={formData.customerAvgAmount ?? ''}
            onChange={(e) => updateNumber('customerAvgAmount', e.target.value)}
            helperText="Baseline used for amount-deviation scoring"
          />

          <SectionLabel title="Device Intelligence" />

          <Input
            label="Device Fingerprint"
            placeholder="e.g. dev_mac_a81f03"
            value={formData.deviceId}
            error={errors.deviceId}
            onChange={(e) => update({ deviceId: e.target.value })}
            required
          />

          <Select
            label="Device Type"
            value={formData.deviceType || ''}
            onChange={(e) => update({ deviceType: e.target.value })}
            options={DEVICE_TYPE_OPTIONS}
          />

          <Input
            label="Device Age (days)"
            type="number"
            min="0"
            placeholder="e.g. 120"
            value={formData.deviceAgeDays ?? ''}
            onChange={(e) => updateNumber('deviceAgeDays', e.target.value)}
          />

          <Select
            label="New Device"
            value={boolValue(formData.isNewDevice)}
            onChange={(e) => updateBool('isNewDevice', e.target.value)}
            options={BOOLEAN_OPTIONS}
            helperText="First time this device is seen for the customer"
          />

          <Input
            label="Device Customer Count"
            type="number"
            min="0"
            placeholder="e.g. 1"
            value={formData.deviceCustomerCount ?? ''}
            onChange={(e) => updateNumber('deviceCustomerCount', e.target.value)}
            helperText="Accounts linked to this device"
          />

          <Select
            label="Shared Device"
            value={boolValue(formData.sharedDevice)}
            onChange={(e) => updateBool('sharedDevice', e.target.value)}
            options={BOOLEAN_OPTIONS}
            helperText="Device used by multiple accounts"
          />

          <SectionLabel title="Network Signals" />

          <Input
            label="IP Address"
            placeholder="e.g. 198.51.100.42"
            value={formData.ipAddress}
            error={errors.ipAddress}
            onChange={(e) => update({ ipAddress: e.target.value })}
            required
          />

          <Input
            label="IP Account Count"
            type="number"
            min="0"
            placeholder="e.g. 1"
            value={formData.ipAccountCount ?? ''}
            onChange={(e) => updateNumber('ipAccountCount', e.target.value)}
            helperText="Accounts seen on this IP"
          />

          <Select
            label="Shared IP"
            value={boolValue(formData.sharedIp)}
            onChange={(e) => updateBool('sharedIp', e.target.value)}
            options={BOOLEAN_OPTIONS}
            helperText="IP used by multiple accounts"
          />

          <Input
            label="Distance From Home (km)"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g. 1250"
            value={formData.distanceFromHomeKm ?? ''}
            onChange={(e) => updateNumber('distanceFromHomeKm', e.target.value)}
            helperText="Distance from customer's home location"
          />
        </div>
      </form>
    </Modal>
  );
};
