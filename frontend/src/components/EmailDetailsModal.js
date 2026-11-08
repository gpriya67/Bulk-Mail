import React, { useState } from "react";
import { PaperAirplaneIcon } from "./Icons";

export default function EmailDetailsModal({ item, onClose, onReuse }) {
  const [copied, setCopied] = useState(false);
  if (!item) return null;

  const handleCopyRecipients = () => {
    if (item.recipients) {
      navigator.clipboard.writeText(item.recipients.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-800">Email Campaign Details</span>
            {item.status === "sent" ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                Delivered
              </span>
            ) : item.status === "partial" ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                Partial
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                Failed
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Targets</span>
              <p className="text-base font-bold text-slate-800">
                {item.recipientCount || (item.recipients ? item.recipients.length : 0)}
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase">Delivered</span>
              <p className="text-base font-bold text-emerald-700">
                {item.successCount !== undefined ? item.successCount : item.recipientCount || 0}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-xl border border-red-100">
              <span className="text-[11px] font-semibold text-red-500 uppercase">Failed</span>
              <p className="text-base font-bold text-red-700">{item.failureCount || 0}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Dispatch Date</span>
              <p className="text-xs font-bold text-slate-700 truncate">
                {item.sentAt ? new Date(item.sentAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">Subject</label>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{item.subject}</p>
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">Message Body</label>
            <div className="mt-1 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
              {item.body}
            </div>
          </div>

          {/* Recipients List */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">
                Recipient List ({item.recipients ? item.recipients.length : 0})
              </label>
              <button
                type="button"
                onClick={handleCopyRecipients}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {copied ? "Copied!" : "Copy Emails"}
              </button>
            </div>
            <div className="max-h-36 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap gap-1.5">
              {item.recipients && item.recipients.map((rec, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-xs font-mono text-slate-700"
                >
                  {rec}
                </span>
              ))}
            </div>
          </div>

          {/* Failed Details if any */}
          {item.failedEmails && item.failedEmails.length > 0 && (
            <div className="border border-red-200 bg-red-50/50 rounded-xl p-3">
              <span className="text-xs font-bold text-red-700 block mb-1">
                Failed Recipients Details ({item.failedEmails.length})
              </span>
              <div className="space-y-1 text-xs text-red-600">
                {item.failedEmails.map((f, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="font-mono">{f.email}</span>
                    <span className="text-[11px] text-slate-500">{f.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => {
              onReuse(item);
              onClose();
            }}
            className="flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition"
          >
            <PaperAirplaneIcon className="w-3.5 h-3.5" />
            <span>Load into Composer</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

