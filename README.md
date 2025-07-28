# English Speaking Fluency Analyzer

A modern web app to analyze and improve your English speaking fluency. Get instant feedback on speech rate, pauses, fillers, coherence, and more!

---

## 🚀 Features
- Upload or record your speech (browser mic selection supported)
- Speech rate (WPM), pause, filler, and coherence analysis
- Color-coded, actionable feedback and CEFR scoring
- Beautiful, responsive, and accessible UI

---

## 🖥️ Local Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd EnglishFluencyEmpathicApp
```

### 2. Backend Setup (FastAPI + Python)
#### a. Install Python 3.9+ (if not already installed)
- [Download Python](https://www.python.org/downloads/)

#### b. Create a virtual environment (optional but recommended)
```bash
python -m venv venv
# Activate:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

#### c. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### d. Install ffmpeg (required for audio conversion)
- [Download ffmpeg](https://ffmpeg.org/download.html) and add it to your system PATH.
- To check if installed: `ffmpeg -version`

#### e. Run the backend server
```bash
python -m uvicorn app.main:app --reload
```
- The API will be available at [http://localhost:8000](http://localhost:8000)

---

### 3. Frontend Setup (React + Vite)
#### a. Install Node.js (if not already installed)
- [Download Node.js](https://nodejs.org/)

#### b. Install frontend dependencies
```bash
cd ../frontend
npm install
```

#### c. Run the frontend dev server
```bash
npm run dev
```
- The app will be available at [http://localhost:5173](http://localhost:5173)

---

## 🛠️ Troubleshooting
- **CORS errors?** Make sure the backend is running and accessible at `localhost:8000`.
- **ffmpeg not found?** Ensure ffmpeg is installed and in your PATH.
- **Microphone not detected?** Click "Show Microphones" and allow browser mic access.
- **Audio not analyzed?** Only `.wav`, `.webm`, or `.ogg` files are supported for upload/recording.

---

## 🌐 Deployment (GitHub Pages, Vercel, Netlify, etc.)
- **Frontend:**
  - Build with `npm run build` in `frontend/`.
  - Deploy the `dist/` folder to Vercel, Netlify, or GitHub Pages (for static hosting).
- **Backend:**
  - Deploy the FastAPI app to a cloud service (e.g., Heroku, Render, AWS, etc.).
  - Make sure to set CORS to allow your frontend domain.

---

## 📄 License
MIT

---

## 👥 Authors
- Your Team Names Here

---

## 🤝 Contributions
PRs and issues welcome! 
