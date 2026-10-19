import React, { useState } from "react";
import { ShieldCheck, Eye, Lock, FileText, Cpu } from "lucide-react";
import type { PIIEntity } from "../types/ticket";

interface PIITextViewerProps {
  rawDescription: string;
  sanitizedDescription: string;
  piiEntities: PIIEntity[];
}

export const PIITextViewer: React.FC<PIITextViewerProps> = ({
  rawDescription,
  sanitizedDescription,
  piiEntities,
}) => {
  const [activeTab, setActiveTab] = useState<"sanitized" | "raw" | "split">(
    "sanitized",
  );

  const renderSanitizedWithHighlights = (text: string) => {
    const parts = text.split(/(<[A-Z_]+>)/g);
    return parts.map((part, index) => {
      if (part.startsWith("<") && part.endsWith(">")) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 mx-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono shadow-sm"
          >
            <Lock className="w-3 h-3 mr-1" />
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-slate-900">
            PII Redaction & Sanitization
          </h3>
        </div>

        {/* View Toggle Tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab("sanitized")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
              activeTab === "sanitized"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-600" /> Scrubbed View
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
              activeTab === "raw"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" /> Raw Original
          </button>
          <button
            onClick={() => setActiveTab("split")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
              activeTab === "split"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" /> Side-by-Side
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "sanitized" && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed font-sans">
          {renderSanitizedWithHighlights(sanitizedDescription)}
        </div>
      )}

      {activeTab === "raw" && (
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-800 text-sm leading-relaxed font-sans">
          {rawDescription}
        </div>
      )}

      {activeTab === "split" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 text-slate-800 text-xs leading-relaxed">
            <span className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">
              Original Raw Text
            </span>
            {rawDescription}
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 text-slate-800 text-xs leading-relaxed">
            <span className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">
              Sanitized (Safe for LLM)
            </span>
            {renderSanitizedWithHighlights(sanitizedDescription)}
          </div>
        </div>
      )}

      {/* Detected PII Entities List */}
      {piiEntities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
            Detected Entities ({piiEntities.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {piiEntities.map((entity, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-mono">
                      {entity.entity_type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-slate-400" />
                    <span>{entity.recognition_metadata.recognizer_name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700">
                    {(entity.score * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
