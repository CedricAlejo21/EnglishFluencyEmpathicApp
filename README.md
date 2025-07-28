# HueSpeak – English Speaking Fluency Analyzer

A modern web app to analyze and improve your English speaking fluency. Get instant, actionable feedback on speech rate, pauses, fillers, coherence, CEFR rating, and more!

---

## 🚀 Features

- **Upload or Record Speech**: Supports browser microphone selection and audio file upload.
- **Fluency Metrics**: Analyzes speech rate (WPM), pauses, filler words, and coherence (linking words).
  - **Vocabulary Diversity**: Measures the range of unique words you use (type-token ratio), a key factor in TOEFL, IELTS, and PTE scoring.
  - **Grammar Error Detection**: Instantly spots possible grammar mistakes in your transcript, as assessed in global English tests.
  - **Sentence Complexity**: Provides feedback on your average sentence length, reflecting your ability to use complex sentences as in IELTS and PTE.
- **CEFR Rating**: Maps your fluency to the international CEFR scale (A1–C2).
- **Personalized Recommendations**: Actionable, color-coded feedback to help you improve.
- **Modern UI**: Beautiful, responsive, and accessible interface with vibrant gradients and clear visual cues.
- **Tooltips & Explanations**: Hover over info icons to learn what each metric means.
- **Preview & Troubleshooting**: Listen to your recording before analyzing; get clear troubleshooting tips if something doesn’t work.

---

## 📚 Future Recommendations (Rubric-Based Features)

- **Automated Pronunciation Scoring:** Integrate advanced ASR or third-party APIs to assess pronunciation, as done in Versant and PTE.
- **Full Band Scoring:** Map user performance to band descriptors used in IELTS and TOEFL for more granular proficiency feedback.
- **Task Response & Content:** Evaluate how well users address prompts or questions, similar to IELTS speaking tasks.
- **Pronunciation, Grammar, and Lexical Resource:** Expand feedback to cover all rubric areas from international English tests.
- **Adopt Criteria from Versant, TOEFL, IELTS, and Pearson Test of English:** Continue research and implementation to align with these global standards for spoken English assessment.

*Contributions and suggestions from English educators and assessment experts are highly welcome!*

---

## 🖼️ Screenshot

> ![alt text](image.png)

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Chart.js, Framer Motion
- **Backend**: FastAPI (Python), Whisper (speech-to-text), librosa (audio analysis)
- **Other**: Node.js, npm, ffmpeg (audio conversion)

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone "https://github.com/CedricAlejo21/EnglishFluencyEmpathicApp.git"
cd EnglishFluencyEmpathicApp
```

### 2. Backend Setup (FastAPI + Python)

- **Install Python 3.9+**: [Download Python](https://www.python.org/downloads/)
- **Create and activate a virtual environment:**
  ```bash
  python -m venv venv
  # Windows:
  venv\Scripts\activate
  # Mac/Linux:
  source venv/bin/activate
  ```
- **Install dependencies:**
  ```bash
  cd backend
  pip install -r requirements.txt
  ```
- **Install ffmpeg**: [Download ffmpeg](https://ffmpeg.org/download.html) and add it to your system PATH.
  - To check: `ffmpeg -version`
- **Run the backend:**
  ```bash
  python -m uvicorn app.main:app --reload
  ```
  - API runs at [http://localhost:8000](http://localhost:8000)

### 3. Frontend Setup (React + Vite)

- **Install Node.js**: [Download Node.js](https://nodejs.org/)
- **Install dependencies:**
  ```bash
  cd ../frontend
  npm install
  ```
- **Run the frontend:**
  ```bash
  npm run dev
  ```
  - App runs at [http://localhost:5173](http://localhost:5173)

---

## 🌟 Usage

- **Record or upload** your speech.
- **Preview** your audio before analysis.
- Click **Analyze Fluency** and view:
  - Overall assessment
  - CEFR rating
  - Words per minute, pauses, fillers, coherence links
  - Transcript and personalized recommendations
- **Hover** over info icons for explanations.
- **Troubleshooting**: See below if you run into issues.

---

## 🔧 Troubleshooting

- **CORS errors?** Backend must run at `localhost:8000`.
- **ffmpeg not found?** Ensure it’s installed and in your PATH.
- **Mic not detected?** Click “Show Microphones” and allow browser mic access.
- **Audio not analyzed?** Only `.wav`, `.webm`, or `.ogg` files are supported.

---

## 🌐 Deployment

- **Frontend**: Build with `npm run build` in `frontend/`, deploy `dist/` to Vercel, Netlify, or GitHub Pages.
- **Backend**: Deploy FastAPI app to Heroku, Render, AWS, etc. Set CORS for your frontend domain.

---

## 📄 License

MIT

---

## 👥 Authors

- Cedric Alejo & Team

---

## 🤝 Contributions

PRs and issues welcome!
