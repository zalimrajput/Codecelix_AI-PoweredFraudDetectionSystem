import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Send, Loader2, Sparkles, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { askAssistant } from '../../api/assistant';
import { AssistantMessage } from '../../types/assistant';

const QUICK_PROMPTS = [
  'Why is the latest flagged customer suspicious?',
  'Show recent fraud alerts and anomalies.',
  'What transactions are connected to active devices?',
  'Summarize current system risk and open cases.',
];

export const GlobalAiAssistant: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSend = async (promptToSend?: string) => {
    const prompt = (promptToSend || inputValue).trim();
    if (!prompt || isLoading) return;

    const userMessage: AssistantMessage = {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      content: prompt,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setApiError(null);

    // Contextually attach investigation or customer ID from current route
    let activeContext: Record<string, string> = {};
    if (location.pathname.startsWith('/investigations/')) {
      const invId = location.pathname.split('/investigations/')[1]?.split('/')[0];
      if (invId && invId !== '') {
        activeContext.investigationId = invId;
      }
    }

    try {
      const response = await askAssistant({
        prompt,
        context: Object.keys(activeContext).length > 0 ? activeContext : undefined,
      });
      const botMessage: AssistantMessage = {
        id: `bot-${Date.now()}`,
        sender: 'ASSISTANT',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : 'Backend endpoint POST /api/assistant/query is not connected yet.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-elevated border border-indigo-400/30 transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label="Open AI Fraud Assistant"
      >
        <Bot className="w-5 h-5 text-indigo-100 transition-transform group-hover:rotate-6" />
        <span className="text-xs font-semibold tracking-wide">AI Assistant</span>
      </button>

      {/* Slide-out Drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position="right"
        width="lg"
      >
        <div className="flex flex-col h-full -m-6">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-100">
                    CodeCelix AI Assistant
                  </h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Gemini 1.5 Pro
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fraud analysis and autonomous risk correlation
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/50 shrink-0">
            <p className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Suggested Investigations
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-[11px] text-left px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700/60 transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 my-auto">
                <div className="w-12 h-12 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-center text-indigo-400 mb-3">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">
                  AI Assistant is ready to analyze investigation data.
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                  Query customer behavior, cross-reference flagged transactions, or inspect multi-hop device connections.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'USER' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-mono text-slate-500">
                      {msg.sender === 'USER' ? 'Analyst' : 'AI Engine'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600">
                      {msg.timestamp}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                      msg.sender === 'USER'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 font-sans'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Analyzing risk graph and live database records...</span>
              </div>
            )}

            {apiError && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold text-rose-200">API Endpoint Notice</p>
                  <p className="text-rose-300/80 mt-0.5">{apiError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 shrink-0">
            <div className="flex items-center gap-2">
              <input
                id="assistant-query-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a customer (e.g. CUST-DEMO-001), device, or recent alerts..."
                disabled={isLoading}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
              <Button
                id="assistant-query-send-btn"
                size="sm"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send
              </Button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Tip: You can mention any Customer ID (e.g. CUST-DEMO-001) or Transaction ID directly in your prompt.
            </p>
          </div>
        </div>
      </Drawer>
    </>
  );
};
