import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, X, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { importTransactionsCsv } from '../../api/transactions';
import { CsvImportResult } from '../../types/transaction';
import { useToast } from '../../context/ToastContext';

export interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);

  const resetState = () => {
    setSelectedFile(null);
    setIsDragging(false);
    setIsUploading(false);
    setValidationError(null);
    setUploadError(null);
    setImportResult(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = (file: File) => {
    setValidationError(null);
    setUploadError(null);
    setImportResult(null);

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setValidationError('Please select a valid CSV file (.csv format required).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setValidationError('File size exceeds 20MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await importTransactionsCsv(selectedFile);
      setImportResult(result);
      showToast('success', 'Batch Import Completed', `Processed ${result.totalProcessed} records.`);
      if (onSuccess) onSuccess();
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : 'Backend endpoint POST /api/transactions/import/csv is ready for teammate integration.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Transactions via CSV"
      description="Batch upload historical transaction records to populate risk telemetry"
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isUploading}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              isLoading={isUploading}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Start Ingestion
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {/* Drag and Drop Zone */}
        {!selectedFile && !importResult && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 text-center ${
              isDragging
                ? 'border-indigo-500 bg-indigo-950/20'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept=".csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 mb-3 shadow-inner">
              <UploadCloud className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-xs font-semibold text-slate-200">
              Click to select or drag and drop CSV file
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports standard transaction telemetry schemas up to 20MB
            </p>
          </div>
        )}

        {/* Selected File Review */}
        {selectedFile && !importResult && (
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">{selectedFile.name}</p>
                <p className="text-[11px] font-mono text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Processing State */}
        {isUploading && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-200">Ingesting transaction records...</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Executing rule validation and anomaly scoring through API endpoint
              </p>
            </div>
          </div>
        )}

        {/* Validation or Upload Error */}
        {(validationError || uploadError) && (
          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Import Alert</p>
              <p className="mt-0.5">{validationError || uploadError}</p>
            </div>
          </div>
        )}

        {/* Ingestion Results Section */}
        {importResult && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-emerald-200">
                  Batch Processing Complete
                </h4>
                <p className="text-[11px] text-emerald-300/80 mt-0.5">
                  Transactions have been parsed and ingested into the risk detection model.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase block">Total Scanned</span>
                <span className="text-base font-bold text-slate-200 mt-1 block">
                  {importResult.totalProcessed}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-emerald-500 uppercase block">Accepted</span>
                <span className="text-base font-bold text-emerald-400 mt-1 block">
                  {importResult.successful}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-rose-500 uppercase block">Flagged High</span>
                <span className="text-base font-bold text-rose-400 mt-1 block">
                  {importResult.flaggedHighRisk}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-amber-500 uppercase block">Failed Rows</span>
                <span className="text-base font-bold text-amber-400 mt-1 block">
                  {importResult.failed}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
