import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SidebarNav from "./components/SidebarNav";
import ComposeMail from "./components/ComposeMail";
import HistoryList from "./components/HistoryList";
import AnalyticsView from "./components/AnalyticsView";
import SystemStatus from "./components/SystemStatus";
import AdminModal from "./components/AdminModal";
import EmailDetailsModal from "./components/EmailDetailsModal";
import SendSuccessModal from "./components/SendSuccessModal";
import AIAssistantModal from "./components/AIAssistantModal";
import SmtpSettingsModal from "./components/SmtpSettingsModal";
import { CheckCircleIcon, ExclamationCircleIcon, SparklesIcon } from "./components/Icons";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const PRESET_TEMPLATES = [
  {
    id: "announcement",
    name: "📢 Product Announcement",
    subject: "Exciting New Updates from Our Team! 🚀",
    body: "Hi there,\n\nWe are excited to share some major updates that will make your workflow smoother and faster. Check out what's new in our latest release.\n\nThank you for being part of our community!\n\nBest regards,\nThe Team",
  },
  {
    id: "newsletter",
    name: "📰 Monthly Newsletter",
    subject: "Monthly Digest: Highlights, Tips & News",
    body: "Hello,\n\nWelcome to this month's newsletter! Here is a roundup of our top stories, productivity tips, and insights curated just for you.\n\nEnjoy reading, and feel free to reply with your thoughts!\n\nCheers,\nEditorial Team",
  },
  {
    id: "event",
    name: "🎟️ Event Invitation",
    subject: "You're Invited: Exclusive Virtual Workshop",
    body: "Dear Participant,\n\nYou are cordially invited to attend our upcoming interactive workshop. Space is limited, so make sure to save your spot.\n\nDate: Coming this Thursday\nTime: 6:00 PM EST\n\nWe look forward to seeing you there!\n\nWarm regards,\nEvent Coordinator",
  },
];

