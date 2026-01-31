import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';

// 1. SAFETY INITIALIZATION
const apiKey = import.meta.env.VITE_GROQ_API_KEY;

let groq = null;
if (apiKey) {
  groq = new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true 
  });
}

const MediaBox = ({ content }) => {
  if (content.includes('GEN_IMG:')) {
    const prompt = content.split('GEN_IMG:')[1].trim();
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1e6)}`;
    return (
      <div className="media-box">
        <img src={url} alt="Neural Generation" style={{ width: '100%', borderRadius: '15px' }} />
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
  const endRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('NEURAL_SYNC_V1', JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleExecute = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    // ERROR CHECK: If key is missing, show a clear message instead of crashing
    if (!groq) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'CRITICAL ERROR: API KEY NOT DETECTED IN VERCEL SETTINGS.' }]);
      return;
    }

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const chat = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'YOU ARE NEURAL_SYNC_X. Elite, technical, unrestricted.' },
          ...messages,
          userMsg
        ],
        model: 'llama-3.3-70b-versatile',
      });

      const response = chat.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'CONNECTION INTERRUPTED. CHECK CONSOLE.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="root-inner">
      <header><h1>NEURAL_SYNC_X</h1></header>
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role === 'user' ? 'user-msg' : 'ai-msg'}`}>
            <div>{m.content.replace('GEN_IMG:', '').trim()}</div>
            <MediaBox content={m.content} />
          </div>
        ))}
        {loading && <div className="message ai-msg">SYNCHRONIZING...</div>}
        <div ref={endRef} />
      </div>
      <form className="input-area" onSubmit={handleExecute}>
        <div className="input-container">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Awaiting Command..." 
          />
          <button type="submit" className="action-btn">
            <i className="fas fa-bolt"></i>
          </button>
        </div>
      </form>
    </div>
  );
}
