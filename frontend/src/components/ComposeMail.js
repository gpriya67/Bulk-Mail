import React, { useState } from "react";
import * as XLSX from "xlsx";
import AIAssistantModal from "./AIAssistantModal";
import {
  PaperAirplaneIcon,
  UploadIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  FileSpreadsheetIcon,
  SparklesIcon,
} from "./Icons";

export default function ComposeMail({
  onSend,
  sending,
  initialData,
  pastCampaignsCount = 0,
  onOpenAIModal,
}) {
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [senderName, setSenderName] = useState(initialData?.senderName || "BulkMail Team");
  const [replyTo, setReplyTo] = useState(initialData?.replyTo || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [manualInput, setManualInput] = useState("");
  const [recipientList, setRecipientList] = useState(initialData?.recipients || []);
  const [recipientRows, setRecipientRows] = useState([]); // Array of { email, name, status }
  const [simulateMode, setSimulateMode] = useState(false);
  const [recipientTab, setRecipientTab] = useState("file"); // 'file' or 'manual'
  const [feedback, setFeedback] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTone, setSelectedTone] = useState("executive");
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Calculate completed steps for checklist & progress (0 to 4)
  const step1 = Boolean(subject.trim());
  const step2 = Boolean(body.trim());
  const step3 = recipientList.length > 0;
  const step4 = simulateMode || (step1 && step2 && step3);
  const completedCount = [step1, step2, step3, step4].filter(Boolean).length;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Insert merge tag
  const insertTag = (tag) => {
    setBody((prev) => prev + " " + tag + " ");
  };

  // Tone switch
  const applyTone = (tone) => {
    setSelectedTone(tone);
    if (!body.trim()) return;

    if (tone === "executive") {
      setBody(
        `Dear Recipient,\n\nPlease review the following information regarding our update:\n\n${body
          .split("\n")
          .filter(Boolean)
          .map((line) => (line.startsWith("•") ? line : `• ${line}`))
          .join("\n")}\n\nRespectfully,\n${senderName}`
      );
    } else if (tone === "warm") {
      setBody(
        `Hi there!\n\nHope your day is going great! Just wanted to share a quick friendly update:\n\n${body}\n\nWarm regards,\n${senderName}`
      );
    }
  };

  // Parse Excel / CSV File
  const processUploadedFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const newRows = [];
        const newEmails = [];

        rows.forEach((row, idx) => {
          if (Array.isArray(row)) {
            let emailFound = null;
            let nameFound = "";

            row.forEach((cell) => {
              if (typeof cell === "string") {
                const candidates = cell.split(/[\s,;]+/);
                candidates.forEach((item) => {
                  const cleaned = item.trim().toLowerCase();
                  if (emailRegex.test(cleaned) && !emailFound) {
                    emailFound = cleaned;
                  }
                });
                if (!emailFound && cell.length > 1 && !nameFound) {
                  nameFound = cell.trim();
                }
              }
            });

            if (emailFound) {
              newEmails.push(emailFound);
              newRows.push({
                email: emailFound,
                name: nameFound || `Recipient #${idx + 1}`,
                status: "Ready",
              });
            }
          }
        });

        if (newEmails.length === 0) {
          setFeedback({
            type: "warning",
            message: "No valid email addresses found in the uploaded file.",
          });
          return;
        }

        // Deduplicate
        const mergedEmails = Array.from(new Set([...recipientList, ...newEmails]));
        setRecipientList(mergedEmails);
        setRecipientRows((prev) => [...prev, ...newRows]);

        setFeedback({
          type: "success",
          message: `Loaded ${newEmails.length} recipient(s) from "${file.name}".`,
        });
      } catch (err) {
        console.error("File parse error:", err);
        setFeedback({
          type: "error",
          message: "Failed to parse file. Please use a valid .xlsx, .xls, or .csv spreadsheet.",
        });
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) processUploadedFile(file);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddManualEmails = () => {
    if (!manualInput.trim()) return;

    const tokens = manualInput.split(/[\s,;\n]+/);
    const valid = [];
    const validRows = [];

    tokens.forEach((item) => {
      const cleaned = item.trim().toLowerCase();
      if (emailRegex.test(cleaned)) {
        valid.push(cleaned);
        validRows.push({
          email: cleaned,
          name: cleaned.split("@")[0],
          status: "Ready",
        });
      }
    });

    if (valid.length === 0) {
      setFeedback({
        type: "warning",
        message: "No valid email addresses found (e.g. user@domain.com).",
      });
      return;
    }

    const merged = Array.from(new Set([...recipientList, ...valid]));
    setRecipientList(merged);
    setRecipientRows((prev) => [...prev, ...validRows]);
    setManualInput("");
    setFeedback({ type: "success", message: `Added ${valid.length} recipient(s).` });
  };

  const removeRecipient = (emailToRemove) => {
    setRecipientList(recipientList.filter((e) => e !== emailToRemove));
    setRecipientRows(recipientRows.filter((r) => r.email !== emailToRemove));
  };

  const clearAllRecipients = () => {
    setRecipientList([]);
    setRecipientRows([]);
  };

  const downloadSampleSpreadsheet = () => {
    const sampleRows = [
      ["Email Address", "Name", "Role"],
      ["sarah.connor@example.com", "Sarah Connor", "Customer"],
      ["alex.miller@example.com", "Alex Miller", "Subscriber"],
      ["developer.test@example.com", "Dev Tester", "Partner"],
      ["priyasangee37@gmail.com", "App Owner", "Admin"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recipients");
    XLSX.writeFile(wb, "sample.xlsx");
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!subject.trim()) {
      setFeedback({ type: "error", message: "Please enter a subject line." });
      return;
    }

    if (!body.trim()) {
      setFeedback({ type: "error", message: "Please write an email body message." });
      return;
    }

    if (recipientList.length === 0) {
      setFeedback({
        type: "error",
        message: "Please add at least one recipient email address.",
      });
      return;
    }

    setFeedback(null);
    onSend({
      subject: subject.trim(),
      body: body.trim(),
      recipients: recipientList,
      senderName: senderName.trim(),
      replyTo: replyTo.trim(),
      simulate: simulateMode,
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        subject={subject}
        body={body}
        onApplySubject={(newSubject) => setSubject(newSubject)}
        onApplyBody={(newBody) => setBody(newBody)}
      />

      {/* Hero Banner Card (Matching Screenshot: Blue Gradient, 2 Stat Cards) */}
      <div className="banner-gradient-blue text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left Text & Segmented Progress */}
          <div className="space-y-3 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 text-blue-100 backdrop-blur-sm">
              NEW CAMPAIGN
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Reach every inbox, personally.
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Upload recipients, personalize your message and send with real-time delivery logs.
            </p>

            {/* Segmented Step Progress Bar */}
            <div className="pt-2 flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5 flex-1 max-w-xs">
                {[1, 2, 3, 4].map((stepIdx) => (
                  <div
                    key={stepIdx}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      stepIdx <= completedCount ? "bg-white" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-blue-100 whitespace-nowrap">
                {completedCount} of 4 steps complete
              </span>
            </div>
          </div>

          {/* Right Two Mini Metric Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
            {/* Metric Card 1 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 w-32 sm:w-40">
              <div className="mb-3">
                <span className="text-[11px] font-medium text-blue-200 block">Queued</span>
                <span className="text-2xl font-black text-white">{recipientList.length}</span>
              </div>
              <div className="border-t border-white/15 pt-2">
                <span className="text-[10px] text-blue-200 block uppercase tracking-wider">Delivery</span>
                <span className="text-xs font-bold text-emerald-300">100% target</span>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 w-32 sm:w-40">
              <div className="mb-3">
                <span className="text-[11px] font-medium text-blue-200 block">Past campaigns</span>
                <span className="text-2xl font-black text-white">{pastCampaignsCount}</span>
              </div>
              <div className="border-t border-white/15 pt-2">
                <span className="text-[10px] text-blue-200 block uppercase tracking-wider">Open rate</span>
                <span className="text-xs font-bold text-white">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-start justify-between p-4 rounded-2xl border text-xs sm:text-sm shadow-xs ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : feedback.type === "warning"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === "success" && <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />}
            {feedback.type === "warning" && <ExclamationCircleIcon className="w-5 h-5 text-amber-600 shrink-0" />}
            {feedback.type === "error" && <ExclamationCircleIcon className="w-5 h-5 text-red-600 shrink-0" />}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2 text-base leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Campaign Details + Message + Before You Send Checklist) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Campaign details */}
          <div className="card-pro p-6 sm:p-7 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Campaign details</h2>
                <p className="text-xs text-slate-500">Who the email comes from and what recipients see first.</p>
              </div>
            </div>

            {/* Sender Name & Reply-to Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sender name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="BulkMail Team"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reply-to (optional)
                </label>
                <input
                  type="email"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Subject Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Subject <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400 font-mono">{subject.length} / 78</span>
              </div>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter a clear, specific subject line"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => setAiModalOpen(true)}
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <SparklesIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Suggest subject lines with AI</span>
              </button>
            </div>
          </div>

          {/* Card 2: Message * */}
          <div className="card-pro p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Message *</h2>
                  <p className="text-xs text-slate-500">HTML and plain text are supported.</p>
                </div>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {body.length} chars • {body.trim() ? body.trim().split(/\s+/).length : 0} words
              </span>
            </div>

            {/* Merge tags & Tone switcher toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-xs text-slate-500 font-medium">Merge tags:</span>
                {["{{Name}}", "{{Email}}", "{{Company}}", "{{Date}}"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertTag(tag)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 font-mono text-[11px] border border-slate-200 transition"
                  >
                    +{tag}
                  </button>
                ))}
              </div>

              {/* Tone pill */}
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-slate-500 font-medium">Tone:</span>
                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => applyTone("executive")}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      selectedTone === "executive"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Executive
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTone("warm")}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      selectedTone === "warm"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Warm
                  </button>
                </div>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              rows={8}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email content here..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 resize-y leading-relaxed"
            />
          </div>

          {/* Card 3: Before you send (Checklist Card) */}
          <div className="card-pro p-6 sm:p-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Before you send</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  step1 ? "bg-emerald-500 text-white" : "border-2 border-slate-300"
                }`}>
                  {step1 && "✓"}
                </span>
                <div>
                  <span className="font-bold text-slate-800 block">Add a subject line</span>
                  <span className="text-slate-500 text-[11px]">Shown in the recipient's inbox</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  step2 ? "bg-emerald-500 text-white" : "border-2 border-slate-300"
                }`}>
                  {step2 && "✓"}
                </span>
                <div>
                  <span className="font-bold text-slate-800 block">Write your message</span>
                  <span className="text-slate-500 text-[11px]">Use merge tags to personalize</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  step3 ? "bg-emerald-500 text-white" : "border-2 border-slate-300"
                }`}>
                  {step3 && "✓"}
                </span>
                <div>
                  <span className="font-bold text-slate-800 block">Add recipients</span>
                  <span className="text-slate-500 text-[11px]">Upload a file or paste addresses</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  simulateMode ? "bg-emerald-500 text-white" : "border-2 border-slate-300"
                }`}>
                  {simulateMode && "✓"}
                </span>
                <div>
                  <span className="font-bold text-slate-800 block">Run a test send</span>
                  <label className="text-blue-600 font-semibold cursor-pointer text-[11px] flex items-center space-x-1 mt-0.5">
                    <input
                      type="checkbox"
                      checked={simulateMode}
                      onChange={(e) => setSimulateMode(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Enable Test mode</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                {completedCount} of 4 steps complete
              </span>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setFeedback({ type: "success", message: "Draft saved locally." })}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                >
                  Save draft
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={sending || recipientList.length === 0}
                  className={`w-1/2 sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition ${
                    sending || recipientList.length === 0
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 active:scale-95"
                  }`}
                >
                  <PaperAirplaneIcon className="w-3.5 h-3.5" />
                  <span>
                    {sending ? "Sending..." : `Send to ${recipientList.length} recipient${recipientList.length !== 1 ? "s" : ""}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recipients Card + Live Preview Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Recipients */}
          <div className="card-pro p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Recipients</h2>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
                {recipientList.length} queued
              </span>
            </div>

            {/* Tabs: Upload file | Paste emails */}
            <div className="flex space-x-3 text-xs font-semibold border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => setRecipientTab("file")}
                className={`pb-1 transition ${
                  recipientTab === "file"
                    ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={() => setRecipientTab("manual")}
                className={`pb-1 transition ${
                  recipientTab === "manual"
                    ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Paste emails
              </button>
            </div>

            {/* Upload file drag & drop mode */}
            {recipientTab === "file" && (
              <div className="space-y-3">
                <label
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                    isDragging
                      ? "border-blue-500 bg-blue-50/70"
                      : "border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <UploadIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Drag and drop or <span className="text-blue-600 underline">browse</span>
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    .xlsx, .xls, .csv - must include an Email column
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Need a template?</span>
                  <button
                    type="button"
                    onClick={downloadSampleSpreadsheet}
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1"
                  >
                    <FileSpreadsheetIcon className="w-3.5 h-3.5" />
                    <span>Download sample.xlsx</span>
                  </button>
                </div>
              </div>
            )}

            {/* Paste emails mode */}
            {recipientTab === "manual" && (
              <div className="space-y-2.5">
                <textarea
                  rows={4}
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste email addresses separated by commas, spaces, or lines..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddManualEmails}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Add emails to queue
                </button>
              </div>
            )}

            {/* Recipients Table (EMAIL | NAME | STATUS) */}
            <div className="pt-2">
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-2 px-3">EMAIL</th>
                      <th className="py-2 px-3">NAME</th>
                      <th className="py-2 px-3 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recipientList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-6 text-center text-slate-400 italic">
                          No recipients added yet.
                        </td>
                      </tr>
                    ) : (
                      recipientList.slice(0, 5).map((email, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-700 truncate max-w-[120px]">
                            {email}
                          </td>
                          <td className="py-2 px-3 text-slate-500 truncate max-w-[80px]">
                            {email.split("@")[0]}
                          </td>
                          <td className="py-2 px-3 text-right flex items-center justify-end space-x-1.5">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Ready
                            </span>
                            <button
                              type="button"
                              onClick={() => removeRecipient(email)}
                              className="text-slate-300 hover:text-red-500 font-bold ml-1 text-sm"
                              title="Remove"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {recipientList.length > 5 && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                  <span>Showing first 5 of {recipientList.length} queued</span>
                  <button
                    type="button"
                    onClick={clearAllRecipients}
                    className="text-red-500 hover:underline font-semibold"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Live preview */}
          <div className="card-pro p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                  <EyeIcon className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Live preview</h2>
              </div>
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Synced</span>
              </span>
            </div>

            {/* Email Client Preview Box */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-200/80">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {senderName ? senderName.charAt(0).toUpperCase() : "B"}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{senderName}</span>
                  <span className="text-[11px] text-slate-400">to Alex Morgan &lt;alex@sample.com&gt;</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {subject || "Your subject appears here"}
                </h4>
                <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed min-h-[60px]">
                  {body || "Your message body content will render here in real time..."}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex justify-between text-[10px] text-slate-400">
                <span>BulkMail Pro Renderer</span>
                <span>Unsubscribe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