function App() {
  const [activeTab, setActiveTab] = useState("compose");
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalRecipients: 0,
    totalSent: 0,
    totalFailed: 0,
    successRate: 100,
  });
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [serverHealth, setServerHealth] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search input in top bar
  const [searchQuery, setSearchQuery] = useState("");

  // Admin state
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem("bulkmail_admin");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // Detail Modal & Prefill
  const [detailsItem, setDetailsItem] = useState(null);
  const [composeInitialData, setComposeInitialData] = useState(null);

  // Success Celebration Modal
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [lastSendResult, setLastSendResult] = useState(null);

  // AI Copilot Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);

  // SMTP Settings Modal
  const [smtpModalOpen, setSmtpModalOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  }, []);

  // Fetch Sent History
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/emails/history`);
      if (res.data && res.data.history) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.warn("Could not load history from backend:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/emails/stats`);
      if (res.data && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.warn("Could not load stats:", err.message);
    }
  }, []);

  // Check System Health
  const checkHealth = useCallback(async () => {
    setCheckingHealth(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/health`);
      setServerHealth(res.data);
    } catch {
      setServerHealth({
        status: "offline",
        dbConnected: false,
        smtpConfigured: false,
      });
    } finally {
      setCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchStats();
    checkHealth();
  }, [fetchHistory, fetchStats, checkHealth]);

  // Handle Send Bulk Mail
  const handleSendEmail = async (payload) => {
    setSending(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/emails/send`, payload);

      if (res.data && res.data.success) {
        setLastSendResult(res.data);
        setSuccessModalOpen(true);
        fetchHistory();
        fetchStats();
      } else if (res.data && res.data.requiresConfig) {
        showToast(
          "info",
          "Demo Mode",
          "Emails logged in demo mode. Click 'Connect Email' in the top bar to enable real delivery."
        );
      } else {
        showToast(
          "warning",
          "Notice",
          res.data?.message || "Could not complete dispatch. Please verify your message and recipients."
        );
      }
    } catch (err) {
      console.warn("Send notification:", err);
      const errMsg =
        err.response?.data?.message || err.message || "Failed to reach the backend email server.";
      showToast("error", "Dispatch Notice", errMsg);
    } finally {
      setSending(false);
    }
  };

  // Handle Delete Record
  const handleDeleteHistory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this email record?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/emails/history/${id}`);
      setHistory((prev) => prev.filter((item) => String(item._id) !== String(id)));
      fetchStats();
      showToast("success", "Deleted", "Email campaign record removed.");
    } catch {
      showToast("error", "Error", "Failed to delete history record.");
    }
  };

  // Handle Reuse in Compose
  const handleReuse = (item) => {
    setComposeInitialData({
      subject: item.subject,
      body: item.body,
      recipients: item.recipients || [],
      senderName: "BulkMail Team",
    });
    setActiveTab("compose");
    showToast("info", "Template Loaded", "Subject and recipients loaded into the composer.");
  };

  const handleApplyTemplate = (tmpl) => {
    setComposeInitialData({
      subject: tmpl.subject,
      body: tmpl.body,
    });
    setActiveTab("compose");
    setTemplateDropdownOpen(false);
    showToast("success", "Template Applied", `Loaded "${tmpl.name}" into editor.`);
  };

  // Admin Login
  const handleAdminLogin = async (username, password) => {
    setAdminLoading(true);
    setAdminError("");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
      if (res.data.success) {
        setAdminUser(res.data.user);
        localStorage.setItem("bulkmail_admin", JSON.stringify(res.data.user));
        setAdminModalOpen(false);
        showToast("success", "Welcome Admin", "Signed in with administrator privileges.");
      } else {
        setAdminError("Invalid credentials");
      }
    } catch (err) {
      setAdminError(err.response?.data?.message || "Invalid admin username or password");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem("bulkmail_admin");
    showToast("info", "Logged Out", "Admin session ended.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] max-w-[calc(100vw-2rem)] sm:max-w-sm w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-4 flex items-start space-x-3 animate-fadeIn">
          {toast.type === "success" && <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
          {toast.type === "error" && <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
          {toast.type === "warning" && <ExclamationCircleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
          {toast.type === "info" && <CheckCircleIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900">{toast.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm shrink-0"
          >
            ×
          </button>
        </div>
      )}

      {/* Fixed Sidebar */}
      <SidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        adminUser={adminUser}
        onOpenAdmin={() => {
          setAdminError("");
          setAdminModalOpen(true);
        }}
        onLogout={handleAdminLogout}
        serverHealth={serverHealth}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area - offset for fixed sidebar on desktop */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-14 sm:h-16 bg-white border-b border-slate-200 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Mobile hamburger + Breadcrumbs */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb matching screenshot: Campaigns / New campaign / Draft */}
            <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-500">
              <span className="hover:text-slate-800 cursor-pointer" onClick={() => setActiveTab("history")}>
                Campaigns
              </span>
              <span>/</span>
              <span className="font-bold text-slate-800">
                {activeTab === "compose"
                  ? "New campaign"
                  : activeTab === "history"
                    ? "History logs"
                    : activeTab === "analytics"
                      ? "Analytics"
                      : "System status"}
              </span>
              {activeTab === "compose" && (
                <>
                  <span>/</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    Draft
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Tools: Search + Templates + AI Copilot */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Search Input */}
            <div className="relative hidden md:block w-48 lg:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <kbd className="absolute right-2.5 top-2 text-[9px] font-mono text-slate-400 bg-white border border-slate-200 rounded px-1">
                ⌘K
              </kbd>
            </div>

            {/* Connect Gmail / SMTP Button */}
            <button
              type="button"
              onClick={() => setSmtpModalOpen(true)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition shadow-2xs ${serverHealth?.smtpConfigured
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${serverHealth?.smtpConfigured ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                  }`}
              />
              <span className="hidden sm:inline">
                {serverHealth?.smtpConfigured ? "Gmail Active" : "Connect Gmail"}
              </span>
              <span className="sm:hidden">Gmail</span>
            </button>

            {/* Templates Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition shadow-2xs"
              >
                Templates
              </button>

              {templateDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                    Choose Template
                  </span>
                  {PRESET_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-medium transition"
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AI Copilot Button */}
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition shadow-2xs"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Copilot</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "compose" && (
            <ComposeMail
              onSend={handleSendEmail}
              sending={sending}
              initialData={composeInitialData}
              pastCampaignsCount={history.length}
              onOpenAIModal={() => setAiModalOpen(true)}
            />
          )}

          {activeTab === "history" && (
            <HistoryList
              history={history}
              onDelete={handleDeleteHistory}
              onReuse={handleReuse}
              onSelectDetails={(item) => setDetailsItem(item)}
              loading={loadingHistory}
              onRefresh={fetchHistory}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsView
              stats={stats}
              history={history}
              onGoToCompose={() => setActiveTab("compose")}
            />
          )}

          {activeTab === "status" && (
            <SystemStatus
              serverHealth={serverHealth}
              onCheckHealth={checkHealth}
              checkingHealth={checkingHealth}
            />
          )}
        </main>
      </div>

      {/* Admin Login Modal */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onLogin={handleAdminLogin}
        error={adminError}
        loading={adminLoading}
      />

      {/* Email Details Modal */}
      <EmailDetailsModal
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
        onReuse={handleReuse}
      />

      {/* Message Sent Celebration Modal */}
      <SendSuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        onViewHistory={() => setActiveTab("history")}
        resultData={lastSendResult}
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        subject={composeInitialData?.subject || ""}
        body={composeInitialData?.body || ""}
        onApplySubject={(newSubject) => {
          setComposeInitialData((prev) => ({ ...prev, subject: newSubject }));
        }}
        onApplyBody={(newBody) => {
          setComposeInitialData((prev) => ({ ...prev, body: newBody }));
        }}
      />

      {/* SMTP / Gmail Settings Modal */}
      <SmtpSettingsModal
        isOpen={smtpModalOpen}
        onClose={() => setSmtpModalOpen(false)}
        onConfigSaved={(cfg) => {
          setServerHealth((prev) => ({
            ...prev,
            smtpConfigured: cfg.configured,
            configuredUser: cfg.user,
          }));
          checkHealth();
        }}
        currentConfig={{ user: serverHealth?.configuredUser || "" }}
      />
    </div>
  );
}

export default App;
