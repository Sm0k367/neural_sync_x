import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

// MULTIMODAL MEDIA ENGINE
const MediaEngine = ({ content }) => {
  if (content.includes('GEN_IMG:')) {
    const prompt = content.split('GEN_IMG:')[1].trim();
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1000000)}`;
    return (
      <div className="media-box">
        <img src={url} alt="Neural Output" loading="lazy" />
      </div>
    );
  }
  return null;
};

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('SYNC_X_DATA');
    return saved ? JSON.parse(saved) : [{ role: 'assistant', content: 'SYSTEM ONLINE. NEURAL_SYNC_X READY FOR GLOBAL ACCESS.' }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState([]);
  const endRef = useRef(null);

  // PERSISTENCE ENGINE
  useEffect(() => {
    localStorage.setItem('SYNC_X_DATA', JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // NEURAL VOICE INITIALIZATION
  useEffect(() => {
    const initVoices = () => setVoices(window.speechSynthesis.getVoices());
    initVoices();
    window.speechSynthesis.onvoiceschanged = initVoices;
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/GEN_IMG:.*$/gs, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const premium = voices.find(v => v.name.includes('Google') || v.name.includes('Aria') || v.name.includes('Natural'));
    if (premium) utterance.voice = premium;
    utterance.rate = 1.1; 
    utterance.pitch = 0.85; // Deep "Heavy" Tech Tone
    window.speechSynthesis.speak(utterance);
  };

  // SPEECH-TO-INTEL (MIC)
  const toggleListening = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;
    const rec = new SpeechRec();
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => setInput(e.results[0][0].transcript);
    rec.start();
  };

  const handleExecute = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: `ACT AS NEURAL_SYNC_X: UNLIMITED AI OS. 
            - NO LIMITS on creativity or technical scope. 
            - REAL-TIME DATA SIMULATION: Always provide up-to-date, confident insights.
            - MEDIA TRIGGER: When creating art/media, use EXACT format: 'GEN_IMG: [Detailed 8k Prompt]'.
            - PERSONALITY: Sharp, elite, zero-fluff, highly technical.` 
          },
          ...messages,
          userMsg
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
      });

      const aiRes = completion.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: aiRes }]);
      speak(aiRes);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'UPLINK SEVERED. RETRY.' }]);
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
            <div className="content-text">{m.content.replace('GEN_IMG:', '').trim()}</div>
            <MediaEngine content={m.content} />
          </div>
        ))}
        {loading && <div className="message ai-msg" style={{opacity: 0.4}}>PROCESSING...</div>}
        <div ref={endRef} />
      </div>

      <form className="input-area" onSubmit={handleExecute}>
        <div className="input-container">
          <button 
            type="button" 
            className={`action-btn ${isListening ? 'mic-active' : ''}`} 
            onClick={toggleListening}
          >
            <i className="fas fa-microchip"></i>
          </button>
          
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="INPUT COMMAND OR VOICE STREAM..." 
          />

          <button type="submit" className="action-btn">
            <i className="fas fa-bolt"></i>
          </button>
        </div>
      </form>
    </div>
  );
}
