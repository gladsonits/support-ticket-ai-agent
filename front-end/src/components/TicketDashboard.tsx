import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Copy,
  Code,
  ArrowLeft,
  Activity,
  Tag,
  BarChart2,
} from "lucide-react";
import type { APIResponse } from "../types/ticket";
import { PIITextViewer } from "./PIITextViewer";
import { JsonViewerModal } from "./JsonViewerModal";

interface TicketDashboardProps {
  response: APIResponse;
  onReset: () => void;
}

export const TicketDashboard: React.FC<TicketDashboardProps> = ({
  response,
  onReset,
}) => {
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const { data } = response;
  const {
    category,
    promptinjection,
    sentiment,
    toxicity,
    pii,
    rawdescription,
    sanitizeddescription,
  } = data;

  const handleCopySanitized = () => {
    navigator.clipboard.writeText(sanitizeddescription);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "Critical":
        return "bg-red-500 text-white animate-pulse";
      case "High":
        return "bg-amber-500 text-white";
      case "Medium":
        return "bg-blue-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Process Another Ticket
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopySanitized}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            {copiedText ? "Copied Clean Text" : "Copy Clean Text"}
          </button>

          <button
            onClick={() => setIsJsonOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Code className="w-3.5 h-3.5" /> View JSON Payload
          </button>
        </div>
      </div>

      {/* Main Ticket Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getUrgencyBadge(category.urgency)}`}
              >
                {category.urgency} Urgency
              </span>
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold flex items-center gap-1">
                <Tag className="w-3 h-3" /> {category.category}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {category.summary}
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">
                Confidence
              </span>
              <span className="text-lg font-bold text-slate-800">
                {(category.confidence_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
              AI
            </div>
          </div>
        </div>

        {/* Prompt Injection Guardrail Status Banner */}
        <div
          className={`mt-6 p-4 rounded-xl border flex items-start gap-4 ${
            promptinjection.is_safe
              ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {promptinjection.is_safe ? (
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">Prompt Injection Defense</h4>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase ${
                  promptinjection.is_safe
                    ? "bg-emerald-200 text-emerald-800"
                    : "bg-rose-200 text-rose-800"
                }`}
              >
                {promptinjection.label}
              </span>
            </div>
            <p className="text-xs mt-1 leading-relaxed text-slate-700">
              {promptinjection.reason}
            </p>
          </div>
        </div>
      </div>

      {/* PII & Text Inspection Component */}
      <PIITextViewer
        rawDescription={rawdescription}
        sanitizedDescription={sanitizeddescription}
        piiEntities={pii}
      />

      {/* Sentiment & Toxicity Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sentiment Analysis Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900">
                Sentiment Metrics
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-bold font-mono">
              {sentiment.label}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Negative Score</span>
                <span className="font-mono">
                  {(sentiment.scores.NEG * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${sentiment.scores.NEG * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Positive Score</span>
                <span className="font-mono">
                  {(sentiment.scores.POS * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${sentiment.scores.POS * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Toxicity Risk Matrix */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-900">Toxicity Analysis</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(toxicity).map(([key, val]) => (
              <div
                key={key}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <span className="text-slate-600 capitalize">
                  {key.replace("_", " ")}
                </span>
                <span
                  className={`font-mono font-bold ${val > 0.1 ? "text-rose-600" : "text-emerald-600"}`}
                >
                  {val.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JSON Payload Modal */}
      <JsonViewerModal
        isOpen={isJsonOpen}
        onClose={() => setIsJsonOpen(false)}
        data={response}
      />
    </div>
  );
};
