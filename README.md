# 📬 BulkMail Pro — Full Stack MERN Bulk Email Web Application

A full-stack, production-ready MERN application for managing and sending bulk email campaigns. Built with **React 19**, **Tailwind CSS**, **Node.js/Express**, **Nodemailer**, and **MongoDB (Mongoose)**.

---

## 🌟 Highlights & Key Features

### 1. 🎨 Modern & Responsive Frontend (React + Tailwind CSS)
- **Email Composer**:
  - Compelling subject line input and rich message body editor.
  - Live character and word count statistics.
  - **Quick Templates**: One-click insert for Product Announcements, Newsletters, Event Invitations, and Friendly Reminders.
  - **Interactive Email Preview**: View how the email will render in standard email clients before dispatching.
- **Multiple Recipient Methods**:
  - **Excel / CSV Drag & Drop / Upload**: Automatically scans worksheets (`.xlsx`, `.xls`, `.csv`) and extracts valid email addresses from any column.
  - **Direct / Manual Input**: Paste or type comma, space, or newline-separated emails with instant format validation and duplicate removal.
  - **Sample Template Download**: Download a pre-formatted Excel template (`sample.xlsx`) right from the UI with one click.
  - **Recipient Chips Manager**: Clear, remove individual recipients, and inspect the total queue.
- **Test Mode (Simulated Send)**:
  - Toggle test mode to test delivery workflows without consuming real Gmail quota.
- **Status & Feedback**:
  - Animated progress bars, real-time dispatch feedback, and auto-dismissing toast notifications.

### 2. ⚡ Resilient Backend (Node.js + Express + Nodemailer)
- **High-Reliability Email Dispatcher**:
  - Iterates through recipient lists with individual per-recipient error handling so one invalid address never blocks or crashes the batch.
  - Generates polished, responsive HTML emails with plaintext fallbacks.
  - Returns detailed delivery metrics: total recipients, sent count, failed count, and rejection reasons.
- **Environment & Credential Handling**:
  - Supports configuration via `backend/.env` as well as dynamic MongoDB credentials from the `bulkmail` collection.

### 3. 🍃 MongoDB Database Integration (Mongoose)
- **Sent Campaign History**:
  - Stores each campaign with `subject`, `body`, `recipients`, `recipientCount`, `status` (`sent`, `partial`, `failed`), `successCount`, `failureCount`, and `sentAt`.
  - **In-Memory Resilient Fallback**: If the remote MongoDB cluster is temporarily offline or unreachable, the server gracefully falls back to memory storage so the app remains fully functional.
- **Email History Explorer**:
  - Filter by status (`All`, `Delivered`, `Partial`, `Failed`).
  - Search by subject, content snippet, or recipient email.
  - **Campaign Details Modal**: Inspect full message bodies, copy recipient lists, view failed recipient reasons, or load the campaign straight back into the composer.
  - Delete individual campaign records.

### 4. 📊 Analytics & Insights Dashboard
- Summary KPIs: Total Campaigns Dispatched, Total Recipients Targeted, Overall Delivery Success Rate %, and Failed Counts.
- Deliverability guidelines and best-practice tips.

### 5. 🔐 Admin Authentication
- Admin authentication modal accessible from the top navigation bar.
- Pre-configured administrator credentials (customizable in `.env`).

---

## 📁 Project Architecture

```
BulkMail/
├── backend/
│   ├── models/
│   │   └── EmailHistory.js     # Mongoose schema for sent emails
│   ├── .env                    # Environment configuration (Port, Mongo, SMTP, Admin)
│   ├── index.js                # Express REST API, Nodemailer dispatcher, DB logic
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js             # Sticky modern navigation bar
│   │   │   ├── ComposeMail.js        # Main email composer with templates & file upload
│   │   │   ├── HistoryList.js        # MongoDB campaign history table & filters
│   │   │   ├── EmailDetailsModal.js  # Deep-dive campaign details modal
│   │   │   ├── AnalyticsView.js      # KPI cards & delivery ratio breakdown
│   │   │   ├── SystemStatus.js       # System health & API route viewer
│   │   │   ├── AdminModal.js         # Admin sign-in portal
│   │   │   └── Icons.js              # Inline, dependency-free SVG icons
│   │   ├── App.js                    # Core React application orchestrator
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css                 # Tailwind CSS directives
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Setup Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Check or edit the `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://priyagangadharan01_db_user:18priya2003@cluster0.jpfblfw.mongodb.net/passkey
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   # Optional: set Gmail credentials directly
   # GMAIL_USER=your_email@gmail.com
   # GMAIL_PASS=your_app_password
   ```
3. Start the backend server:
   ```bash
   npm run dev
   # or
   node index.js
   ```
   The backend will run on `http://localhost:5000`.

### 2. Setup Frontend
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Start the React development server:
   ```bash
   npm start
   ```
   The app will open automatically at `http://localhost:3000`.

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/emails/send` | Dispatches bulk emails to recipient list and records to MongoDB |
| `POST` | `/sendmail` | Legacy backward-compatible endpoint (`{ msg, emailList }`) |
| `GET` | `/api/emails/history` | Fetches campaign dispatch history from MongoDB |
| `DELETE` | `/api/emails/history/:id` | Removes an email history entry |
| `GET` | `/api/emails/stats` | Returns aggregate metrics (campaigns, sent, failed, success rate) |
| `POST` | `/api/auth/login` | Validates admin credentials |
| `GET` | `/api/health` | Returns backend, MongoDB, and SMTP readiness status |

---

## 💡 Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

