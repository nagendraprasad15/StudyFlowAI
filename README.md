# StudyFlow AI — AI-Powered Student Productivity Platform

StudyFlow AI is a production-ready, full-stack student productivity platform designed to help students organize curriculum schedules, condense notes using AI, generate active-recall quizzes, and maximize study sessions using a gamified Pomodoro timer. 

This MERN-stack application is optimized for hackathon presentations, featuring a stunning glassmorphic dark-mode interface, pre-seeded demo metrics for immediate visualization, and semantic context RAG search.

---

## 🚀 Key Hackathon Highlights

1. **AI Study Planner**: Formulates dynamic schedules, priority topics, and revision timetables based on target dates and hourly study capacity.
2. **Notes PDF Summarizer**: Paste text or upload lecture PDFs. Extracted text is summarized using Gemini AI into markdown files with flippable active-recall flashcards.
3. **AI Quiz Generator (RAG support)**: Compiles MCQs or True/False questions dynamically. Users can select an uploaded note to generate questions directly based on custom class notes.
4. **AI Tutor Assistant**: Chat room featuring suggestions, typing indicators, and semantic context retrieval to explain concepts or debug exam mistakes.
5. **Gamified Focus Mode (Pomodoro)**: Custom 25/5/15 minute study loops. Sessions write focus times into MongoDB and reward user XP levels and badges.
6. **Analytics Dashboard**: Responsive Recharts bar and line graphs mapping study distributions, quiz accuracy averages, flagged weak topics, streaks, and recent activities.
7. **Bypass Demo System**: Single-click credentials bypass on Login/Signup to pre-load a completed student portfolio with 7 days of historical stats.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite compiler) + Tailwind CSS v4 + Framer Motion + React Router + Lucide Icons + Recharts + React Markdown + jsPDF.
- **Backend**: Node.js + Express.js + Mongoose + @google/generative-ai (Gemini SDK) + Multer + pdf-parse (server-side text extraction).
- **Security & Logging**: Helmet headers + Express Rate Limit + Morgan logs + CORS whitelists.
- **Database**: MongoDB Atlas.

---

## 📂 Project Structure

```
studyflow-ai/
├── backend/
│   ├── config/             # Database connection & env validation
│   ├── controllers/        # Express controllers (auth, planner, notes, quiz, focus, stats)
│   ├── middleware/         # Auth verify, Multer upload, global error handlers, AI request limits
│   ├── models/             # Mongoose Schemas (User, Stats, Note, Quiz, QuizAttempt, Planner, StudyPlan)
│   ├── routes/             # Express routes
│   ├── services/           # Gemini AI SDK & semantic chunks retrievals
│   ├── utils/              # Async handlers & AI JSON scrubbers
│   ├── .env.example
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Centralized API layer (axios config, notesApi, quizApi, focusApi, aiApi)
│   │   ├── components/     # Reusable components (Loader, ProgressRing, StatCard, Sidebar, Navbar, etc.)
│   │   ├── context/        # Auth states provider & XP updates
│   │   ├── layouts/        # Dashboard layout overlays
│   │   ├── pages/          # Landing, Dashboard, Planner, Notes, Quiz, Chat Assistant, Focus, Auth Forms
│   │   ├── App.jsx         # Routes mapping & Toaster alerts configs
│   │   ├── index.css       # Tailwind v4 directives & glass effects
│   │   └── main.jsx
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## ⚙️ Installation & Local Setup

### Prerequisite Setup
1. Clone the repository into your local workspace.
2. Obtain a **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).
3. Obtain a **MongoDB connection URI** from MongoDB Atlas.

### 1. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   copy .env.example .env
   ```
4. Edit the `.env` file with your credentials:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/studyflow?retryWrites=true&w=majority
   JWT_SECRET=your_custom_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key_from_ai_studio
   NODE_ENV=development
   ```
5. Launch the server in development mode (auto-refresh using Nodemon):
   ```bash
   npm run dev
   ```

### 2. Frontend Configuration
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser at the local URL (usually `http://localhost:5173`).

---

## 📑 API Documentation Summary

All endpoints (except login/register) require standard Bearer token authentication headers:
`Authorization: Bearer <JWT_Token>`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Sign up new account & seed 7-day demo metrics | No |
| **POST** | `/api/auth/login` | Log in user | No |
| **GET** | `/api/auth/profile` | Retrieve active profile details | Yes |
| **POST** | `/api/planner/generate` | AI-generated study schedule (Gemini) | Yes (AI Limit check) |
| **GET** | `/api/planner/active` | Fetch active AI plan schedule | Yes |
| **PUT** | `/api/planner/active/task` | Toggle completion for active AI plan sub-task | Yes |
| **GET** | `/api/planner` | Fetch user checklist tasks | Yes |
| **POST** | `/api/planner` | Create checklist task | Yes |
| **PUT** | `/api/planner/:id` | Update checklist task details | Yes |
| **DELETE** | `/api/planner/:id` | Delete checklist task | Yes |
| **POST** | `/api/notes/summarize` | AI condense pasted text or uploaded PDF (Multer) | Yes (AI Limit check) |
| **GET** | `/api/notes` | Fetch saved note summaries | Yes |
| **DELETE** | `/api/notes/:id` | Delete note summary | Yes |
| **POST** | `/api/quiz/generate` | AI build practice test (supports note context RAG) | Yes (AI Limit check) |
| **POST** | `/api/quiz/submit` | Grade quiz, award XP points, log weak topics | Yes |
| **GET** | `/api/quiz/history` | Retrieve quiz attempts logs | Yes |
| **POST** | `/api/chat/message` | Conversational message tutor (supports RAG context) | Yes (AI Limit check) |
| **GET** | `/api/chat/history` | Fetch chat threads listing | Yes |
| **GET** | `/api/stats/dashboard` | Compile streak, weekly study minutes, and line scores | Yes |
| **POST** | `/api/focus/log-session` | Log focus block (25m), increment sessions & user XP | Yes |

---

## 🚀 Production Deployment

### Backend → Deploy on Render
1. Create a Web Service linked to your Git Repository.
2. Select environment as **Node**.
3. Set Build Command to `npm install` (run in backend subdirectory or configure root settings).
4. Set Start Command to `node server.js`.
5. Add environment variables in Render config dashboards: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `NODE_ENV=production`.

### Frontend → Deploy on Vercel
1. Create a Project on Vercel linking your repository.
2. Set Framework Preset to **Vite**.
3. Set Root Directory to `frontend`.
4. Configure Build Command to `npm run build` and Output Directory to `dist`.
5. Add Environment Variable: `VITE_API_BASE_URL` pointing to your deployed Render URL (e.g. `https://studyflow-backend.onrender.com/api`).
6. Deploy.
