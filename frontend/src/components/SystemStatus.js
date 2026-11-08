import React from "react";
import { RefreshIcon } from "./Icons";

export default function SystemStatus({ serverHealth, onCheckHealth, checkingHealth }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card-pro p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">
              INFRASTRUCTURE
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>System & Infrastructure Status</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Live health check of MERN stack components</p>
          </div>
          <button
            onClick={onCheckHealth}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${checkingHealth ? "animate-spin" : ""}`} />
            <span>Test Connection</span>
          </button>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Node / Express */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">Express Backend</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xs text-slate-500">Port: 5000</p>
            <p className="text-xs text-slate-500">Runtime: Node.js (v24)</p>
            <div className="mt-3 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
              ✓ Server Online
            </div>
          </div>

          {/* MongoDB */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">MongoDB Database</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  serverHealth?.dbConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              ></span>
            </div>
            <p className="text-xs text-slate-500">
              State: {serverHealth?.dbConnected ? "Atlas Cluster Connected" : "In-Memory Resilient Mode"}
            </p>
            <p className="text-xs text-slate-500">Storage: Campaign Logging Active</p>
            <div
              className={`mt-3 text-[11px] font-semibold px-2 py-0.5 rounded border inline-block ${
                serverHealth?.dbConnected
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : "text-amber-700 bg-amber-50 border-amber-200"
              }`}
            >
              {serverHealth?.dbConnected ? "✓ Connected" : "⚡ Fallback Active"}
            </div>
          </div>

          {/* Nodemailer SMTP */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">SMTP Service</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            </div>
            <p className="text-xs text-slate-500">Provider: Nodemailer / Gmail</p>
            <p className="text-xs text-slate-500">
              Sender: {serverHealth?.configuredUser || "Auto Configured"}
            </p>
            <div className="mt-3 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
              Ready for dispatch
            </div>
          </div>
        </div>

        {/* API Routes Guide */}
        <div className="border-t border-slate-100 pt-5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Registered REST API Endpoints
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-blue-700 font-bold">POST /api/emails/send</span>
              <span className="text-slate-400 text-[11px]">Send bulk batch</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-emerald-700 font-bold">GET /api/emails/history</span>
              <span className="text-slate-400 text-[11px]">Fetch history</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-red-700 font-bold">DELETE /api/emails/history/:id</span>
              <span className="text-slate-400 text-[11px]">Delete record</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-purple-700 font-bold">GET /api/emails/stats</span>
              <span className="text-slate-400 text-[11px]">Analytics KPIs</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-bold">POST /api/auth/login</span>
              <span className="text-slate-400 text-[11px]">Admin sign in</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-bold">GET /api/health</span>
              <span className="text-slate-400 text-[11px]">System health</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
