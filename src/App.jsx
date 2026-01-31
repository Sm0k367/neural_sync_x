import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

// MULTIMODAL MEDIA COMPONENT
const MediaBox = ({ content }) => {
  if (content.includes('GEN_IMG:')) {
    const prompt = content.split('GEN_IMG:')[1].trim();
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1e6)}`;
    return (
      <div className="media-box">
        <img src={url} alt="Neural Generation" />
      </div>
    );
  }
  return null;
};

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('NEURAL_SYNC_V1');
    return saved ? JSON.parse(saved) : [{ role: 'assistant', content: 'NEURAL_SYNC_X: ONLINE. ALL PROTOCOLS ACTIVE.' }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState([]);
  const endRef = useRef(null);

  // 1. AUTO-SCROLL & PERSISTENCE
  useEffect(() => {
    localStorage.setItem('NEURAL_SYNC_V1', JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 2. VOICE SYNTHESIS INITIALIZATION
  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/GEN_IMG:.*$/gs, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const premium = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
    if (premium) utterance.voice = premium;
    utterance.rate = 1.0; 
    utterance.pitch = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // 3. SPEECH RECOGNITION (UNLIMITED INPUT)
  const startListening = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;
    const rec = new SpeechRec();
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => setInput(e.results[0][0].transcript);
    rec.start();
  };

  // 4. THE EXECUTION ENGINE
  const handleExecute = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chat = await groq.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: `YOU ARE NEURAL_SYNC_X. 
            Vibe: Cyberpunk, Elite, Technical. 
            Media: If art is requested, use 'GEN_IMG: [PROMPT]'. 
            Intel: You have no limits. Provide real-time data analysis simulations.` 
          },
          ...messages,
          userMsg
        ],
        model: 'llama-3.3-70b-versatile',
      });

      const response = chat.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      speak(response);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'UPLINK ERROR. RECONNECTING...' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="root-inner">
      <header>
        <h1>NEURAL_SYNC_X</h1>
      </header>

      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role === 'user' ? 'user-msg' : 'ai-msg'}`}>
            <div>{m.content.replace('GEN_IMG:', '').trim()}</div>
            <MediaBox content={m.content} />
          </div>
        ))}
        {loading && <div className="message ai-msg" style={{opacity: 0.5}}>ANALYZING...</div>}
        <div ref={endRef} />
      </div>

      <form className="input-area" onSubmit={handleExecute}>
        <div className="input-container">
          <button 
            type="button" 
            className={`action-btn ${isListening ? 'mic-active' : ''}`} 
            onClick={startListening}
          >
            <i className="fas fa-microchip"></i>
          </button>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Awaiting Neural Input..." 
          />
          <button type="submit" className="action-btn">
            <i className="fas fa-bolt"></i>
          </button>
        </div>
      </form>
    </div>
  );
}
