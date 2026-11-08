const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Load .env if present
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const EmailHistory = require("./models/EmailHistory");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://priyagangadharan01_db_user:18priya2003@cluster0.jpfblfw.mongodb.net/passkey";
const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin123";

app.use(cors());
app.use(express.json());

// In-memory fallback in case MongoDB connection drops or is unavailable in local sandbox
let inMemoryHistory = [];
let isDbConnected = false;

// Connect to MongoDB with timeout settings
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    isDbConnected = true;
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    isDbConnected = false;
    console.warn(
      "MongoDB connection notice: Running with in-memory fallback. Reason:",
      err.message
    );
  });

mongoose.connection.on("connected", () => {
  isDbConnected = true;
});
mongoose.connection.on("disconnected", () => {
  isDbConnected = false;
});

// Credentials model for legacy passkey collection
const Credential = mongoose.model("credential", {}, "bulkmail");

// Helper function to resolve Gmail credentials
async function getSmtpCredentials() {
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    };
  }

  if (isDbConnected) {
    try {
      const data = await Credential.find();
      if (data && data.length > 0) {
        const item = data[0].toJSON ? data[0].toJSON() : data[0];
        if (item.user && item.pass) {
          return { user: item.user, pass: item.pass };
        }
      }
    } catch (e) {
      console.warn("Could not load credentials from DB:", e.message);
    }
  }

  return {
    user: process.env.GMAIL_USER || "",
    pass: process.env.GMAIL_PASS || "",
  };
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check & status
app.get("/api/health", async (req, res) => {
  const creds = await getSmtpCredentials();
  res.json({
    status: "online",
    dbConnected: isDbConnected,
    smtpConfigured: Boolean(creds.user && creds.pass && creds.pass.trim() !== ""),
    configuredUser: creds.user ? creds.user.replace(/(?<=.{3}).(?=.*@)/g, "*") : null,
  });
});

// SMTP Config endpoints
app.get("/api/config/smtp", async (req, res) => {
  const creds = await getSmtpCredentials();
  res.json({
    configured: Boolean(creds.user && creds.pass && creds.pass.trim() !== ""),
    user: creds.user || "",
  });
});

app.post("/api/config/smtp", async (req, res) => {
  const { user, pass } = req.body;
  if (!user || !pass) {
    return res.json({ success: false, message: "Gmail address and App Password are required." });
  }

  const cleanUser = user.trim().toLowerCase();
  const cleanPass = pass.replace(/\s+/g, "");

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: cleanUser,
        pass: cleanPass,
      },
    });

    await transporter.verify();

    process.env.GMAIL_USER = cleanUser;
    process.env.GMAIL_PASS = cleanPass;

    try {
      const envFile = path.join(__dirname, ".env");
      let envText = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf-8") : "";

      if (envText.includes("GMAIL_USER=")) {
        envText = envText.replace(/#?\s*GMAIL_USER=.*(\r?\n|$)/g, `GMAIL_USER=${cleanUser}\n`);
      } else {
        envText += `\nGMAIL_USER=${cleanUser}\n`;
      }

      if (envText.includes("GMAIL_PASS=")) {
        envText = envText.replace(/#?\s*GMAIL_PASS=.*(\r?\n|$)/g, `GMAIL_PASS=${cleanPass}\n`);
      } else {
        envText += `GMAIL_PASS=${cleanPass}\n`;
      }

      fs.writeFileSync(envFile, envText, "utf-8");
    } catch (e) {
      console.warn("Could not save to .env:", e.message);
    }

    if (isDbConnected) {
      try {
        await Credential.deleteMany({});
        await Credential.create({ user: cleanUser, pass: cleanPass });
      } catch (dbErr) {
        console.warn("Could not save to DB credential:", dbErr.message);
      }
    }

    return res.json({
      success: true,
      message: "Gmail connected successfully! Real email delivery is now active.",
      user: cleanUser,
    });
  } catch (err) {
    console.error("Gmail verification error:", err.message);

    let friendlyMsg = err.message || "Bad credentials";
    if (friendlyMsg.includes("535") || friendlyMsg.includes("Username and Password")) {
      friendlyMsg =
        "Wrong password. You must use a 16-character App Password (NOT your regular Gmail password). " +
        "Go to myaccount.google.com/apppasswords to create one.";
    }

    return res.json({
      success: false,
      message: friendlyMsg,
    });
  }
});

