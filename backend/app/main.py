from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import subprocess
import re
import librosa
import numpy as np
import whisper
import language_tool_python

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FILLER_WORDS = [
    "um", "uh", "like", "you know", "so", "actually", "basically", "right", "well", "hmm", "er", "ah", "okay"
]
LINKING_WORDS = [
    "because", "however", "therefore", "moreover", "in addition", "for example", "for instance", "on the other hand", "furthermore", "consequently", "thus", "since", "although", "but", "and", "or", "so that", "as a result"
]

CEFR_LEVELS = [
    (0, 60, "A1"),
    (60, 90, "A2"),
    (90, 110, "B1"),
    (110, 130, "B2"),
    (130, 160, "C1"),
    (160, 1000, "C2"),
]

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/analyze-fluency")
async def analyze_fluency(file: UploadFile = File(...)):
    # Save uploaded file to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[-1]) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # Convert to wav using ffmpeg
    wav_path = tmp_path + '.wav'
    try:
        subprocess.run([
            'ffmpeg', '-y', '-i', tmp_path, '-ar', '16000', '-ac', '1', wav_path
        ], check=True, capture_output=True)
    except Exception as e:
        os.remove(tmp_path)
        return {"error": f"Audio conversion failed: {str(e)}"}

    # Use Whisper to transcribe and get duration
    try:
        model = whisper.load_model("base")
        result = model.transcribe(wav_path)
        text = result["text"]
        # Get duration using librosa
        y, sr_ = librosa.load(wav_path, sr=None)
        duration = librosa.get_duration(y=y, sr=sr_)
    except Exception as e:
        os.remove(tmp_path)
        os.remove(wav_path)
        return {"error": f"Speech recognition failed: {str(e)}"}

    # Vocabulary Diversity (type-token ratio)
    tokens = [w for w in re.findall(r'\b\w+\b', text.lower()) if w.isalpha()]
    unique_tokens = set(tokens)
    vocab_diversity = len(unique_tokens) / len(tokens) if tokens else 0

    # Grammar Error Count
    tool = language_tool_python.LanguageTool('en-US')
    grammar_matches = tool.check(text)
    grammar_errors = len(grammar_matches)

    # Sentence Complexity (average sentence length)
    sentences = re.split(r'[.!?]', text)
    sentence_lengths = [len(s.split()) for s in sentences if s.strip()]
    avg_sentence_length = float(np.mean(sentence_lengths)) if sentence_lengths else 0

    # Calculate words per minute
    word_count = len(text.split())
    minutes = duration / 60 if duration > 0 else 1
    wpm = word_count / minutes

    # Pause/Hesitation Detection (using librosa for silence)
    intervals = librosa.effects.split(y, top_db=30)  # non-silent intervals
    total_speech = sum((end - start) for start, end in intervals)
    total_silence = len(y) - total_speech
    # Count pauses as silent gaps longer than 0.4s
    pauses = 0
    prev_end = 0
    for start, end in intervals:
        silence_len = (start - prev_end) / sr_ if prev_end > 0 else 0
        if silence_len > 0.4:
            pauses += 1
        prev_end = end
    # Also count trailing silence
    if (len(y) - prev_end) / sr_ > 0.4:
        pauses += 1

    # Filler word detection
    filler_count = 0
    for word in FILLER_WORDS:
        filler_count += len(re.findall(r'\b' + re.escape(word) + r'\b', text, re.IGNORECASE))

    # Coherence evaluation (count linking words)
    coherence_count = 0
    used_linkers = set()
    for word in LINKING_WORDS:
        found = len(re.findall(r'\b' + re.escape(word) + r'\b', text, re.IGNORECASE))
        coherence_count += found
        if found:
            used_linkers.add(word)

    # CEFR scoring (based on WPM)
    cefr = next((level for low, high, level in CEFR_LEVELS if low <= wpm < high), "A1")

    # Feedback
    feedbacks = []
    color = "yellow"
    if wpm < 90:
        feedbacks.append("Your speech rate is a bit slow. Try to speak a little faster.")
        color = "red"
    elif wpm > 160:
        feedbacks.append("Your speech rate is quite fast. Try to slow down for clarity.")
        color = "red"
    elif 90 <= wpm <= 120:
        feedbacks.append("Good pace! This is a comfortable rate for most listeners.")
        color = "green"
    else:
        feedbacks.append("Your speech rate is within a normal range.")
        color = "yellow"

    if pauses > 5:
        feedbacks.append(f"Detected {pauses} long pauses. Try to reduce long pauses for smoother speech.")
    if filler_count > 2:
        feedbacks.append(f"Detected {filler_count} filler words. Try to avoid filler words like 'um', 'uh', or 'like'. Practice with tongue twisters or reading aloud.")
    if coherence_count < 2:
        missing = ', '.join([w for w in LINKING_WORDS[:5] if w not in used_linkers])
        feedbacks.append(f"Try to use more linking words (e.g., {missing}) to improve coherence and flow.")
    else:
        feedbacks.append("Good use of linking words for coherence!")

    if vocab_diversity < 0.4:
        feedbacks.append("Try to use a wider range of vocabulary to improve your lexical resource (as in TOEFL/IELTS rubrics).")
    else:
        feedbacks.append("Good range of vocabulary used!")

    if grammar_errors > 3:
        feedbacks.append(f"{grammar_errors} possible grammar issues detected. Review your sentences for grammatical accuracy.")
    else:
        feedbacks.append("Few grammar issues detected. Well done!")

    if avg_sentence_length < 8:
        feedbacks.append("Try to use longer or more complex sentences for higher fluency scores (IELTS/PTE).")
    elif avg_sentence_length > 20:
        feedbacks.append("Some sentences are quite long. Ensure clarity and avoid run-ons.")
    else:
        feedbacks.append("Good sentence structure and complexity.")

    # Clean up temp files
    os.remove(tmp_path)
    os.remove(wav_path)

    return {
        "speech_rate_wpm": round(wpm, 1),
        "word_count": word_count,
        "duration_sec": round(duration, 1),
        "pauses": pauses,
        "filler_count": filler_count,
        "coherence_count": coherence_count,
        "cefr_level": cefr,
        "feedback": feedbacks,
        "color": color,
        "transcript": text,
        "used_linkers": list(used_linkers),
        "total_silence_sec": round(total_silence / sr_, 2),
        "vocab_diversity": round(vocab_diversity, 3),
        "grammar_errors": grammar_errors,
        "avg_sentence_length": round(avg_sentence_length, 1)
    } 