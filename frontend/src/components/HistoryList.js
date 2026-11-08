import React, { useState } from "react";
import { HistoryIcon, TrashIcon, EyeIcon, RefreshIcon, CheckCircleIcon, ExclamationCircleIcon } from "./Icons";

export default function HistoryList({ history, onDelete, onReuse, onSelectDetails, loading, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = history.filter((item) => {
    const matchesSearch =
      (item.subject && item.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.body && item.body.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.recipients && item.recipients.some((r) => r.toLowerCase().includes(searchTerm.toLowerCase())));

    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;
    return item.status === statusFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="card-pro p-6 sm:p-7 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">
            CAMPAIGN LOGS
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Sent Email History</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized records from MongoDB database ({history.length} campaigns logged)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 text-xs font-semibold transition"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns or recipients..."
            className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 placeholder-slate-400 bg-slate-50/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
          {["all", "sent", "partial", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg capitalize transition-all ${
                statusFilter === st
                  ? "bg-white text-blue-600 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <HistoryIcon className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-600">
            {searchTerm || statusFilter !== "all"
              ? "No campaigns match your filter."
              : "No email dispatch history recorded yet."}
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Subject & Preview</th>
                  <th className="py-3 px-4">Recipients</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Sent</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <p className="font-bold text-slate-900 truncate">{item.subject}</p>
                      <p className="text-slate-500 truncate mt-0.5">{item.body}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {item.recipientCount || (item.recipients ? item.recipients.length : 0)} sent
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.status === "sent" ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircleIcon className="w-3 h-3" />
                          <span>Delivered</span>
                        </span>
                      ) : item.status === "partial" ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <ExclamationCircleIcon className="w-3 h-3" />
                          <span>Partial</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                          <ExclamationCircleIcon className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(item.sentAt)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => onSelectDetails(item)}
                        title="View Details"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onReuse(item)}
                        title="Reuse Template in Compose"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      >
                        <RefreshIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item._id)}
                        title="Delete Record"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
