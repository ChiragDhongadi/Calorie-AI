import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Sparkles, MessageSquare, X, Minus } from 'lucide-react';
import axios from 'axios';

const Chatbot = ({ setIsChatOpen }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const scrollRef = useRef(null);

  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);
    return parts.map((part, index) => {
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        return <strong key={index} className="font-bold text-accent-green">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  useEffect(() => {
    // Sync with backend on first open
    const initBubble = async () => {
      try {
        const response = await axios.post('/api/helper-chat', { message: '' });
        if (response.data.history) {
          setMessages(response.data.history);
          setStatus(response.data.status);
        }
      } catch (err) {
        console.error('Failed to init bubble:', err);
      }
    };
    initBubble();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/helper-chat', { message: input });
      if (response.data.history) {
        setMessages(response.data.history);
        setStatus(response.data.status);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'bot', content: "My neural link is currently recalibrating. ⚡" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111827]/80 backdrop-blur-3xl overflow-hidden rounded-[32px]">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center text-accent-purple border border-accent-purple/30 shadow-[0_0_20px_rgba(192,132,252,0.2)] animate-pulse">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">AI assistant</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
               <div className={`w-1.5 h-1.5 rounded-full ${status?.includes('Complete') ? 'bg-accent-green shadow-[0_0_8px_rgba(163,255,18,1)]' : 'bg-accent-purple animate-pulse shadow-[0_0_8px_rgba(192,132,252,1)]'}`} />
               <span className="text-[10px] font-bold text-white/40 uppercase tracking-tight">
                 Active
               </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all">
              <Minus size={20} />
           </button>
        </div>
      </div>

      {/* Chat Body */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-transparent to-black/20"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[95%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center border shadow-lg
                 ${msg.role === 'user' 
                   ? 'bg-accent-green/20 border-accent-green/30 text-accent-green' 
                   : 'bg-accent-purple/20 border-accent-purple/30 text-accent-purple'}`}
               >
                 {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
               </div>
               <div className={`p-4 rounded-2xl text-sm leading-relaxed transition-all duration-300 relative group
                 ${msg.role === 'user' 
                   ? 'bg-accent-green text-black rounded-tr-none font-medium' 
                   : 'bg-[#2C2C35]/90 text-white rounded-tl-none border border-white/5 backdrop-blur-md font-normal shadow-lg'}`}
               >
                 <div className="whitespace-pre-wrap">{renderFormattedText(msg.content)}</div>
                 <div className={`absolute top-0 ${msg.role === 'user' ? 'right-full translate-x-1.5' : 'left-full -translate-x-1.5'} scale-0 group-hover:scale-100 transition-transform`}>
                    <Sparkles size={10} className="text-accent-purple" />
                 </div>
               </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-4 max-w-[85%]">
               <div className="w-9 h-9 rounded-full bg-accent-purple/20 border border-accent-purple/30 text-accent-purple flex items-center justify-center animate-pulse">
                 <Bot size={16} />
               </div>
               <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Input */}
      <div className="p-6 border-t border-white/5 bg-white/5">
        <div className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your assistant anything..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-accent-green/60 focus:bg-white/10 transition-all placeholder:text-white/20 pr-14"
          />
          <button 
             onClick={handleSend}
             disabled={loading}
             className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent-green text-black rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <Send size={18} />
          </button>
        </div>
        

      </div>
    </div>
  );
};

export default Chatbot;
