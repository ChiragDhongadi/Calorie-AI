import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Github, Chrome, Facebook, Quote, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { supabase } from '../supabaseClient';

const testimonials = [
  {
    text: "Calyx AI transformed my approach to fitness. The personalized plans are data-driven and actually work.",
    author: "Alex Rivers",
    role: "Professional Athlete",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80"
  },
  {
    text: "The precision of the calorie tracking and the AI coach's insights are unmatched in the market today.",
    author: "Sarah Chen",
    role: "Fitness Enthusiast",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=150&q=80"
  }
];

const Login = ({ onLoginSuccess, onLogoClick }) => {


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          // Detect rate limit error
          if (signUpError.message?.toLowerCase().includes('rate limit')) {
            throw new Error('Neural sync frequency exceeded. TIP: Please disable "Confirm email" in your Supabase Auth settings for smoother development.');
          }
          throw signUpError;
        }
        if (data.user) {
          // If confirm exists, show message, otherwise success
          if (data.session) {
             onLoginSuccess({
               id: data.user.id,
               email: data.user.email,
               name: data.user.email.split('@')[0],
             });
          } else {
             setError('Verification email sent! Please check your inbox or disable email confirmation in Supabase dashboard for instant access.');
          }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.user) {
          onLoginSuccess({
            id: data.user.id,
            email: data.user.email,
            name: data.user.email.split('@')[0],
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };



  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-[#0B0F19] flex items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent-purple/20 rounded-full blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-accent-green/10 rounded-full blur-[180px] animate-pulse-glow" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-6xl h-[750px] glass rounded-[48px] overflow-hidden flex flex-col md:flex-row shadow-[0_40px_100px_rgba(0,0,0,0.7)] border-white/5"
      >
        {/* Left Side - Login Form */}
        <div className="flex-1 p-12 lg:p-16 flex flex-col justify-between">
          <div>
            <div 
              className="flex items-center gap-3 mb-12 cursor-pointer group hover:opacity-80 transition-all"
              onClick={onLogoClick}
            >
              <div className="w-10 h-10 bg-neon-gradient rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(163,255,18,0.3)] group-hover:scale-110 transition-transform">
                <Flame className="text-black fill-black" size={24} />
              </div>
              <span className="text-xl font-black tracking-tight text-white italic">
                 CALORIE <span className="text-accent-green">AI</span>
              </span>
            </div>

            <div className="space-y-2 mb-10">
              <h1 className="text-4xl font-black text-white leading-tight">
                {isSignUp ? 'Create Account' : 'Welcome back'}
              </h1>
              <p className="text-white/40 font-medium">
                {isSignUp ? 'Start your neural fitness journey today.' : 'Elevate your performance. Access your neural profile.'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Neural Identifier (Email)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/20 group-focus-within:text-accent-green transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-white/10 focus:outline-none focus:border-accent-green/50 focus:bg-black/60 transition-all font-medium"
                    placeholder="name@nexus.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Security Matrix (Password)</label>
                   <button type="button" className="text-[10px] font-black uppercase tracking-widest text-accent-purple hover:text-white transition-colors mr-4">Reset Key?</button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-white/20 group-focus-within:text-accent-purple transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-white/10 focus:outline-none focus:border-accent-purple/50 focus:bg-black/60 transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl font-bold animate-shake">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 py-2">
                 <input type="checkbox" id="remember" className="w-4 h-4 rounded bg-white/5 border-white/10 accent-accent-green" />
                 <label htmlFor="remember" className="text-xs text-white/40 font-bold uppercase tracking-tight">Stay synchronized</label>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-neon-gradient py-5 rounded-2xl text-[#0B0F19] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 group overflow-hidden relative shadow-[0_20px_40px_rgba(163,255,18,0.2)] hover:shadow-[0_25px_50px_rgba(163,255,18,0.4)] transition-all duration-500 active:scale-95"
              >
                <span className="relative z-10">{isLoading ? 'Authenticating...' : isSignUp ? 'Initialize Profile' : 'Access Portal'}</span>
                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-center mt-6">
                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-accent-green transition-colors"
                >
                  {isSignUp ? 'Already have a profile? Access here' : 'New candidate? Create account'}
                </button>
              </div>
            </form>
          </div>

          <div className="pt-8 border-t border-white/5">
             <div className="flex items-center justify-center gap-6">
                <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all bg-white/5">
                  <Chrome size={20} />
                </button>
                <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all bg-white/5">
                  <Github size={20} />
                </button>
                <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all bg-white/5">
                  <Facebook size={20} />
                </button>
             </div>
          </div>
        </div>

        {/* Right Side - Testimonial/Hero */}
        <div className="hidden md:flex flex-1 bg-black/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-transparent z-10" />
          
          {/* Main Visual Content */}
          <div className="relative z-20 w-full h-full flex flex-col p-12 lg:p-16 justify-between">
            <div className="space-y-6">
               <div className="flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-accent-green" />
                  <span className="text-[10px] font-black text-accent-green uppercase tracking-[0.3em]">Neural Insights</span>
               </div>
               <h2 className="text-5xl font-black text-white leading-none uppercase tracking-tighter italic">
                 What our <br />Athletes Said<span className="text-accent-purple">.</span>
               </h2>
            </div>

            <div className="max-w-md">
              <div className="mb-8">
                <Quote size={40} className="text-accent-green opacity-40 mb-4" />
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={activeTestimonial}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-xl font-bold text-white leading-relaxed italic"
                  >
                    "{testimonials[activeTestimonial].text}"
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonials[activeTestimonial].image} 
                    alt={testimonials[activeTestimonial].author}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/10"
                  />
                  <div>
                    <h4 className="font-black text-white leading-none">{testimonials[activeTestimonial].author}</h4>
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/40 mt-1">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                   <button onClick={prevTestimonial} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                      <ChevronLeft size={20} />
                   </button>
                   <button onClick={nextTestimonial} className="w-10 h-10 rounded-xl bg-accent-green/20 border border-accent-green/20 flex items-center justify-center text-accent-green hover:bg-accent-green hover:text-[#0B0F19] transition-all shadow-[0_0_20px_rgba(163,255,18,0.2)]">
                      <ChevronRight size={20} />
                   </button>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Feature Card */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-[-20px] right-[-20px] w-64 p-8 bg-white rounded-[40px] z-30 shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col items-start gap-4"
          >
             <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-accent-green">
                <ArrowRight size={24} className="-rotate-45" />
             </div>
             <div>
                <h3 className="text-black font-black text-lg leading-tight">Elevate your right metrics.</h3>
                <p className="text-black/40 text-[10px] font-bold uppercase tracking-tight mt-1 leading-relaxed">
                   Be among the first founders to experience the easiest way to track.
                </p>
             </div>
             <div className="flex -space-x-2 mt-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-lg">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-black border-2 border-white flex items-center justify-center text-[10px] text-white font-black">
                   +12
                </div>
             </div>
          </motion.div>

          {/* Abstract Star shape like in reference */}
          <div className="absolute right-[-10%] top-[40%] text-accent-purple/10 pointer-events-none">
             <svg width="400" height="400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin-slow">
                <path d="M100 0L108 80L188 88L108 96L100 176L92 96L12 88L92 80L100 0Z" fill="currentColor" />
             </svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
