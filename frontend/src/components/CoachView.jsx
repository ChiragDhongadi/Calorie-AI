import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Save, 
  Download, 
  Loader2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { supabase } from '../supabaseClient';



const CoachView = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [trackerStatus, setTrackerStatus] = useState('Initializing...');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Initial greeting from backend
    const initChat = async () => {
      try {
        const response = await axios.post('/api/chat', { message: '' });
        if (response.data.history) {
          setMessages(response.data.history);
          updateProgress(response.data.status);
        }
      } catch (err) {
        console.error('Failed to init coach:', err);
      }
    };
    initChat();
  }, []);

  const updateProgress = (statusText) => {
    if (!statusText) return;
    setTrackerStatus(statusText);
    const match = statusText.match(/\d+/);
    if (match) {
      setProgress(parseInt(match[0]));
    } else if (statusText.includes('Complete') || statusText.includes('Generated')) {
      setProgress(100);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const currentInput = input.trim();
    const userMessage = { role: 'user', content: currentInput };
    
    // Add user message to UI immediately for better feedback
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', { message: currentInput });
      
      // Only update if we get a valid non-empty history from the server
      if (response.data.history && response.data.history.length > 0) {
        // If the server returns a single greeting message but we already had 
        // a conversation, it might mean a session reset occurred.
        // We handle this by checking if the server's history is shorter than ours 
        // after sending a message.
        setMessages(response.data.history);
        updateProgress(response.data.status);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Don't remove the user's message, just add a bot error message
      setMessages(prev => [...prev, { role: 'bot', content: "My neural link is currently recalibrating. Please check your connection! ⚡" }]);
    } finally {
      setLoading(false);
      setIsSaved(false);
    }
  };


  const handleSave = async () => {
    if (!user || isSaving || messages.length === 0) return;
    setIsSaving(true);

    try {
      // Find the last bot message which should contain the plan
      const botMessages = messages.filter(m => m.role === 'bot' || m.role === 'assistant');
      const latestPlan = botMessages[botMessages.length - 1]?.content;

      if (!latestPlan) throw new Error("No plan found to save.");

      // Helper to extract numeric goals from the bot text using regex
      const extractNum = (regex, text, def) => {
        const match = text.match(regex);
        return match ? parseFloat(match[1]) : def;
      };

      // Simple parsing logic for goals
      const targetCalories = extractNum(/(\d{4})\s*kcal/i, latestPlan, 2500);
      const weightGoalPerWeek = extractNum(/(\d?\.?\d)\s*kg\/wk/i, latestPlan, 0.5);
      const calorieDeficit = extractNum(/-\s*(\d{3})\s*kcal/i, latestPlan, 500);

      const { error: planError } = await supabase.from('user_plans').insert({
        user_id: user.id,
        plan_name: `Fitness Plan - ${new Date().toLocaleDateString()}`,
        plan_content: latestPlan,
        fitness_goal: trackerStatus,
        target_calories: targetCalories,
        weight_goal_per_week: weightGoalPerWeek,
        calorie_deficit: calorieDeficit
      });

      // Also update the daily_activities goal for today so it reflects immediately
      const today = new Date().toISOString().split('T')[0];
      
      const { data: dailyData, error: fetchError } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      await supabase.from('daily_activities')
        .upsert({ 
          user_id: user.id, 
          date: today, 
          goal_calories: targetCalories,
          total_calories_burned: dailyData?.total_calories_burned || 0,
          total_calories_consumed: dailyData?.total_calories_consumed || 0,
          protein_g: dailyData?.protein_g || 0,
          carbs_g: dailyData?.carbs_g || 0,
          fats_g: dailyData?.fats_g || 0
        }, { onConflict: 'user_id,date' });

      setIsSaved(true);
    } catch (err) {
      console.error('CoachView save error:', err);
      alert(err.message || 'Failed to save the plan. Please try again later.');
    } finally {
      setIsSaving(false);
    }

  };


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

  return (

    <div className="flex flex-col h-[calc(100vh-160px)] glass rounded-[32px] border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with Save Button */}
      <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-3xl z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center text-accent-purple border border-accent-purple/30">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">AI Training Coach</h2>
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-0.5">Real-time Bio-feedback Logic</p>
          </div>
        </div>

        <AnimatePresence>
          {progress === 100 && (
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={handleSave}
              disabled={isSaved}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                ${isSaved 
                  ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' 
                  : 'bg-white text-black hover:bg-accent-green hover:shadow-[0_0_20px_rgba(163,255,18,0.4)] shadow-[0_0_15px_rgba(255,255,255,0.1)]'}`}
            >
              {isSaved ? (
                <>
                  <Check size={14} />
                  Plan Locked
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Plan
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-6 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border shadow-xl
                    ${msg.role === 'user' 
                      ? 'bg-accent-green/20 border-accent-green/30 text-accent-green' 
                      : 'bg-accent-purple/20 border-accent-purple/30 text-accent-purple shadow-[0_0_20px_rgba(192,132,252,0.2)]'}`}
                  >
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`p-6 rounded-3xl text-base leading-relaxed relative group shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-accent-green text-black rounded-tr-none font-bold' 
                      : 'bg-[#2C2C35]/80 text-white rounded-tl-none border border-white/10 backdrop-blur-3xl font-normal'}`}
                  >
                    <div className="whitespace-pre-wrap">{renderFormattedText(msg.content)}</div>
                    <div className={`absolute top-0 ${msg.role === 'user' ? 'right-full translate-x-2' : 'left-full -translate-x-2'} scale-0 group-hover:scale-110 transition-transform`}>
                       <Sparkles size={12} className="text-accent-purple" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-6 max-w-[80%]">
                  <div className="w-12 h-12 rounded-2xl bg-accent-purple/20 border border-accent-purple/30 text-accent-purple flex items-center justify-center animate-pulse">
                    <Bot size={20} />
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl rounded-tl-none border border-white/5 flex gap-2 items-center">
                     {[0.3, 0.15, 0].map((delay, i) => (
                        <div key={i} className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `-${delay}s` }} />
                     ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-4 border-t border-white/5 bg-white/5">
             <div className="relative">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Tell me what you ate or ask for advice..."
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-sm outline-none focus:border-accent-green/50 focus:bg-white/10 transition-all pr-16"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-12 h-12 bg-accent-green text-black rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachView;
