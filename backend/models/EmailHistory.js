const mongoose = require("mongoose");

const EmailHistorySchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  recipients: {
    type: [String],
    required: true,
  },
  recipientCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["sent", "partial", "failed"],
    default: "sent",
  },
  successCount: {
    type: Number,
    default: 0,
  },
  failureCount: {
    type: Number,
    default: 0,
  },
  failedEmails: [
    {
      email: String,
      reason: String,
    },
  ],
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("EmailHistory", EmailHistorySchema);

