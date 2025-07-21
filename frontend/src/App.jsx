import { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaUpload, FaHeadphones, FaWaveSquare, FaCheckCircle, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const COLORFUL_BG = (
  <svg className="absolute -z-10 top-0 left-0 w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="1200" cy="100" rx="340" ry="120" fill="#a5b4fc" fillOpacity="0.45" />
    <ellipse cx="300" cy="800" rx="400" ry="140" fill="#fbcfe8" fillOpacity="0.35" />
    <ellipse cx="200" cy="200" rx="180" ry="80" fill="#fef08a" fillOpacity="0.25" />
    <ellipse cx="1200" cy="700" rx="220" ry="90" fill="#6ee7b7" fillOpacity="0.18" />
    <ellipse cx="700" cy="400" rx="300" ry="120" fill="#f472b6" fillOpacity="0.10" />
  </svg>
);

const colorMap = {
  red: 'bg-red-100 text-red-700 border-red-300',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  green: 'bg-green-100 text-green-700 border-green-300',
};

function App() {
  const [file, setFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordFormat, setRecordFormat] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [micPermission, setMicPermission] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Fetch available audio input devices after permission
  const getMicrophones = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter((d) => d.kind === 'audioinput');
      setDevices(audioInputs);
      if (audioInputs.length > 0) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
    } catch {
      alert('Microphone access denied or not available.');
    }
  };

  useEffect(() => {
    navigator.permissions?.query({ name: 'microphone' }).then((res) => {
      if (res.state === 'granted') getMicrophones();
    }).catch(() => {});
  }, []);

  // For react-speech-recognition (text only, not audio)
  const { transcript, resetTranscript } = useSpeechRecognition();

  // Handle file upload (audio only)
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setAudioURL(null); // Clear any previous recording
    setResult(null);
  };

  // Handle file submit
  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    let audioToSend = file;
    if (!audioToSend && audioURL) {
      // Convert audioURL to Blob
      const response = await fetch(audioURL);
      const blob = await response.blob();
      audioToSend = new File([blob], 'recording.wav', { type: blob.type });
    }
    if (!audioToSend) {
      alert('Please select or record an audio file first!');
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('file', audioToSend);
    try {
      const response = await fetch('http://localhost:8000/analyze-fluency', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file.');
    } finally {
      setLoading(false);
    }
  };

  // Recording logic using MediaRecorder API
  const handleStartRecording = async () => {
    setFile(null); // Clear file input
    setAudioURL(null);
    setResult(null);
    setRecording(true);
    resetTranscript();
    try {
      const constraints = {
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      } else {
        alert('Your browser does not support audio recording in a compatible format. Please upload a .wav file.');
        setRecording(false);
        return;
      }
      setRecordFormat(mimeType);
      mediaRecorderRef.current = new window.MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      alert('Microphone access denied or not available.');
      setRecording(false);
    }
  };

  const handleStopRecording = () => {
    setRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  // --- UI ---
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50 overflow-x-hidden font-sans">
      {COLORFUL_BG}
      {/* Hero Section */}
      <header className="w-full py-10 px-4 flex flex-col items-center text-center bg-transparent">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary drop-shadow mb-4 tracking-tight flex items-center justify-center gap-3">
            <FaWaveSquare className="text-pink-400 animate-pulse" />
            SpeakFluent
          </h1>
          <p className="text-xl md:text-2xl text-blue-700 font-semibold mb-4">
            Analyze your English speaking fluency in seconds. Get instant, actionable feedback!
          </p>
        </div>
      </header>
      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center py-4 px-2">
        <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
          {/* Left: Upload/Record */}
          <section className="md:w-1/2 w-full bg-white/80 shadow-2xl rounded-3xl p-8 flex flex-col gap-6 border border-blue-200 backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-pink-500 flex items-center gap-2 mb-2"><FaMicrophone /> Upload or Record</h2>
            <label className="block">
              <span className="block text-blue-700 font-semibold mb-1">Upload Audio File</span>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-100 file:text-blue-700 hover:file:bg-pink-200 transition"
                />
                <span className="inline-flex items-center gap-1 text-pink-400 font-semibold"><FaUpload /> Audio</span>
              </div>
            </label>
            <div className="flex flex-col items-center gap-2">
              <span className="block text-blue-700 font-semibold">Or record directly:</span>
              {!micPermission && (
                <button
                  className="mb-2 px-3 py-1 rounded border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 transition font-semibold"
                  onClick={getMicrophones}
                >
                  Show Microphones
                </button>
              )}
              {micPermission && devices.length > 0 && (
                <select
                  className="mb-2 px-3 py-1 rounded border border-blue-300 text-blue-700 bg-white"
                  value={selectedDeviceId}
                  onChange={e => setSelectedDeviceId(e.target.value)}
                >
                  {devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId}`}</option>
                  ))}
                </select>
              )}
              {recordFormat && (
                <span className="text-xs text-gray-500">Recording format: <b>{recordFormat}</b></span>
              )}
              <div className="flex gap-3">
                {!recording ? (
                  <button
                    onClick={handleStartRecording}
                    className="bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500 focus:ring-2 focus:ring-pink-200 text-white px-7 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2 text-lg transition-all duration-200"
                  >
                    <FaMicrophone className="text-xl" /> Start Recording
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="bg-gradient-to-r from-red-500 to-pink-400 hover:from-red-600 hover:to-pink-500 focus:ring-2 focus:ring-red-200 text-white px-7 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2 text-lg animate-pulse transition-all duration-200"
                  >
                    <FaStop className="text-xl" /> Stop Recording
                  </button>
                )}
              </div>
              {audioURL && (
                <audio controls src={audioURL} className="mt-2 w-full rounded shadow-lg border border-blue-200" />
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="sticky bottom-0 w-full bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500 focus:ring-2 focus:ring-pink-200 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-xl transition-all duration-200 mt-2 tracking-wide uppercase disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </section>
          {/* Right: Results */}
          <section className="md:w-1/2 w-full bg-white/80 shadow-2xl rounded-3xl p-8 flex flex-col gap-6 border border-green-200 backdrop-blur-lg justify-center">
            {result ? (
              <div className={`p-6 rounded-2xl border-2 shadow-lg text-center ${colorMap[result.color] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                {/* Color-coded badge/banner */}
                <div className={`flex items-center justify-center gap-2 mb-4 text-2xl font-bold rounded-xl px-4 py-2 w-fit mx-auto
                  ${result.color === 'green' ? 'bg-green-200 text-green-800' : result.color === 'red' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}
                >
                  {result.color === 'green' && <FaCheckCircle className="text-green-500" />}
                  {result.color === 'red' && <FaExclamationTriangle className="text-red-500" />}
                  {result.color === 'yellow' && <FaLightbulb className="text-yellow-500" />}
                  {result.color === 'green' ? 'High Fluency' : result.color === 'red' ? 'Low Fluency' : 'Moderate Fluency'}
                </div>
                <h2 className={`text-2xl font-bold mb-2 flex items-center justify-center gap-2 ${result.color === 'green' ? 'text-green-600' : result.color === 'red' ? 'text-red-600' : 'text-yellow-600'}`}>
                  <FaHeadphones /> Speech Rate: <span className="text-3xl">{result.speech_rate_wpm} WPM</span>
                </h2>
                <div className="flex flex-wrap justify-center gap-4 my-3">
                  <div className="flex flex-col items-center"><span className="font-bold text-lg">{result.word_count}</span><span className="text-xs text-gray-500">Words</span></div>
                  <div className="flex flex-col items-center"><span className="font-bold text-lg">{result.duration_sec}</span><span className="text-xs text-gray-500">Seconds</span></div>
                  <div className="flex flex-col items-center"><span className="font-bold text-lg">{result.pauses}</span><span className="text-xs text-gray-500">Pauses</span></div>
                  <div className="flex flex-col items-center"><span className="font-bold text-lg">{result.filler_count}</span><span className="text-xs text-gray-500">Fillers</span></div>
                  <div className="flex flex-col items-center"><span className="font-bold text-lg">{result.coherence_count}</span><span className="text-xs text-gray-500">Linking Words</span></div>
                  <div className={`flex flex-col items-center ${result.color === 'green' ? 'text-green-700' : result.color === 'red' ? 'text-red-700' : 'text-yellow-700'}`}><span className="font-bold text-lg">{result.cefr_level}</span><span className="text-xs text-gray-500">CEFR Level</span></div>
                </div>
                <div className="mt-3 text-left">
                  <div className="font-semibold text-blue-700 mb-1">Transcript:</div>
                  <div className="bg-white/80 rounded p-2 text-gray-700 text-sm border border-blue-100 max-h-32 overflow-y-auto">
                    {result.transcript}
                  </div>
                </div>
                {/* Actionable feedback */}
                <div className="mt-4 flex flex-col gap-2">
                  <div className="font-semibold text-pink-500 mb-1 flex items-center gap-2"><FaLightbulb /> Actionable Insights:</div>
                  {result.feedback && result.feedback.map((tip, i) => (
                    <div key={i} className={`flex items-center gap-2 text-base rounded px-2 py-1
                      ${tip.includes('good') || tip.includes('Good') ? 'bg-green-100 text-green-700' :
                        tip.includes('avoid') || tip.includes('reduce') || tip.includes('Try') ? 'bg-yellow-100 text-yellow-700' :
                        'bg-pink-100 text-pink-700'}`}
                    >
                      {tip.includes('good') || tip.includes('Good') ? <FaCheckCircle className="text-green-400" /> : <FaExclamationTriangle className="text-yellow-500" />} {tip}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <FaHeadphones className="text-5xl mb-2" />
                <span className="text-lg font-semibold">Your results will appear here after analysis.</span>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App; 