# AGENTS.md — smart-job-applier

## Project Overview
Full-stack job application automation platform. Users upload resumes, get ATS scores, browse matched jobs, generate tailored cover letters, and auto-apply.

## Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Zustand (state management)
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Other:** Cloudinary (file uploads), AI/NLP services (resume parsing, matching, cover letters), Nodemailer (emails)

## Folder Structure
```
client/          # React frontend (Vite)
  src/
    api/         # Axios API wrappers (axiosInstance.js + domain APIs)
    components/  # Reusable UI components (common/, jobs/, resume/, apply/)
    pages/       # Route-level pages
    store/       # Zustand stores (useAuthStore, useJobStore, etc.)
    utils/       # Helpers (fileHelpers, formatters, scoreUtils)
  index.html, vite.config.js, tailwind.config.js
server/          # Express backend
  config/        # DB, Cloudinary, env loaders
  controllers/   # Route handlers
  middleware/    # Auth, errorHandler, upload
  models/        # Mongoose schemas (User, Resume, Job, Application)
  routes/        # Express route definitions
  services/      # Business logic (aiService, emailService, jobFetchService, etc.)
  app.js         # Entry point
```

## Conventions
- **Git:** Branch `main`. Commit messages in present tense (`Add feature`, not `Added feature`).
- **Environment:** Use `.env` files; `.env.example` is provided for both `client/` and `server/`. Never commit real secrets.
- **API:** Base URL configured via env var. Use the provided `axiosInstance.js` for all HTTP calls.
- **Backend Pattern:** Controllers handle HTTP ↔ Services handle logic ↔ Models handle data.
- **Frontend Pattern:** Pages compose components. Components are dumb/presentational where possible; state lives in Zustand stores.
- **Styling:** Tailwind CSS only. No inline styles. Reuse `common/` components (Button, Modal, Badge, etc.).
- **File naming:** PascalCase for components (`JobCard.jsx`), camelCase for utilities (`formatters.js`), kebab-case for routes if needed.

## Important Notes
- `node_modules/` and `.env` files are gitignored. Always use the lockfiles (`package-lock.json`) when adding deps.
- Resume uploads go through Cloudinary (see `server/middleware/upload.js`).
- AI features (ATS scoring, matching, cover letters) live in `server/services/aiService.js`.
- Auth is JWT-based; token handled in `axiosInstance.js` interceptors.

## How to Run
1. `npm install` in root, `client/`, and `server/`.
2. Copy `.env.example` to `.env` and fill values.
3. Root has scripts or run `server/` (Node) and `client/` (Vite) separately.

## Agent Rules
- Do not install new dependencies unless necessary; prefer built-ins or existing stack.
- Keep components modular. If adding a new domain feature, follow existing folder patterns (`api/`, `components/<domain>/`, `store/`).
- Always preserve `.env.example` when adding new env vars.
- Run setup scripts (`setup.sh` / `setup.bat`) for fresh environments.
