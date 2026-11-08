import React, { useState } from "react";
import { SparklesIcon, CheckCircleIcon } from "./Icons";

// Common spam trigger keywords
const SPAM_TRIGGERS = [
  "100% free",
  "free money",
  "act now",
  "urgent",
  "winner",
  "claim now",
  "credit card",
  "no catch",
  "guarantee",
  "risk-free",
  "click here",
  "exclusive deal",
  "congratulations",
  "unlimited",
  "miracle",
];

export default function AIAssistantModal({
  isOpen,
  onClose,
  subject,
  body,
  onApplySubject,
  onApplyBody,
}) {
  const [activeTab, setActiveTab] = useState("subject"); // 'subject', 'tone', 'spam'
  const [keyword, setKeyword] = useState("");
  const [generatedSubjects, setGeneratedSubjects] = useState([]);
  const [rewrittenBody, setRewrittenBody] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [spamAnalysis, setSpamAnalysis] = useState(null);

  if (!isOpen) return null;

  // 1. AI Subject Generator
  const generateSubjects = () => {
    const topic = (keyword || subject || "our product update").trim();
    const suggestions = [
      {
        type: "High CTR 🔥",
        text: `Quick question about ${topic} [Open inside]`,
        tip: "Curiosity-driven hook",
      },
      {
        type: "Professional 💼",
        text: `Official Notice: Important update regarding ${topic}`,
        tip: "Direct and trustworthy",
      },
      {
        type: "Urgent ⏰",
        text: `Action Required: Final update on ${topic}`,
        tip: "Drives immediate opening",
      },
      {
        type: "Friendly 🤝",
        text: `Hey! Thought you'd appreciate this update on ${topic} 😊`,
        tip: "Personal and welcoming",
      },
      {
        type: "Value-First 💡",
        text: `How to get more from ${topic} starting today`,
        tip: "Focuses on reader benefit",
      },
    ];
    setGeneratedSubjects(suggestions);
  };

  // 2. AI Tone Rewriter
  const handleRewriteTone = (tone) => {
    setSelectedTone(tone);
    if (!body.trim()) {
      setRewrittenBody("Please write some text in the email body first, then click rewrite!");
      return;
    }

    let modified = "";
    if (tone === "professional") {
      modified = `Dear Esteemed Colleague,\n\nI am writing to share key information with you:\n\n${body
        .split("\n")
        .filter(Boolean)
        .map((p) => `• ${p}`)
        .join("\n")}\n\nPlease let us know if you require any further clarification.\n\nSincerely,\nManagement Operations`;
    } else if (tone === "friendly") {
      modified = `Hi there!\n\nHope your week is off to a wonderful start! Just wanted to quickly share something exciting:\n\n${body}\n\nFeel free to hit reply anytime if you have any thoughts or questions!\n\nWarmly,\nYour Friends at BulkMail`;
    } else if (tone === "sales") {
      modified = `Hey there,\n\nWhat if you could save hours this month?\n\nHere is what you need to know:\n👉 ${body}\n\nDon't miss out on this opportunity—reach out to us today to get started!\n\nCheers,\nGrowth Team`;
    } else if (tone === "concise") {
      const firstLine = body.split("\n")[0] || body;
      modified = `Hello,\n\nSummary:\n${firstLine}\n\nKey Action:\nPlease review the details above at your earliest convenience.\n\nThank you.`;
    }

    setRewrittenBody(modified);
  };

  // 3. AI Spam Score & Deliverability Analyzer
  const analyzeSpamScore = () => {
    const combined = `${subject} ${body}`.toLowerCase();
    const foundTriggers = [];

    SPAM_TRIGGERS.forEach((word) => {
      if (combined.includes(word)) {
        foundTriggers.push(word);
      }
    });

    const uppercaseCount = (subject.match(/[A-Z]/g) || []).length;
    const isSubjectAllCaps = subject.length > 5 && uppercaseCount / subject.length > 0.6;
    const exclamationCount = (combined.match(/!{2,}/g) || []).length;

    let score = 100;
    const warnings = [];

    if (foundTriggers.length > 0) {
      score -= foundTriggers.length * 15;
      warnings.push(`Contains spam keywords: ${foundTriggers.map((t) => `"${t}"`).join(", ")}`);
    }

    if (isSubjectAllCaps) {
      score -= 20;
      warnings.push("Subject contains excessive capital letters (avoid ALL CAPS).");
    }

    if (exclamationCount > 0) {
      score -= 10;
      warnings.push("Contains repeated exclamation marks (e.g. '!!!').");
    }

    if (!subject.trim()) {
      score -= 25;
      warnings.push("Email is missing a subject line.");
    }

    if (body.length < 30) {
      score -= 15;
      warnings.push("Email body is very short; filters may flag it as suspicious.");
    }

    const finalScore = Math.max(10, Math.min(100, score));

    setSpamAnalysis({
      score: finalScore,
      warnings,
      status: finalScore >= 80 ? "Excellent" : finalScore >= 60 ? "Moderate" : "High Risk",
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-slate-400 hover:text-white text-xl font-bold"
          >
            ×
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
                <span>AI Email Copilot</span>
                <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                  Smart AI
                </span>
              </h3>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Generate high-converting subjects, polish tones, and test spam deliverability.
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex space-x-2 mt-5 bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("subject")}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === "subject"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ✨ Subject Generator
            </button>
            <button
              onClick={() => {
                setActiveTab("tone");
                handleRewriteTone(selectedTone);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === "tone"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🪄 Tone Rewriter
            </button>
            <button
              onClick={() => {
                setActiveTab("spam");
                analyzeSpamScore();
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === "spam"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🛡️ Spam Checker
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* TAB 1: Subject Generator */}
          {activeTab === "subject" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Topic or Key Idea
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={subject || "e.g., quarterly product announcement"}
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={generateSubjects}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Generate</span>
                  </button>
                </div>
              </div>

              {generatedSubjects.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Choose a Variation
                  </span>
                  {generatedSubjects.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between transition group cursor-pointer"
                      onClick={() => {
                        onApplySubject(item.text);
                        onClose();
                      }}
                    >
                      <div className="space-y-0.5 pr-2">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">
                          {item.type}
                        </span>
                        <p className="text-xs font-semibold text-slate-800">{item.text}</p>
                        <span className="text-[10px] text-slate-400">{item.tip}</span>
                      </div>
                      <button className="text-xs font-bold text-indigo-600 group-hover:text-indigo-800 flex-shrink-0 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                        Use →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Type a topic or click <strong>Generate</strong> to create 5 high-converting subject variations.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Tone Rewriter */}
          {activeTab === "tone" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Select Style Tone</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "professional", label: "Executive 💼" },
                    { id: "friendly", label: "Friendly 😊" },
                    { id: "sales", label: "Persuasive 🚀" },
                    { id: "concise", label: "Concise ✂️" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleRewriteTone(t.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                        selectedTone === t.id
                          ? "bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Rewritten Preview
                </label>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {rewrittenBody || "Click one of the tone buttons above to polish your email body."}
                </div>
              </div>

              {rewrittenBody && (
                <button
                  onClick={() => {
                    onApplyBody(rewrittenBody);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-500/20"
                >
                  Apply to Email Body →
                </button>
              )}
            </div>
          )}

          {/* TAB 3: Spam Deliverability Analyzer */}
          {activeTab === "spam" && (
            <div className="space-y-4">
              {spamAnalysis ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        Deliverability Score
                      </span>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="text-3xl font-black text-slate-900">
                          {spamAnalysis.score}
                        </span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        spamAnalysis.score >= 80
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : spamAnalysis.score >= 60
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-red-100 text-red-800 border border-red-300"
                      }`}
                    >
                      {spamAnalysis.status}
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${spamAnalysis.score}%` }}
                      className={`h-full transition-all duration-500 ${
                        spamAnalysis.score >= 80
                          ? "bg-emerald-500"
                          : spamAnalysis.score >= 60
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>

                  {/* Warnings or Recommendations */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      Recommendations & Insights:
                    </span>
                    {spamAnalysis.warnings.length === 0 ? (
                      <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center space-x-2 border border-emerald-200">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Great job! No high-risk spam triggers or formatting issues detected.</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {spamAnalysis.warnings.map((warn, i) => (
                          <div
                            key={i}
                            className="p-2.5 bg-amber-50 text-amber-800 rounded-xl text-xs flex items-start space-x-2 border border-amber-200"
                          >
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{warn}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <button
                    onClick={analyzeSpamScore}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    Analyze Deliverability Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

