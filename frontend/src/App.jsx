import { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Upload, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  BarChart3,
  FileAudio,
  Settings,
  TrendingUp,
  Clock,
  MessageCircle,
  Link,
  Bot,
  FileText
} from 'lucide-react';

export default function App() {
  const [file, setFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordFormat, setRecordFormat] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [micPermission, setMicPermission] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
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

  // Handle file upload (audio only)
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setAudioURL(null);
    setResult(null);
  };

  // Handle file submit
  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    let audioToSend = file;
    if (!audioToSend && audioURL) {
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
    setFile(null);
    setAudioURL(null);
    setResult(null);
    setRecording(true);
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

  const getScoreColor = (cefr) => {
    switch(cefr) {
      case 'C2': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'C1': return 'text-green-600 bg-green-50 border-green-200';
      case 'B2': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'B1': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const getFluencyStatus = (color) => {
    switch(color) {
      case 'green': return { text: 'Excellent Fluency', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'yellow': return { text: 'Good Progress', icon: TrendingUp, color: 'text-amber-600 bg-amber-50 border-amber-200' };
      default: return { text: 'Needs Practice', icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-indigo-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg ring-2 ring-indigo-200/50">
                  <img src="/favicon.svg" alt="HueSpeak Logo" className="w-full h-full object-cover" />
                </div>
              <div className="flex flex-col items-start">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-none mb-0">HueSpeak</h1>
                <p className="text-sm text-gray-600 mt-0">Improve your English speaking skills</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Bot className="w-6 h-6 text-indigo-500" />
              <span>Powered by OpenAI Whisper</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Input */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-200/50 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Get Started</h2>
                
                {/* Tab Navigation */}
                <div className="flex rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 p-1 mb-6">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'upload' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('record')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'record' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>Record</span>
                  </button>
                </div>

                {/* Upload Tab */}
                {activeTab === 'upload' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Audio File
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                      </div>
                      {file && (
                        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                          <FileAudio className="w-4 h-4" />
                          <span className="truncate">{file.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Record Tab */}
                {activeTab === 'record' && (
                  <div className="space-y-4">
                    {!micPermission && (
                      <button
                        onClick={getMicrophones}
                        className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Enable Microphone</span>
                      </button>
                    )}
                    
                    {devices.length > 0 && (
                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Microphone
                      </label>
                      <select
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {devices.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      {!recording ? (
                        <button
                          onClick={handleStartRecording}
                          disabled={!micPermission}
                          className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Start Recording</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleStopRecording}
                          className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Square className="w-4 h-4" />
                          <span>Stop Recording</span>
                        </button>
                      )}
                    </div>

                    {audioURL && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Preview Recording
                        </label>
                        <audio controls src={audioURL} className="w-full" />
                      </div>
                    )}
                  </div>
                )}

                {/* Analyze Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || (!file && !audioURL)}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4" />
                        <span>Analyze Fluency</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-200/50 min-h-[600px]">
              <div className="p-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Analysis Results</h2>
                
                {result ? (
                  <div className="space-y-8">
                    
                    {/* Score Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl border ${getFluencyStatus(result.color).color}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            {(() => {
                              const StatusIcon = getFluencyStatus(result.color).icon;
                              return <StatusIcon className="w-5 h-5" />;
                            })()}
                            <div>
                              <p className="font-medium">{getFluencyStatus(result.color).text}</p>
                              <p className="text-sm opacity-80">Overall Assessment</p>
                            </div>
                          </div>
                          <div className="group relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute z-10 left-1/2 transform -translate-x-1/2 mt-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-sm text-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                              This is an overall assessment of your English fluency based on multiple factors including speech rate, pauses, and filler words. It gives you a quick understanding of your current speaking level.
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-xl border ${getScoreColor(result.cefr_level)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="w-5 h-5" />
                            <div>
                              <p className="font-medium">{result.cefr_level} Level</p>
                              <p className="text-sm opacity-80">CEFR Rating</p>
                            </div>
                          </div>
                          <div className="group relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute z-10 left-1/2 transform -translate-x-1/2 mt-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-sm text-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                              CEFR (Common European Framework of Reference) is an international standard for describing language ability. Levels range from A1 (beginner) to C2 (proficient). This rating helps you understand your English proficiency in a globally recognized format.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 group relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="ml-2 text-2xl font-bold text-blue-900">{result.speech_rate_wpm}</span>
                          </div>
                          <div className="group relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 hover:text-blue-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute z-10 left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-xs text-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                              The average number of words you speak per minute. Native speakers typically range between 120-150 WPM for clear communication.
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-blue-700 font-medium">Words per Minute</p>
                      </div>
                      
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 group relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            <span className="ml-2 text-2xl font-bold text-amber-900">{result.pauses}</span>
                          </div>
                          <div className="group relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400 hover:text-amber-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute z-10 left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-xs text-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                              The number of noticeable pauses in your speech. While some pauses are natural, too many can make your speech sound hesitant or unprepared.
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-amber-700 font-medium">Pauses</p>
                      </div>
                      
                      <div className="bg-red-50 rounded-xl p-4 border border-red-200 group relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <MessageCircle className="w-5 h-5 text-red-600" />
                            <span className="ml-2 text-2xl font-bold text-red-900">{result.filler_count}</span>
                          </div>
                          <div className="group relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 hover:text-red-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute z-10 left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-xs text-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                              Words or sounds like 'um', 'uh', 'like', or 'you know' that don't add meaning. Occasional use is normal, but excessive fillers can make speech less clear.
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-red-700 font-medium">Filler Words</p>
                      </div>
                      
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200 group relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Link className="w-5 h-5 text-green-600" />
                            <span className="ml-2 text-2xl font-bold text-green-900">{result.coherence_count}</span>
                          </div>
                          <div className="group relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400 hover:text-green-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute z-10 left-1/2 transform -translate-x-1/2 mt-2 w-48 p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-xs text-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                              The number of logical connections between your ideas. Higher values indicate better flow and organization in your speech.
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-green-700 font-medium">Coherence Links</p>
                      </div>
                    </div>

                    {/* Transcript */}
                    {result.transcript && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <h3 className="font-medium text-gray-900">Transcript</h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <p className="text-gray-700 leading-relaxed">
                            {result.transcript}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    {result.feedback && result.feedback.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="w-5 h-5 text-gray-600" />
                          <h3 className="font-medium text-gray-900">Personalized Recommendations</h3>
                        </div>
                        <div className="space-y-3">
                          {result.feedback.map((tip, i) => {
                            const isPositive = tip.toLowerCase().includes('good') || tip.toLowerCase().includes('excellent');
                            const isWarning = tip.toLowerCase().includes('avoid') || tip.toLowerCase().includes('reduce');
                            const colorClass = isPositive 
                              ? 'bg-green-50 border-green-200 text-green-800' 
                              : isWarning 
                              ? 'bg-red-50 border-red-200 text-red-800'
                              : 'bg-blue-50 border-blue-200 text-blue-800';
                            
                            const Icon = isPositive ? CheckCircle : isWarning ? AlertTriangle : Lightbulb;
                            
                            return (
                              <div key={i} className={`flex items-center space-x-3 p-4 rounded-xl border ${colorClass}`}>
                                <div className="flex-shrink-0">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <p className="text-sm font-medium leading-relaxed">{tip}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                    <BarChart3 className="w-16 h-16 mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">Ready to analyze your speech</h3>
                    <p className="text-center text-gray-400 max-w-md">
                      Upload an audio file or record yourself speaking to get detailed fluency analysis and personalized feedback.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}