import React, { useEffect, useState } from "react";
import { PaperAirplaneIcon, HistoryIcon, SparklesIcon } from "./Icons";

export default function SendSuccessModal({ isOpen, onClose, onViewHistory, resultData }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Generate 25 colorful confetti particles
      const colors = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#6366F1"];
      const newParticles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: Math.random() * 90 + 5,
        top: Math.random() * 40 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.4,
        size: Math.random() * 6 + 6,
      }));
      setParticles(newParticles);
    }
  }, [isOpen]);

  if (!isOpen || !resultData) return null;

  const total = resultData.stats?.total || resultData.record?.recipientCount || 0;
  const sent = resultData.stats?.sent || resultData.record?.successCount || total;
  const isSimulated = Boolean(resultData.simulated);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      {/* Confetti Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="confetti-piece rounded-sm"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              backgroundColor: p.color,
              width: `${p.size}px`,
              height: `${p.size * 1.4}px`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden text-center p-8 space-y-6 animate-fadeIn">
        {/* Animated Celebration Icon */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-20 filter blur-sm" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                className="animate-checkmark"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>{isSimulated ? "Test Run Completed" : "Dispatch Confirmed"}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSimulated ? "Simulation Successful! 🚀" : "Emails Dispatched! 🎉"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {resultData.message || `All ${sent} recipients were queued and processed successfully.`}
          </p>
        </div>

        {/* Campaign Metric Cards */}
        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Recipients
            </span>
            <span className="text-xl font-black text-slate-800">{total}</span>
          </div>
          <div className="border-x border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Delivered
            </span>
            <span className="text-xl font-black text-emerald-600">{sent}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Mode
            </span>
            <span className="text-xs font-bold text-indigo-600 uppercase mt-1 block">
              {isSimulated ? "Simulated" : "Live SMTP"}
            </span>
          </div>
        </div>

        {/* Subject snippet */}
        {resultData.record?.subject && (
          <div className="text-left bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Subject</span>
            <span className="font-semibold text-slate-800 truncate block">
              {resultData.record.subject}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              if (onViewHistory) onViewHistory();
            }}
            className="w-full sm:w-1/2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <HistoryIcon className="w-4 h-4 text-slate-500" />
            <span>View Sent History</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-1/2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition active:scale-95"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            <span>Compose Another</span>
          </button>
        </div>
      </div>
    </div>
  );
}

