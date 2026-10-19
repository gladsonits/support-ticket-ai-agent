import React from "react";
import {
  ShieldAlert,
  ArrowLeft,
  Lock,
  Terminal,
  AlertOctagon,
} from "lucide-react";
import type { APIResponse } from "../types/ticket";

interface SecurityViolationCardProps {
  response: APIResponse;
  onReset: () => void;
}

export const SecurityViolationCard: React.FC<SecurityViolationCardProps> = ({
  response,
  onReset,
}) => {
  const { message, data } = response;
  const promptInjection = data?.promptinjection;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Try Another Ticket
      </button>

      {/* Main Alert Card */}
      <div className="bg-white rounded-2xl border-2 border-rose-200 shadow-xl overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-rose-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest bg-rose-700/80 px-2 py-0.5 rounded text-rose-100 font-bold">
                {response.status.toUpperCase()}
              </span>
              <h2 className="text-lg font-bold mt-0.5">Pipeline Halted</h2>
            </div>
          </div>
          <AlertOctagon className="w-8 h-8 text-rose-200 opacity-60" />
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Status Message */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-900 text-sm font-medium flex items-center gap-3">
            <Lock className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{message}</span>
          </div>

          {/* Guardrail Details Box */}
          {promptInjection && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Guardrail Analysis
                </span>
                <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 text-xs font-extrabold font-mono border border-rose-200">
                  {promptInjection.label}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 text-slate-900 font-semibold mb-1">
                  <Terminal className="w-4 h-4 text-rose-600" />
                  <span>Threat Reason & Risk Assessment:</span>
                </div>
                <p className="pl-5 text-slate-600 italic">
                  "{promptInjection.reason}"
                </p>
              </div>
            </div>
          )}

          {/* Security Action Recommendation */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Action: Downstream LLM execution blocked.</span>
            <span className="font-mono text-slate-400">
              Code: 403_SECURITY_VIOLATION
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
