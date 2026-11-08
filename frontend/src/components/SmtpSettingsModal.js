import React, { useState } from "react";
import axios from "axios";
import { CheckCircleIcon, ExclamationCircleIcon } from "./Icons";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function SmtpSettingsModal({ isOpen, onClose, onConfigSaved, currentConfig }) {
  const [gmailUser, setGmailUser] = useState(currentConfig?.user || "");
  const [gmailPass, setGmailPass] = useState("");
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e) => {
    e.preventDefault();
    if (!gmailUser.trim()) {
      setFeedback({ type: "error", message: "Please enter your Gmail address." });
      return;
    }
    if (!gmailPass.trim()) {
      setFeedback({ type: "error", message: "Please enter your 16-character Google App Password." });
      return;
    }

    setTesting(true);
    setFeedback(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/config/smtp`, {
        user: gmailUser.trim(),
        pass: gmailPass.trim(),
      });

      if (res.data && res.data.success) {
        setFeedback({
          type: "success",
          message: res.data.message || "Connected to Gmail successfully!",
        });
        if (onConfigSaved) {
          onConfigSaved({
            configured: true,
            user: gmailUser.trim(),
          });
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setFeedback({
          type: "error",
          message: res.data?.message || "Failed to verify credentials with Gmail.",
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message ||
          err.message ||
          "Could not reach server to verify credentials.",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-slate-400 hover:text-white text-xl font-bold leading-none"
          >
            ×
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Connect Gmail</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Use your Gmail + App Password to send real emails
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSaveAndTest} className="p-6 space-y-5">
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
                }`}
            >
              {feedback.type === "success" ? (
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ExclamationCircleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          {/* Guide Box */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 space-y-1.5">
            <span className="font-bold block text-blue-950">
              🔑 How to get your 16-character Google App Password:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-900/90 leading-relaxed">
              <li>Turn on <strong>2-Step Verification</strong> on your Google Account.</li>
              <li>
                Open{" "}
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-blue-700 hover:text-blue-900"
                >
                  myaccount.google.com/apppasswords ↗
                </a>
              </li>
              <li>Type app name <strong>BulkMail</strong> and click <strong>Create</strong>.</li>
              <li>Copy the 16-character code (e.g. <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">abcd efgh ijkl mnop</code>) and paste it below.</li>
            </ol>
          </div>

          {/* Gmail Address Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Sender Gmail Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={gmailUser}
              onChange={(e) => setGmailUser(e.target.value)}
              placeholder="e.g. yourname@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 16-Character App Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              16-Character Google App Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={gmailPass}
              onChange={(e) => setGmailPass(e.target.value)}
              placeholder="•••••••••••••••• (16 characters)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              ⚠️ This is NOT your Gmail password. It's a special 16-character code from Google.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={testing}
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying with Google...</span>
                </>
              ) : (
                <span>Verify & Connect</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
