# Smart Job Applier

An AI-powered job application platform built with React, Node.js, MongoDB, and Claude AI.

Upload your resume, discover matched jobs from live APIs, and generate tailored resumes and cover letters — all in one place. Every application requires your explicit confirmation before submission.

---

## Features

- **Resume AI** — Upload a PDF or DOCX and receive an instant AI-powered analysis: role classification, ATS score, skill gaps, strengths
- **Smart Job Matching** — Fetches live jobs from Adzuna (with JSearch fallback) and ranks them by skill overlap, salary fit, experience match, and location
- **5-Step Easy Apply** — AI generates a tailored resume and cover letter per job; you review and edit before confirming
- **Dashboard** — Application history, 30-day activity chart, interview tracking, and skill frequency analysis
- **Profile Management** — Update job preferences and upload a new resume at any time

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3, Zustand, React Router v6 |
| Backend | Node.js 18+, Express.js, MongoDB, Mongoose |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| File Storage | Cloudinary |
| Job APIs | Adzuna (primary), JSearch via RapidAPI (fallback) |
| Email | Nodemailer (Gmail SMTP) |
| Auth | JWT, bcryptjs |

---

## Prerequisites

- Node.js 18 or higher
- npm 8 or higher
- MongoDB Atlas account (free tier is fine)
- Anthropic API key
- Cloudinary account (free tier)
- Adzuna API credentials (free at developer.adzuna.com)

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourname/smart-job-applier.git
cd smart-job-applier
```

### 2. Install all dependencies

```bash
npm install
npm run install:all
```

### 3. Configure the server environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and fill in every value:

```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_32_char_secret
ANTHROPIC_API_KEY=sk-ant-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADZUNA_APP_ID=...
ADZUNA_APP_KEY=...
JSEARCH_API_KEY=...         # optional
EMAIL_USER=...              # optional
EMAIL_PASS=...              # optional
```

### 4. Configure the client environment

```bash
cd ../client
cp .env.example .env
```

The default `VITE_API_URL=http://localhost:5000` works for local development.

### 5. Start both servers

From the root directory:

```bash
npm run dev
```

This starts:
- Backend at `http://localhost:5000`
- Frontend at `http://localhost:5173`

---

## API Reference

### Auth — `/api/auth`

| Method | Path | Body | Auth | Description |
|---|---|---|---|---|
| POST | `/register` | `{ name, email, password }` | No | Create account |
| POST | `/login` | `{ email, password }` | No | Sign in |
| GET | `/me` | — | Yes | Get current user |
| POST | `/logout` | — | No | Sign out |

### Resume — `/api/resume`

| Method | Path | Body | Auth | Description |
|---|---|---|---|---|
| POST | `/upload` | `multipart: resume file` | Yes | Upload and analyse resume |
| GET | `/active` | — | Yes | Get active resume |
| PUT | `/preferences` | `{ desiredRole, experienceLevel, ... }` | Yes | Update job preferences |
| POST | `/ats-score` | `{ jobDescription }` | Yes | Score resume vs job |

### Jobs — `/api/jobs`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/match?page=1&limit=20&role=...` | Yes | Get matched and ranked jobs |
| GET | `/:id` | Yes | Get single job |
| POST | `/save` | Yes | Save a job |
| DELETE | `/save/:jobId` | Yes | Unsave a job |
| GET | `/saved` | Yes | List saved jobs |

### Apply — `/api/apply`

| Method | Path | Body | Auth | Description |
|---|---|---|---|---|
| POST | `/generate` | `{ jobId }` | Yes | Generate tailored docs |
| POST | `/confirm` | `{ jobId, coverLetter, tailoredResumeText }` | Yes | Confirm application |
| GET | `/history` | — | Yes | Application history |
| PATCH | `/:id/status` | `{ status }` | Yes | Update status |

---

## Folder Structure

```
smart-job-applier/
├── client/                     React + Vite frontend
│   └── src/
│       ├── api/                Axios API call wrappers
│       ├── components/         UI components (common, resume, jobs, apply)
│       ├── pages/              Route-level page components
│       ├── store/              Zustand global state stores
│       ├── hooks/              Custom React hooks
│       └── utils/              Formatting and helper functions
├── server/                     Express backend
│   ├── config/                 DB, Cloudinary, env validation
│   ├── controllers/            Route handler logic
│   ├── middleware/             Auth, upload, error handling
│   ├── models/                 Mongoose schemas
│   ├── routes/                 Express route definitions
│   └── services/              AI, job fetch, matching, email, parser
└── package.json                Root script runner
```

---

## Deployment

### Backend — Render.com

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the Root Directory to `server`
4. Build command: `npm install`
5. Start command: `node app.js`
6. Add all environment variables from `server/.env.example`

### Frontend — Vercel

1. Import your GitHub repository on Vercel
2. Set the Root Directory to `client`
3. Framework preset: Vite
4. Add environment variable: `VITE_API_URL=https://your-render-api.onrender.com`
5. Deploy

### Database — MongoDB Atlas

1. Create a free cluster at mongodb.com/atlas
2. Create a database user and allow access from anywhere (0.0.0.0/0) or your server IP
3. Copy the connection string into `MONGODB_URI`

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default 5000) |
| `NODE_ENV` | No | `development` or `production` |
| `CLIENT_URL` | Yes | Frontend URL for CORS |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Token expiry (default `7d`) |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `ADZUNA_APP_ID` | Yes | Adzuna application ID |
| `ADZUNA_APP_KEY` | Yes | Adzuna application key |
| `JSEARCH_API_KEY` | No | RapidAPI key for JSearch fallback |
| `EMAIL_HOST` | No | SMTP host (e.g. smtp.gmail.com) |
| `EMAIL_PORT` | No | SMTP port (default 587) |
| `EMAIL_USER` | No | SMTP username |
| `EMAIL_PASS` | No | SMTP app password |
