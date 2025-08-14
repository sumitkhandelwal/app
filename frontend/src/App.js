import React, { useState, useEffect, useRef } from 'react';
import { Plus, Mic, BarChart2, PieChart, CheckCircle, Clock, XCircle, Sparkles, X, LogIn, UserPlus, Mail, Lock, ShoppingBag } from 'lucide-react';

// --- API Helper ---
// A dedicated place for all backend communication
const API_URL = "http://127.0.0.1:8000";

const api = {
    login: async (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        const response = await fetch(`${API_URL}/token`, { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Failed to login');
        return response.json();
    },
    signup: async (fullName, email, password) => {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name: fullName, email, password }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to sign up');
        }
        return response.json();
    },
    getStories: async (token) => {
        const response = await fetch(`${API_URL}/stories`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch stories');
        return response.json();
    },
    generateStory: async (command, token) => {
        const response = await fetch(`${API_URL}/ai/generate-story`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ command }),
        });
        if (!response.ok) throw new Error('AI story generation failed');
        return response.json();
    },
    summarizeTasks: async (command, stories, token) => {
        const response = await fetch(`${API_URL}/ai/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ command, stories }),
        });
        if (!response.ok) throw new Error('AI summary failed');
        return response.json();
    },
    textToSpeech: async (text, token) => {
        const response = await fetch(`${API_URL}/ai/speak`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ text }),
        });
        if (!response.ok) throw new Error('Text-to-speech failed');
        return response.json();
    }
};


// --- Main App Component (Router) ---
export default function App() {
    const [token, setToken] = useState(localStorage.getItem('onestop_token'));

    const handleLoginSuccess = (newToken) => {
        localStorage.setItem('onestop_token', newToken);
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('onestop_token');
        setToken(null);
    };

    if (!token) {
        return <AuthPage onLoginSuccess={handleLoginSuccess} />;
    }

    return <DashboardPage token={token} onLogout={handleLogout} />;
}


// --- Authentication Page ---
const AuthPage = ({ onLoginSuccess }) => {
    const [authMode, setAuthMode] = useState('login');
    const renderForm = () => {
        switch (authMode) {
            case 'signup': return <SignupForm onSwitchToLogin={() => setAuthMode('login')} />;
            case 'forgot': return <ForgotPasswordForm onSwitchToLogin={() => setAuthMode('login')} />;
            default: return <LoginForm onLoginSuccess={onLoginSuccess} onSwitchToSignup={() => setAuthMode('signup')} onSwitchToForgot={() => setAuthMode('forgot')} />;
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col justify-center items-center p-4 font-sans">
             <div className="absolute top-5 left-5 flex items-center space-x-3">
                <LogoIcon />
                <h1 className="text-2xl font-bold tracking-tighter text-gray-900">ONE STOP SHOP</h1>
            </div>
            <div className="w-full max-w-md">{renderForm()}</div>
            <footer className="absolute bottom-5 text-gray-400 text-sm">© {new Date().getFullYear()} ONE STOP SHOP. All Rights Reserved.</footer>
        </div>
    );
};

const AuthFormContainer = ({ title, children }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-8 w-full">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">{title}</h2>
        {children}
    </div>
);

const InputField = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
        <input {...props} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 pl-10 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
    </div>
);

const LoginForm = ({ onLoginSuccess, onSwitchToSignup, onSwitchToForgot }) => {
    const [email, setEmail] = useState('test@onestop.shop');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const data = await api.login(email, password);
            onLoginSuccess(data.access_token);
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthFormContainer title="Welcome Back!">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg mb-6 text-center text-sm">
                <p>Use the test credentials below to sign in.</p>
            </div>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
            <form onSubmit={handleLogin} className="space-y-6">
                <InputField icon={<Mail className="w-5 h-5 text-gray-400"/>} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <InputField icon={<Lock className="w-5 h-5 text-gray-400"/>} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className="text-right"><button type="button" onClick={onSwitchToForgot} className="text-sm text-blue-600 hover:underline">Forgot Password?</button></div>
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:scale-100">
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
                <p className="text-center text-sm text-gray-500">Don't have an account? <button type="button" onClick={onSwitchToSignup} className="font-semibold text-blue-600 hover:underline">Sign Up</button></p>
            </form>
        </AuthFormContainer>
    );
};

const SignupForm = ({ onSwitchToLogin }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const data = await api.signup(fullName, email, password);
            setMessage(data.message);
        } catch (err) {
            setError(err.message || 'Sign up failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthFormContainer title="Create an Account">
            {message && <p className="bg-green-100 text-green-800 p-3 rounded-lg mb-4 text-sm">{message}</p>}
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
            {!message && (
                <form onSubmit={handleSignup} className="space-y-6">
                    <InputField icon={<UserPlus className="w-5 h-5 text-gray-400"/>} type="text" placeholder="Full Name" required value={fullName} onChange={e => setFullName(e.target.value)} />
                    <InputField icon={<Mail className="w-5 h-5 text-gray-400"/>} type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
                    <InputField icon={<Lock className="w-5 h-5 text-gray-400"/>} type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:bg-gray-400">
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
            )}
            <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <button type="button" onClick={onSwitchToLogin} className="font-semibold text-blue-600 hover:underline">Sign In</button></p>
        </AuthFormContainer>
    );
};

const ForgotPasswordForm = ({ onSwitchToLogin }) => {
    const [message, setMessage] = useState('');
    const handleReset = (e) => { e.preventDefault(); setMessage('If an account with that email exists, a password reset link has been sent.'); };
    return (
        <AuthFormContainer title="Reset Password">
            {message ? <p className="bg-blue-100 text-blue-800 p-3 rounded-lg mb-4 text-sm">{message}</p> : (
                <form onSubmit={handleReset} className="space-y-6">
                    <p className="text-sm text-center text-gray-500">Enter your email and we'll send you a link to get back into your account.</p>
                    <InputField icon={<Mail className="w-5 h-5 text-gray-400"/>} type="email" placeholder="Email" required />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">Send Reset Link</button>
                </form>
            )}
            <p className="text-center text-sm text-gray-500 mt-6"><button type="button" onClick={onSwitchToLogin} className="font-semibold text-blue-600 hover:underline">Back to Sign In</button></p>
        </AuthFormContainer>
    );
};


// --- Dashboard Page ---
const DashboardPage = ({ token, onLogout }) => {
  const [stories, setStories] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [error, setError] = useState(null);
  
  const [avatarState, setAvatarState] = useState('idle');
  const [avatarMessage, setAvatarMessage] = useState(null);
  const [isAvatarActive, setIsAvatarActive] = useState(false);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const fetchStories = async () => {
        try {
            const data = await api.getStories(token);
            setStories(data);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('401')) onLogout(); // Token might be expired
        }
    };
    fetchStories();
  }, [token, onLogout]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onstart = () => setAvatarState('listening');
        recognition.onresult = (event) => handleCommand(event.results[0][0].transcript);
        recognition.onerror = (event) => { console.error('Speech error:', event.error); setAvatarState('idle'); };
        recognition.onend = () => { if (avatarState === 'listening') setAvatarState('idle'); };
        recognitionRef.current = recognition;
    }
  }, [avatarState, token]);

  const handleCommand = async (commandText) => {
      const lowerCaseCommand = commandText.toLowerCase();
      if (!isAvatarActive) {
          if (lowerCaseCommand.includes('riya')) {
              setIsAvatarActive(true);
              setAvatarState('thinking');
              const greeting = "Hi, how can I help you today?";
              setAvatarMessage(greeting);
              await speak(greeting, () => { if (recognitionRef.current) recognitionRef.current.start(); });
          } else {
              const activationPrompt = "Please say 'Hi Riya' to activate me.";
              setAvatarMessage(activationPrompt);
              await speak(activationPrompt);
          }
          return;
      }

      setAvatarMessage(null);
      setAvatarState('thinking');
      setIsGenerating(true);
      try {
        if (lowerCaseCommand.includes('summarize') || lowerCaseCommand.includes('summary')) {
            const summaryText = await api.summarizeTasks(commandText, stories, token);
            setAvatarMessage(summaryText);
            await speak(summaryText);
        } else if (lowerCaseCommand.includes('create') || lowerCaseCommand.includes('make a story')) {
            const storyData = await api.generateStory(commandText, token);
            setGeneratedStory(storyData);
            const responseText = `I've drafted a new story for you: "${storyData.title}". You can review it now.`;
            setAvatarMessage(responseText);
            await speak(responseText);
        } else {
            const responseText = "I can help with summarizing tasks or creating new stories. What would you like to do?";
            setAvatarMessage(responseText);
            await speak(responseText);
        }
      } catch (err) {
          setError(err.message);
          const errorText = "Sorry, I encountered an error. Please try again.";
          setAvatarMessage(errorText);
          await speak(errorText);
      } finally {
          setIsGenerating(false);
          setIsAvatarActive(false);
      }
  };
  
  const confirmAddStory = () => {
      const newStory = {
          id: `PROJ-${Math.floor(Math.random() * 1000)}`,
          title: generatedStory.title, status: 'To Do', priority: 'Medium', points: 5,
          description: generatedStory.description, acceptance_criteria: generatedStory.acceptance_criteria
      };
      setStories([newStory, ...stories]);
      setGeneratedStory(null);
  };

  const speak = async (text, onEndCallback = () => {}) => {
    if (!text) { setAvatarState('idle'); onEndCallback(); return; }
    setAvatarState('thinking');
    try {
        const { audio_data } = await api.textToSpeech(text, token);
        const pcmData = atob(audio_data).split('').map(c => c.charCodeAt(0));
        const pcm16 = new Int16Array(new Uint8Array(pcmData).buffer);
        const wavBlob = pcmToWav(pcm16, 24000);
        const audioUrl = URL.createObjectURL(wavBlob);
        
        if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            setAvatarState('speaking');
            audioRef.current.onended = () => { setAvatarState('idle'); onEndCallback(); };
        }
    } catch (err) {
        console.error("TTS failed:", err);
        setError("Sorry, I'm having trouble speaking right now.");
        setAvatarState('idle');
        onEndCallback();
    }
  };

  const pcmToWav = (pcmData, sampleRate) => {
    const dataSize = pcmData.length * 2, buffer = new ArrayBuffer(44 + dataSize), view = new DataView(buffer);
    view.setUint32(0, 0x52494646, false); view.setUint32(4, 36 + dataSize, true); view.setUint32(8, 0x57415645, false);
    view.setUint32(12, 0x666d7420, false); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true); view.setUint32(36, 0x64617461, false);
    view.setUint32(40, dataSize, true);
    for (let i = 0; i < pcmData.length; i++) { view.setInt16(44 + i * 2, pcmData[i], true); }
    return new Blob([view], { type: 'audio/wav' });
  };

  return (
    <div className="min-h-screen bg-blue-50 text-gray-800 font-sans">
      <Header onLogout={onLogout} />
      <main className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <StoryList stories={stories} />
            <AIInputSection onCommand={handleCommand} isGenerating={isGenerating} />
             {error && <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg">{error}</div>}
          </div>
          <aside className="space-y-8"> <ProductivityAnalytics stories={stories} /> </aside>
        </div>
      </main>
      <AIAvatar state={avatarState} recognitionRef={recognitionRef} message={avatarMessage} clearMessage={() => setAvatarMessage(null)} />
      <audio ref={audioRef} className="hidden" />
      {generatedStory && (<Modal title="Generated Story Details" onClose={() => setGeneratedStory(null)}>
        <div className="space-y-4 text-gray-600">
            <h4 className="font-bold text-xl text-gray-900">{generatedStory.title}</h4>
            <div><h5 className="font-semibold text-gray-500 mb-2">Description:</h5><div className="prose prose-sm max-w-none text-gray-700">{generatedStory.description}</div></div>
            <div><h5 className="font-semibold text-gray-500 mb-2">Acceptance Criteria:</h5><ul className="list-disc list-inside space-y-1 text-gray-700">{generatedStory.acceptance_criteria.map((ac, i) => <li key={i}>{ac}</li>)}</ul></div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setGeneratedStory(null)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold text-gray-800">Cancel</button>
            <button onClick={confirmAddStory} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-white flex items-center gap-2"><Plus className="w-5 h-5"/> Add to Stories</button>
        </div>
      </Modal>)}
    </div>
  );
}

