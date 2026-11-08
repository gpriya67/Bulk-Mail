import React from "react";
import { MailIcon, PaperAirplaneIcon, HistoryIcon, ChartBarIcon, LockClosedIcon, ServerIcon } from "./Icons";

export default function Navbar({ activeTab, setActiveTab, historyCount, adminUser, onOpenAdmin, onLogout, serverHealth }) {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("compose")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <MailIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200">
                BulkMail<span className="text-blue-400">Pro</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                MERN Stack
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab("compose")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "compose"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>Compose</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <HistoryIcon className="w-4 h-4" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full bg-slate-700 text-blue-200">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "analytics"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <ChartBarIcon className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("status")}
              className={`hidden md:flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "status"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <ServerIcon className="w-4 h-4" />
              <span>System</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  serverHealth?.dbConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
            </button>
          </nav>

          {/* Admin auth & profile */}
          <div className="flex items-center space-x-3">
            {adminUser ? (
              <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-semibold text-slate-200">Admin</span>
                <button
                  onClick={onLogout}
                  className="text-xs text-red-400 hover:text-red-300 font-medium ml-2 underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdmin}
                className="flex items-center space-x-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg transition"
              >
                <LockClosedIcon className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

