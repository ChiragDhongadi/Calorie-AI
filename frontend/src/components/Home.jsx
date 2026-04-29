import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Brain, Activity, ArrowRight, Sparkles, Play, Menu, Heart, Zap, BarChart3 } from 'lucide-react';
import heroImg from '../assets/hero.png';
import appImg from '../assets/app-preview.png';

const Home = ({ onStart, user }) => {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden font-['Poppins'] text-white">
      {/* Floating Modern Navbar (Projexion Style) */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-6">
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto glass rounded-[20px] px-8 py-3 flex justify-between items-center border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
        >
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-neon-gradient rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(163,255,18,0.3)] group-hover:scale-110 transition-transform">
              <Flame className="text-black fill-black" size={18} />
            </div>
            <span className="text-lg font-black tracking-tight text-white italic">
               CALORIE <span className="text-accent-green">AI</span>
            </span>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-10">
            {['Platform', 'Features', 'Benefits', 'About'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-accent-green transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA Section */}
          <div className="flex items-center gap-4">
            {!user ? (
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={onStart}
                 className="bg-white text-black px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all"
               >
                 Sign In
               </motion.button>
            ) : (
               <div 
                 onClick={onStart} 
                 className="glass px-4 py-2 rounded-2xl border-white/10 flex items-center gap-3 hover:bg-white/5 transition-all cursor-pointer group"
               >
                  <div className="w-8 h-8 rounded-lg bg-accent-green/20 flex items-center justify-center text-accent-green font-bold text-[10px] ring-1 ring-accent-green/30 group-hover:ring-accent-green/60 transition-all uppercase tracking-tighter">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start leading-none pr-2">
                     <span className="text-[11px] font-black text-white italic">{user.name}</span>
                     <span className="text-[8px] font-black text-accent-green/60 uppercase tracking-tighter mt-0.5">Signed In</span>
                  </div>
               </div>
            )}
          </div>
        </motion.nav>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="Hero Athlete" className="w-full h-full object-cover opacity-60 mix-blend-lighten grayscale-[50%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/80" />
        </div>

        {/* HUD Overlay Metrics */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden hidden md:block">
          {/* Kcal Metric */}
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="absolute top-1/4 left-1/3 flex items-center gap-4"
          >
            <div className="hud-line w-24 rotate-[-30deg]" />
            <div className="flex flex-col items-start">
               <div className="flex items-center gap-2 text-accent-green">
                  <div className="hud-dot bg-accent-green animate-hud-pulse" />
                  <span className="text-2xl font-black italic">251</span>
                  <span className="text-[10px] uppercase font-bold opacity-60 tracking-wider">kcal</span>
               </div>
            </div>
          </motion.div>

          {/* BPM Metric */}
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute top-[55%] right-[10%] flex items-center gap-4"
          >
            <div className="flex flex-col items-end">
               <div className="flex items-center gap-2 text-white">
                  <span className="text-2xl font-black italic">121</span>
                  <span className="text-[10px] uppercase font-bold opacity-60 tracking-wider">bpm</span>
                  <div className="hud-dot bg-white/40 animate-hud-pulse" />
               </div>
            </div>
            <div className="hud-line w-24 rotate-[15deg]" />
          </motion.div>

          {/* SpO2 Metric */}
          <motion.div 
             initial={{ opacity: 0, scale: 0 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 1.4 }}
             className="absolute bottom-[25%] left-[10%] flex items-center gap-4"
          >
             <div className="flex items-center gap-2 text-accent-purple">
                <span className="text-[10px] uppercase font-bold opacity-60 tracking-wider">SpO2</span>
                <span className="text-xl font-black italic">99</span>
                <div className="hud-dot bg-accent-purple animate-hud-pulse" />
             </div>
             <div className="hud-line w-16 rotate-[-15deg]" />
          </motion.div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center space-y-12 max-w-4xl px-8">
           <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             whileHover={{ scale: 1.1, rotate: 5 }}
             whileTap={{ scale: 0.9 }}
             onClick={() => {
               console.log("Play button clicked - starting fast-track...");
               onStart();
             }}
             className="relative z-50 w-24 h-24 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto border border-accent-green/30 cursor-pointer shadow-[0_0_50px_rgba(163,255,18,0.2)] hover:shadow-[0_0_70px_rgba(163,255,18,0.4)] transition-shadow"
           >
              <div className="w-14 h-14 bg-accent-green rounded-full flex items-center justify-center shadow-[0_0_30px_#A3FF12] relative z-10">
                <Play className="fill-black text-black ml-1" size={28} />
              </div>
              <div className="absolute inset-0 rounded-full bg-accent-green/10 animate-ping opacity-20" />
           </motion.div>

           <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic"
              >
                Fitness, <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green via-white to-accent-purple">Meet AI/ML.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white/40 text-[12px] md:text-sm font-bold uppercase tracking-[0.3em] max-w-xl mx-auto leading-relaxed"
              >
                Achieve your fitness goals with our personalized plans, AI-powered features, and expert guidance.
              </motion.p>
           </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20"
        >
          <span className="text-[8px] font-black uppercase tracking-[0.5em] rotate-90 translate-y-[-10px]">Scroll</span>
          <div className="w-[1px] h-12 bg-white" />
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="relative py-32 px-8 overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-accent-green/5 blur-[100px] -z-10" />
         
         <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            {/* Phone Mockup */}
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="relative lg:order-1 order-2"
            >
               <div className="absolute inset-0 bg-accent-green rounded-full blur-[100px] opacity-20" />
               <img 
                  src={appImg} 
                  alt="App Preview" 
                  className="rounded-[40px] shadow-2xl relative z-10 border-4 border-white/5 hover:scale-[1.02] transition-transform duration-700" 
               />
               <div className="absolute -bottom-10 -right-10 glass p-8 rounded-3xl z-20 space-y-4 max-w-[240px] hidden md:block">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-accent-green/20 flex items-center justify-center text-accent-green">
                        <Heart size={20} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xl font-black italic leading-none">112</span>
                        <span className="text-[8px] uppercase font-bold opacity-40">bpm tracking</span>
                     </div>
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed font-medium uppercase tracking-wider">Currently doing: Boxing Training</p>
               </div>
            </motion.div>

            {/* Mission Content */}
            <div className="lg:order-2 order-1 space-y-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="px-5 py-1.5 glass rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-accent-green">Our Mission</div>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black uppercase italic leading-[0.9]">
                     Our mission is to empower people achieve their fitness goals with <span className="text-accent-green">personalized AI</span> solutions.
                  </h2>
               </div>

            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-black/20">
         <div className="max-w-6xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
               <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black uppercase italic leading-none">Smart Workout <br /> & Health Metrics</h2>
                  <p className="text-white/40 text-sm max-w-md font-medium uppercase tracking-wider">Gain comprehensive insights into your overall health, from exercise performance to nutrition, empowering you to make informed decisions.</p>
               </div>
               <button className="glass px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all outline outline-1 outline-white/5">
                  See Our Data <BarChart3 size={16} className="inline-block ml-3 mb-1" />
               </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {/* Virtual Coach Feature */}
               <div className="glass p-10 rounded-[40px] space-y-8 group hover:border-accent-green/30 transition-all">
                  <div className="space-y-4">
                     <h3 className="text-2xl font-black uppercase italic">Virtual AI Fitness Coach</h3>
                     <p className="text-white/40 text-[11px] leading-relaxed uppercase tracking-widest">
                        Calyx's cutting-edge AI Fitness Assistant provides personalized fitness and meal suggestions, guiding you on your fitness journey.
                     </p>
                  </div>
                  <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                     <div className="flex flex-col">
                        <span className="text-2xl font-black italic">550<span className="text-accent-green">K</span></span>
                        <span className="text-[8px] uppercase font-bold opacity-40">AI LLM Datas</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-2xl font-black italic">99.2<span className="text-accent-purple">%</span></span>
                        <span className="text-[8px] uppercase font-bold opacity-40">AI Accuracy</span>
                     </div>
                  </div>
               </div>

               {/* Predictions Feature */}
               <div className="glass p-10 rounded-[40px] space-y-8 group hover:border-accent-purple/30 transition-all border-white/10 bg-white/5 shadow-[inset_0px_0px_80px_rgba(255,255,255,0.02)]">
                  <div className="space-y-4">
                     <h3 className="text-2xl font-black uppercase italic">Neural Prediction Core</h3>
                     <p className="text-white/40 text-[11px] leading-relaxed uppercase tracking-widest">
                        Hyper-accurate XGBoost regression models trained on millions of data points to predict your exact energy expenditure.
                     </p>
                  </div>
                  <div className="w-full h-32 bg-background/50 rounded-2xl relative overflow-hidden flex items-center justify-center">
                     <Activity className="text-accent-purple opacity-20 absolute scale-[3] blur-sm" />
                     <Zap className="text-accent-purple animate-hud-pulse" size={40} />
                  </div>
               </div>

               {/* Benefits Card */}
               <div className="bg-accent-green p-10 rounded-[40px] space-y-8 text-black group hover:scale-[1.02] transition-all">
                  <div className="flex justify-between items-start">
                     <h3 className="text-3xl font-black uppercase italic leading-tight">Calorie AI Benefits</h3>
                     <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                        <ArrowRight className="text-accent-green rotate-[-45deg] group-hover:rotate-0 transition-all" size={24} />
                     </div>
                  </div>
                  <ul className="space-y-4 pt-4 border-t border-black/10">
                     {['AI Coaching', 'Extensive Library', 'Personalized Workout', 'Daily Support', 'Meal Planning'].map((item) => (
                        <li key={item} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                           <div className="w-4 h-4 border-2 border-black rounded flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-black rounded-sm" />
                           </div>
                           {item}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* Footer-ish CTA */}
      <section className="py-20 text-center relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent-purple/10 blur-[150px] -z-10" />
         <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="space-y-8"
         >
            <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic opacity-10">THE FUTURE</h2>
            <div className="flex flex-col items-center gap-6 relative z-10 translate-y-[-40px]">
               <p className="text-xl font-bold uppercase tracking-widest italic tracking-[0.5em] text-white/60">Ready to start?</p>
               <button 
                  onClick={onStart}
                  className="px-16 py-6 bg-white text-black font-black uppercase tracking-[0.5em] hover:scale-105 active:scale-95 transition-all text-sm rounded-full shadow-[0_0_100px_rgba(255,255,255,0.2)]"
               >
                  {user ? 'Go to Dashboard' : 'Start Demo'}
               </button>

            </div>
         </motion.div>
      </section>
    </div>
  );
};

export default Home;
