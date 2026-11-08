import React from "react";
import { ChartBarIcon, PaperAirplaneIcon, CheckCircleIcon, ExclamationCircleIcon, UsersIcon } from "./Icons";

export default function AnalyticsView({ stats, history, onGoToCompose }) {
  const totalCampaigns = stats?.totalCampaigns || history.length || 0;
  const totalRecipients = stats?.totalRecipients || 0;
  const totalSent = stats?.totalSent || 0;
  const totalFailed = stats?.totalFailed || 0;
  const successRate = stats?.successRate !== undefined ? stats.successRate : 100;

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Campaigns */}
        <div className="card-pro p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Campaigns
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalCampaigns}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Dispatched via BulkMail</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ChartBarIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Total Emails Dispatched */}
        <div className="card-pro p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Emails Processed
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalRecipients}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Total recipients targeted</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <UsersIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Success Rate */}
        <div className="card-pro p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Delivery Rate
            </span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{successRate}%</p>
            <span className="text-[11px] text-emerald-600/80 mt-0.5 block">
              {totalSent} delivered successfully
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircleIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Failed Count */}
        <div className="card-pro p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Failed Deliveries
            </span>
            <p className="text-2xl font-black text-red-600 mt-1">{totalFailed}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Bounced or rejected</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <ExclamationCircleIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Rate Breakdown */}
      <div className="card-pro p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Dispatch Performance Ratio</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Delivered ({totalSent})</span>
            <span>Failed ({totalFailed})</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${totalRecipients > 0 ? (totalSent / totalRecipients) * 100 : 100}%` }}
              className="bg-emerald-500 transition-all duration-500"
            />
            <div
              style={{ width: `${totalRecipients > 0 ? (totalFailed / totalRecipients) * 100 : 0}%` }}
              className="bg-red-500 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Deliverability Guidelines */}
      <div className="card-pro p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Email Deliverability Recommendations</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your sender reputation high and land directly in recipient inboxes.
            </p>
          </div>
          <button
            onClick={onGoToCompose}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <PaperAirplaneIcon className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs space-y-1">
            <h4 className="font-bold text-slate-800">1. Clean Email Lists</h4>
            <p className="text-slate-500 leading-relaxed">
              Verify your spreadsheet before uploading. Discard invalid syntax addresses to maintain your domain score.
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs space-y-1">
            <h4 className="font-bold text-slate-800">2. Avoid Spam Triggers</h4>
            <p className="text-slate-500 leading-relaxed">
              Avoid ALL CAPS subjects or multiple exclamation marks. Keep message subjects clear and relevant.
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs space-y-1">
            <h4 className="font-bold text-slate-800">3. Rate Limiting</h4>
            <p className="text-slate-500 leading-relaxed">
              Standard Gmail SMTP allows up to 500 emails/day (or 2,000 for Google Workspace accounts).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
