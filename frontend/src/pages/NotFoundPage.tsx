import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 font-sans">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 mb-5 shadow-card">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-100">404 - Telemetry Path Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm mt-2 mb-6 leading-relaxed">
        The requested routing node does not map to an active interface in the CodeCelix platform.
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Return Back
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/dashboard')}
          leftIcon={<Home className="w-3.5 h-3.5" />}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