// 2. Admin Authentication
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({
      success: true,
      message: "Admin authentication successful",
      user: {
        username: ADMIN_USER,
        role: "admin",
      },
      token: "admin-session-token-" + Date.now(),
    });
  }
  return res.status(401).json({
    success: false,
    message: "Invalid admin username or password",
  });
});

// 3. Send Bulk Mail API
app.post("/api/emails/send", async (req, res) => {
  try {
    const { subject, body, msg, emailList, recipients, senderName, simulate } = req.body;
    const finalSubject = (subject || "A Message from Bulk Mail App").trim();
    const finalBody = (body || msg || "").trim();
    const rawList = Array.isArray(recipients) ? recipients : emailList;

    if (!finalBody) {
      return res.json({
        success: false,
        message: "Please enter an email body message before dispatching.",
      });
    }

    if (!Array.isArray(rawList) || rawList.length === 0) {
      return res.json({
        success: false,
        message: "Please add at least one recipient email address (via spreadsheet or paste).",
      });
    }

    // Clean & validate email list
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanedList = Array.from(
      new Set(
        rawList
          .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
          .filter((e) => emailRegex.test(e))
      )
    );

    if (cleanedList.length === 0) {
      return res.json({
        success: false,
        message: "None of the recipients in the queue had a valid email format (e.g. user@domain.com).",
      });
    }

    console.log(`[SendMail] Starting bulk mail job for ${cleanedList.length} recipient(s)...`);

    const creds = await getSmtpCredentials();
    const hasLiveCreds = Boolean(creds.user && creds.pass && creds.pass.trim() !== "");
    let isSimulated = Boolean(simulate);

    // Auto-switch to demo mode if no credentials are configured
    if (!isSimulated && !hasLiveCreds) {
      isSimulated = true;
      console.log("[SendMail] No Gmail credentials configured - auto-switching to demo mode");
    }

    const fromAddress = senderName
      ? `"${senderName}" <${creds.user || "bulkmail@app.com"}>`
      : creds.user || "bulkmail@app.com";

    const successfulEmails = [];
    const failedEmails = [];

    if (isSimulated) {
      console.log(
        `[SendMail] Simulated send mode active for ${cleanedList.length} recipient(s)`
      );
      for (const email of cleanedList) {
        successfulEmails.push(email);
      }
    } else {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: creds.user,
          pass: creds.pass.replace(/\s+/g, ""),
        },
      });

      // Send to each recipient with individual error capture
      for (const email of cleanedList) {
        try {
          await transporter.sendMail({
            from: fromAddress,
            to: email,
            subject: finalSubject,
            text: finalBody,
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 15px;">
              <h2 style="color: #9333ea; margin-top: 0;">${finalSubject}</h2>
              <div style="white-space: pre-wrap; font-size: 15px; margin: 20px 0;">${finalBody}</div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 25px;" />
              <p style="font-size: 12px; color: #9ca3af;">Sent via BulkMail Pro Web Application</p>
            </div>`,
          });
          successfulEmails.push(email);
          console.log(`[SendMail] Successfully sent to: ${email}`);
        } catch (mailErr) {
          console.error(`[SendMail] Failed to send to ${email}:`, mailErr.message);
          failedEmails.push({
            email,
            reason: mailErr.message || "Delivery failed",
          });
        }
      }
    }

    const overallStatus =
      failedEmails.length === 0
        ? "sent"
        : successfulEmails.length > 0
        ? "partial"
        : "failed";

    const recordData = {
      subject: finalSubject,
      body: finalBody,
      recipients: cleanedList,
      recipientCount: cleanedList.length,
      status: overallStatus,
      successCount: successfulEmails.length,
      failureCount: failedEmails.length,
      failedEmails: failedEmails,
      sentAt: new Date(),
    };

    let savedRecord = null;
    if (isDbConnected) {
      try {
        savedRecord = await EmailHistory.create(recordData);
      } catch (dbErr) {
        console.warn("Could not save to MongoDB, saving in memory fallback:", dbErr.message);
      }
    }

    if (!savedRecord) {
      recordData._id = "mem_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      inMemoryHistory.unshift(recordData);
      savedRecord = recordData;
    }

    const demoNotice =
      isSimulated && !hasLiveCreds
        ? " (Demo Mode — emails logged but not delivered. Click 'Connect Gmail' to set up your App Password for real delivery.)"
        : "";

    return res.json({
      success: overallStatus !== "failed",
      status: overallStatus,
      simulated: isSimulated,
      message:
        overallStatus === "sent"
          ? `All ${successfulEmails.length} email(s) were processed successfully!${demoNotice}`
          : overallStatus === "partial"
          ? `Dispatched ${successfulEmails.length} email(s), but ${failedEmails.length} failed.${demoNotice}`
          : `Failed to deliver to all ${failedEmails.length} recipient(s).`,
      stats: {
        total: cleanedList.length,
        sent: successfulEmails.length,
        failed: failedEmails.length,
        failedDetails: failedEmails,
      },
      record: savedRecord,
    });
  } catch (err) {
    console.error("[SendMail API Error]", err);
    return res.json({
      success: false,
      message: "An unexpected error occurred while processing: " + err.message,
    });
  }
});

// 4. Fetch Sent Email History
app.get("/api/emails/history", async (req, res) => {
  try {
    let history = [];
    if (isDbConnected) {
      try {
        history = await EmailHistory.find().sort({ sentAt: -1 }).limit(100);
      } catch (dbErr) {
        console.warn("Error reading from MongoDB, returning in-memory history:", dbErr.message);
        history = inMemoryHistory;
      }
    } else {
      history = inMemoryHistory;
    }

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (err) {
    console.error("[Get History Error]", err);
    res.status(500).json({ success: false, message: "Failed to fetch email history" });
  }
});

// 5. Delete Email History Record
app.delete("/api/emails/history/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected && !id.startsWith("mem_")) {
      await EmailHistory.findByIdAndDelete(id);
    }
    inMemoryHistory = inMemoryHistory.filter((item) => String(item._id) !== String(id));
    res.json({ success: true, message: "History record deleted successfully" });
  } catch (err) {
    console.error("[Delete History Error]", err);
    res.status(500).json({ success: false, message: "Failed to delete record" });
  }
});

// 6. Email Analytics & Stats
app.get("/api/emails/stats", async (req, res) => {
  try {
    let allRecords = [];
    if (isDbConnected) {
      try {
        allRecords = await EmailHistory.find();
      } catch {
        allRecords = inMemoryHistory;
      }
    } else {
      allRecords = inMemoryHistory;
    }

    const totalCampaigns = allRecords.length;
    let totalRecipients = 0;
    let totalSent = 0;
    let totalFailed = 0;

    allRecords.forEach((r) => {
      totalRecipients += r.recipientCount || (r.recipients ? r.recipients.length : 0);
      totalSent += r.successCount || 0;
      totalFailed += r.failureCount || 0;
    });

    const successRate =
      totalRecipients > 0 ? Math.round((totalSent / totalRecipients) * 100) : 100;

    res.json({
      success: true,
      stats: {
        totalCampaigns,
        totalRecipients,
        totalSent,
        totalFailed,
        successRate,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to compute stats" });
  }
});

// 7. Legacy backwards-compatible /sendmail endpoint
app.post("/sendmail", async (req, res) => {
  const msg = req.body.msg;
  const emailList = req.body.emailList;

  if (!emailList || !Array.isArray(emailList) || emailList.length === 0) {
    return res.send(false);
  }

  try {
    const creds = await getSmtpCredentials();
    if (!creds.user || !creds.pass) {
      console.error("No Gmail credentials configured for legacy /sendmail");
      return res.send(false);
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: creds.user,
        pass: creds.pass,
      },
    });

    let successCount = 0;
    for (var i = 0; i < emailList.length; i++) {
      try {
        await transporter.sendMail({
          from: creds.user,
          to: emailList[i],
          subject: "A Message from Bulk Mail App",
          text: msg || "",
        });
        successCount++;
      } catch (e) {
        console.error("Error sending to " + emailList[i], e.message);
      }
    }

    // Save history
    const record = {
      subject: "A Message from Bulk Mail App",
      body: msg || "",
      recipients: emailList,
      recipientCount: emailList.length,
      status: successCount === emailList.length ? "sent" : "partial",
      successCount: successCount,
      failureCount: emailList.length - successCount,
      sentAt: new Date(),
    };

    if (isDbConnected) {
      await EmailHistory.create(record).catch(() => {});
    } else {
      record._id = "mem_" + Date.now();
      inMemoryHistory.unshift(record);
    }

    res.send(successCount > 0);
  } catch (err) {
    console.error("Legacy /sendmail error:", err);
    res.send(false);
  }
});

// Only listen when running directly (not as Vercel serverless)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`BulkMail Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
