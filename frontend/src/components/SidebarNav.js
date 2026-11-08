import React from "react";
import { MailIcon, HistoryIcon, ChartBarIcon, ServerIcon, LockClosedIcon } from "./Icons";

export default function SidebarNav({
  activeTab,
  setActiveTab,
  historyCount = 0,
  adminUser,
  onOpenAdmin,
  onLogout,
  serverHealth,
  mobileOpen,
  setMobileOpen,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container - Fixed on desktop, slide-in on mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out overflow-y-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header & Navigation Links */}
        <div className="p-5 space-y-6">
          {/* Logo & Workspace Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 px-2 py-1">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <MailIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                  BulkMail<span className="text-blue-400">Pro</span>
                </h1>
                <span className="text-[11px] text-slate-400 font-medium block mt-1">
                  MERN Workspace
                </span>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Section: CAMPAIGNS */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 block">
              CAMPAIGNS
            </span>

            {/* Compose */}
            <button
              onClick={() => {
                setActiveTab("compose");
                if (setMobileOpen) setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === "compose"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
            >
              <div className="flex items-center space-x-2.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Compose</span>
              </div>
            </button>

            {/* History */}
            <button
              onClick={() => {
                setActiveTab("history");
                if (setMobileOpen) setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === "history"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
            >
              <div className="flex items-center space-x-2.5">
                <HistoryIcon className="w-4 h-4" />
                <span>History</span>
              </div>
              {historyCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Analytics */}
            <button
              onClick={() => {
                setActiveTab("analytics");
                if (setMobileOpen) setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === "analytics"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
            >
              <div className="flex items-center space-x-2.5">
                <ChartBarIcon className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            </button>
          </div>

          {/* Section: PLATFORM */}
          <div className="space-y-1 pt-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 block">
              PLATFORM
            </span>

            {/* System Status */}
            <button
              onClick={() => {
                setActiveTab("status");
                if (setMobileOpen) setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === "status"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
            >
              <div className="flex items-center space-x-2.5">
                <ServerIcon className="w-4 h-4" />
                <span>System status</span>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${serverHealth?.dbConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Profile / Admin Bar */}
        <div className="p-4 border-t border-slate-800">
          {adminUser ? (
            <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  AD
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block leading-tight truncate">Admin User</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Logged in</span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-[11px] text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded hover:bg-slate-700 transition shrink-0"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <LockClosedIcon className="w-4 h-4 text-slate-400" />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