// --- Other Components (mostly unchanged) ---
const LogoIcon = () => (<div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md"><ShoppingBag className="w-6 h-6 text-white" /></div>);
const statusColors = {'To Do': 'bg-gray-400','In Progress': 'bg-blue-500','Done': 'bg-green-500','Blocked': 'bg-red-500','Critical': 'text-red-500','High': 'text-yellow-500','Medium': 'text-blue-500','Low': 'text-green-500',};
const LoadingSpinner = () => (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>);
const Modal = ({ title, children, onClose }) => (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"><div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200"><div className="flex justify-between items-center p-4 border-b border-gray-200"><h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900"><Sparkles className="w-5 h-5 text-indigo-500" /> {title}</h3><button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800"><X className="w-5 h-5" /></button></div><div className="p-6">{children}</div></div></div>);
const Header = ({ onLogout }) => (<header className="flex justify-between items-center p-4 border-b border-gray-200 bg-white shadow-sm"><div className="flex items-center space-x-3"><LogoIcon /><h1 className="text-2xl font-bold tracking-tighter text-gray-900">ONE STOP SHOP</h1></div><div className="flex items-center space-x-4"><button onClick={onLogout} className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50"><LogIn className="w-5 h-5 transform rotate-180" /><span className="text-sm font-semibold">Logout</span></button><div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-blue-600 border border-gray-300">A</div></div></header>);
const getStatusIcon = (status) => { switch (status) { case 'Done': return <CheckCircle className="w-5 h-5 text-green-500" />; case 'In Progress': return <Clock className="w-5 h-5 text-blue-500" />; case 'Blocked': return <XCircle className="w-5 h-5 text-red-500" />; default: return <div className="w-4 h-4 mt-0.5 border-2 border-gray-400 rounded-full"></div>; }};
const StoryList = ({ stories }) => (<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h2 className="text-xl font-semibold text-gray-900 mb-4">Your Assigned Stories</h2><div className="space-y-4">{stories.map(story => (<div key={story.id} className="bg-white p-4 rounded-lg flex items-center justify-between border border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-300 transform hover:-translate-y-1"><div className="flex items-center space-x-4">{getStatusIcon(story.status)}<div><p className="font-semibold text-gray-800">{story.title}</p><p className="text-sm text-gray-500">{story.id}</p></div></div><div className="flex items-center space-x-4"><span className={`text-sm font-medium ${statusColors[story.priority]}`}>{story.priority}</span><div className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full font-bold text-sm border border-gray-200">{story.points}</div></div></div>))}</div></div>);
const AIInputSection = ({ onCommand, isGenerating }) => { const [text, setText] = useState(''); const handleSend = () => { if (!text.trim()) return; onCommand(text); setText(''); }; return (<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><label htmlFor="ai-input" className="text-lg font-semibold mb-2 block text-gray-900">Text Assistant</label><p className="text-sm text-gray-500 mb-4">You can also type your command here. Start with "Hi Riya".</p><div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2 border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500"><input id="ai-input" type="text" value={text} onChange={(e) => setText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="e.g., Hi Riya, create a story for a new login page..." className="w-full bg-transparent p-2 focus:outline-none text-gray-800" disabled={isGenerating} /><button onClick={handleSend} disabled={isGenerating || !text.trim()} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100">{isGenerating ? <LoadingSpinner/> : 'Send'}</button></div></div>);};
const ProductivityAnalytics = ({ stories }) => { const statusCounts = stories.reduce((acc, story) => { acc[story.status] = (acc[story.status] || 0) + 1; return acc; }, {}); return (<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"><h2 className="text-xl font-semibold mb-4 text-gray-900">Productivity Analytics</h2><div className="space-y-6"><div><h3 className="font-semibold mb-2 flex items-center space-x-2 text-gray-800"><PieChart className="w-5 h-5 text-indigo-500"/><span>Ticket Status Overview</span></h3><div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200"><div className="flex flex-col space-y-2">{Object.entries(statusCounts).map(([status, count]) => (<div key={status} className="flex items-center text-sm w-full justify-between text-gray-700"><div className="flex items-center"><span className={`w-3 h-3 rounded-full mr-2 ${statusColors[status]}`}></span><span>{status}</span></div><span className="font-bold text-gray-900">{count}</span></div>))}</div></div></div><div><h3 className="font-semibold mb-2 flex items-center space-x-2 text-gray-800"><BarChart2 className="w-5 h-5 text-green-500"/><span>Story Points Completion</span></h3><div className="w-full h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200"><p>Bar Chart Coming Soon</p></div></div></div></div>);};
const AIAvatar = ({ state, recognitionRef, message, clearMessage }) => { const handleAvatarClick = () => { if (state === 'idle' && recognitionRef.current) { recognitionRef.current.start(); } else if (state === 'listening') { recognitionRef.current.stop(); } }; return (<div className="fixed bottom-8 right-8 z-50">{message && <AvatarMessagePopup message={message} onClose={clearMessage} />}<button onClick={handleAvatarClick} className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110"><AvatarFace state={state} />{state === 'listening' && <div className="absolute inset-0 rounded-full bg-blue-400/50 animate-pulse"></div>}</button></div>);};
const AvatarFace = ({ state }) => { const mouth = {idle: <path d="M 12 15 Q 16 16 20 15" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />,speaking: <path d="M 12 15 Q 16 19 20 15" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" className="animate-mouth" />,thinking: <path d="M 12 16 H 20" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />,listening: <path d="M 12 15 Q 16 16 20 15" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />,}[state]; return (<svg viewBox="0 0 32 32" className="w-12 h-12"><circle cx="11" cy="11" r="1.5" fill="white" className={state === 'speaking' ? 'animate-eyes' : ''} /><circle cx="21" cy="11" r="1.5" fill="white" className={state === 'speaking' ? 'animate-eyes' : ''} />{mouth}<style>{`@keyframes mouth-anim { 0%, 100% { d: path("M 12 15 Q 16 16 20 15"); } 50% { d: path("M 12 15 Q 16 19 20 15"); } } .animate-mouth { animation: mouth-anim 0.4s infinite; } @keyframes eye-anim { 50% { transform: translateY(-1px); } } .animate-eyes { animation: eye-anim 0.4s infinite; }`}</style></svg>);};
const AvatarMessagePopup = ({ message, onClose }) => (<div className="absolute bottom-24 right-0 w-72 bg-white rounded-xl shadow-2xl p-4 border border-gray-200 animate-fade-in-up"><button onClick={onClose} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button><p className="text-sm text-gray-700">{message}</p></div>);

