import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import Prediction from './components/Prediction';
import CoachView from './components/CoachView';
import Home from './components/Home';
import Login from './components/Login';
import Settings from './components/Settings';
import axios from 'axios';

// Configure axios to always talk to the Flask backend
if (typeof window !== 'undefined') {
  axios.defaults.withCredentials = true;
  // Use environment variable for API URL in production, otherwise rely on Vite proxy
  if (import.meta.env.VITE_API_URL) {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
  }
}

import { MessageSquare, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from './supabaseClient';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAppStarted, setIsAppStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // Initial session check
    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        const session = data?.session;
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.email?.split('@')[0] || 'Athlete',
          });
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };


    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.email?.split('@')[0] || 'Athlete',
        });
      } else {
        setUser(null);
      }
      setIsAuthLoading(false);
    });


    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAppStarted(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAppStarted(false);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };


  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-green/20 border-t-accent-green rounded-full animate-spin" />
      </div>
    );
  }


  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard key="dashboard" user={user} />;
      case 'Calorie burn prediction':
        return <Prediction key="prediction" user={user} />;
      case 'AI Coach':
        return <CoachView key="coach" user={user} />;
      default:
        return <Dashboard key="default" user={user} />;
    }
  };


  return (
    <AnimatePresence mode="wait">
      {!isAppStarted ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <Home 
            user={user}
            onStart={() => {
              // Only reset app state, do NOT clear user session
              setIsAppStarted(true);
            }} 
          />

        </motion.div>

      ) : !user ? (
        <motion.div
           key="login-portal"
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.4 }}
        >
           <Login onLoginSuccess={handleLoginSuccess} onLogoClick={() => setIsAppStarted(false)} />
        </motion.div>
      ) : (
        <motion.div 
          key="app"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex h-screen bg-background overflow-hidden relative font-['Poppins']"
        >
          {/* Background Orbs */}
          <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-accent-purple/20 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-[0%] right-[-5%] w-[500px] h-[500px] bg-accent-green/10 rounded-full blur-[150px] animate-pulse-glow" />

          {/* Sidebar Navigation */}
          <Sidebar 
            user={user}
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onLogoClick={() => setIsAppStarted(false)}
            onLogout={() => setShowLogoutConfirm(true)}
            onSettingsClick={() => setIsSettingsOpen(true)}
            isMobileOpen={isSidebarOpen}
            setIsMobileOpen={setIsSidebarOpen}
          />

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto z-10 transition-all duration-500 relative">
            <header className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-background/40 backdrop-blur-md z-30 p-2 -mx-2 rounded-2xl">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 bg-white/5 rounded-xl text-white/60 md:hidden hover:bg-white/10"
                >
                  <Menu size={24} />
                </button>
                <div>
                  <h1 className="text-xl md:text-3xl font-black bg-neon-gradient bg-clip-text text-transparent uppercase tracking-tight">
                    {activeTab}
                  </h1>
                  <p className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1 hidden sm:block">
                    Neural Network Sync: Active • User Profile: {user.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="glass px-5 py-2.5 rounded-2xl border-white/10 flex items-center gap-3 hover:bg-white/5 transition-all cursor-pointer group">
                   <div className="w-9 h-9 rounded-xl bg-accent-green/20 flex items-center justify-center text-accent-green font-bold text-sm ring-1 ring-accent-green/30 group-hover:ring-accent-green/60 transition-all">
                     {user.name.substring(0, 2).toUpperCase()}
                   </div>
                   <div className="flex flex-col items-start leading-none">
                      <span className="text-sm font-black text-white italic">{user.name}</span>
                      <span className="text-[9px] font-black text-accent-green/60 uppercase tracking-tighter mt-1">Premium Tier</span>
                   </div>
                 </div>
              </div>
            </header>

            <div className="pb-24">
               {renderContent()}
            </div>
          </main>

          {/* Floating Chat Animation */}
          <AnimatePresence>
            {isChatOpen && activeTab !== 'AI Coach' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50, x: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50, x: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-20 right-4 md:bottom-24 md:right-8 w-[94%] md:w-[400px] h-[60vh] lg:h-[550px] z-50 shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-[32px] md:rounded-[40px] overflow-hidden border border-white/10 glass flex flex-col"
              >
                <Chatbot setIsChatOpen={setIsChatOpen} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Action Button */}
          {activeTab !== 'AI Coach' && (
            <button
              id="chatbot-fab"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`fixed bottom-8 right-8 w-16 h-16 rounded-full z-50 flex items-center justify-center transition-all duration-500 group
                ${isChatOpen 
                  ? 'bg-white/10 text-white rotate-90 border border-white/20' 
                  : 'bg-accent-green text-black shadow-[0_0_30px_rgba(163,255,18,0.4)] hover:shadow-[0_0_50px_rgba(163,255,18,0.6)] hover:scale-110'}`}
            >
              {isChatOpen ? <X size={28} /> : <MessageSquare size={28} className="drop-shadow-lg" />}
              
              {!isChatOpen && (
                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-purple rounded-full border-2 border-background animate-bounce" />
              )}
            </button>
          )}

          {/* Background Dim for Chat Overlay */}
          <AnimatePresence>
            {isChatOpen && activeTab !== 'AI Coach' && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                 onClick={() => setIsChatOpen(false)}
               />
            )}
          </AnimatePresence>

          {/* Settings Modal */}
          <AnimatePresence>
            {isSettingsOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSettingsOpen(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative z-10 w-full max-w-5xl"
                >
                  <Settings user={user} onClose={() => setIsSettingsOpen(false)} />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Logout Confirmation Modal */}
          <AnimatePresence>
            {showLogoutConfirm && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />
                
                {/* Modal Card */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative bg-[#1A1A1A] p-10 rounded-[40px] border border-white/5 max-w-[440px] w-full shadow-[0_40px_80px_rgba(0,0,0,0.8)] z-10"
                >
                  <div className="flex flex-col items-center text-center space-y-8">
                    <div className="space-y-4 text-center">
                      <h3 className="text-[32px] font-bold text-white leading-tight tracking-tight">
                        Are you sure you <br /> want to log out?
                      </h3>
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full pt-4">
                      <button 
                        onClick={() => {
                          setShowLogoutConfirm(false);
                          handleLogout();
                        }}
                        className="w-full py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-[#E5E5E5] transition-all active:scale-[0.98]"
                      >
                        Log out
                      </button>
                      <button 
                        onClick={() => setShowLogoutConfirm(false)}
                        className="w-full py-4 bg-[#2C2C2E] text-white rounded-full font-bold text-lg border border-white/10 hover:bg-[#3A3A3C] transition-all active:scale-[0.98]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
