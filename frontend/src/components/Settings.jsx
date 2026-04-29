import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  User, 
  Shield, 
  Globe, 
  Cpu, 
  Zap, 
  ChevronDown, 
  X,
  Lock,
  Eye,
  Type,
  Database,
  Smartphone,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('General');
  
  const menuItems = [
    { id: 'General', icon: SettingsIcon },
    { id: 'Notifications', icon: Bell },
    { id: 'Personalization', icon: Cpu },
    { id: 'Data controls', icon: Database },
    { id: 'Security', icon: Shield },
    { id: 'Account', icon: User },
  ];

  const SettingRow = ({ label, subtitle, control }) => (
    <div className="flex items-center justify-between py-5 border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors px-2 -mx-2 rounded-lg">
      <div className="space-y-1">
        <p className="text-[13px] font-medium text-white/90">{label}</p>
        {subtitle && <p className="text-[11px] text-white/40">{subtitle}</p>}
      </div>
      <div className="flex items-center">
        {control}
      </div>
    </div>
  );

  const Dropdown = ({ value }) => (
    <button className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all min-w-[120px] justify-between">
      {value}
      <ChevronDown size={14} className="text-white/40" />
    </button>
  );

  const Toggle = ({ active }) => (
    <button className={`relative w-10 h-5 rounded-full transition-all duration-300 ${active ? 'bg-accent-green' : 'bg-white/10'}`}>
      <div className={`absolute top-1 w-3 h-3 rounded-full bg-black transition-all duration-300 ${active ? 'left-6' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto h-[700px] glass rounded-[24px] border border-white/10 overflow-hidden flex shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      {/* Sidebar - ChatGPT Style */}
      <div className="w-[240px] bg-black/20 border-r border-white/5 p-4 flex flex-col">
          <div className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[13px] font-medium
                  ${activeTab === item.id 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'}`}
              >
                <item.icon size={16} className={activeTab === item.id ? 'text-accent-green' : ''} />
                {item.id}
              </button>
            ))}
          </div>
          
          <div className="pt-4 border-t border-white/5">
             <div className="px-3 py-2 flex items-center gap-2 text-[11px] text-white/20 font-bold uppercase tracking-widest">
                <Info size={12} /> Version 2.0.4-Neural
             </div>
          </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-black/10 flex flex-col relative">
        {/* Close button (Aesthetic/Functional for modal feel) */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 text-white/20 hover:text-white transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-bold text-white tracking-tight">{activeTab}</h2>

              {/* Special Info Card (ChatGPT Style) */}
              {activeTab === 'General' && (
                <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 text-white/20 hover:text-white cursor-pointer transition-colors">
                    <X size={14} />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green shrink-0 shadow-[0_0_15px_rgba(163,255,18,0.1)]">
                      <Shield size={20} />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[13px] font-bold text-white">Enhance your neural sync</p>
                       <p className="text-[11px] text-white/40 leading-relaxed">Enable multi-factor bio-authentication to protect your training records and meal history from unauthorized neural access.</p>
                       <button className="mt-4 px-4 py-1.5 bg-white text-black text-[12px] font-bold rounded-lg hover:bg-white/90 transition-all">
                          Set up MFA
                       </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Groups */}
              <div className="space-y-1">
                {activeTab === 'General' && (
                  <>
                    <SettingRow label="Theme" control={<Dropdown value="Neural Neon" />} />
                    <SettingRow label="Neon Intensity" control={<Dropdown value="Optimized" />} />
                    <SettingRow label="Language" control={<Dropdown value="Auto-detect" />} />
                    <SettingRow label="Measurement System" control={<Dropdown value="Metric (kg/cm)" />} />
                    <SettingRow label="HUD Overlays" subtitle="Show floating data metrics in main dashboard" control={<Toggle active={true} />} />
                  </>
                )}

                {activeTab === 'Notifications' && (
                  <>
                    <SettingRow label="Daily Sync Reminders" subtitle="Get notified when it is time to log your data" control={<Toggle active={true} />} />
                    <SettingRow label="AI Coach Interjections" subtitle="Allow the coach to send real-time alerts" control={<Toggle active={false} />} />
                    <SettingRow label="Weekly Progress Reports" control={<Toggle active={true} />} />
                  </>
                )}

                {activeTab === 'Personalization' && (
                  <>
                    <SettingRow label="AI Coach Personality" control={<Dropdown value="Supportive" />} />
                    <SettingRow label="Response Depth" subtitle="Controls how technical the AI explanations are" control={<Dropdown value="Standard" />} />
                    <SettingRow label="Voice Assistant" control={<Toggle active={false} />} />
                  </>
                )}

                {activeTab === 'Data controls' && (
                  <>
                    <SettingRow label="Neural History" subtitle="Keep track of all your bio-metrics and chat history" control={<Toggle active={true} />} />
                    <SettingRow label="Sync on Cellular" control={<Toggle active={true} />} />
                    <div className="py-6 space-y-4">
                       <p className="text-[13px] font-bold text-white">Export data</p>
                       <p className="text-[11px] text-white/40">Download a complete copy of your training records and nutritional logs.</p>
                       <button className="px-4 py-2 border border-white/10 rounded-lg text-[12px] font-medium hover:bg-white/5 transition-all">Export</button>
                    </div>
                  </>
                )}

                {activeTab === 'Security' && (
                  <>
                    <SettingRow label="Password" control={<button className="text-accent-green text-[12px] font-bold hover:underline">Change</button>} />
                    <SettingRow label="Two-factor authentication" control={<Toggle active={false} />} />
                    <SettingRow label="Logged in devices" control={<ChevronDown size={16} className="text-white/40" />} />
                  </>
                )}

                {activeTab === 'Account' && (
                  <>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 mb-8">
                       <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green font-bold text-xl ring-1 ring-accent-green/30">
                          {user?.name?.substring(0,1).toUpperCase() || 'A'}
                       </div>
                       <div>
                          <p className="text-[14px] font-bold text-white">{user?.name || 'Athlete'}</p>
                          <p className="text-[11px] text-white/40">{user?.email}</p>
                       </div>
                    </div>
                    <SettingRow label="Bio-Sync ID" subtitle={user?.id} control={<button className="text-[10px] uppercase font-bold text-white/20 hover:text-white transition-colors">Copy</button>} />
                    <div className="pt-10">
                       <button className="w-full text-left p-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all group">
                          <p className="text-[13px] font-bold text-red-500">Delete Account</p>
                          <p className="text-[11px] text-red-500/40 mt-1">Permanently remove all bio-feedback data and logs</p>
                       </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/20">
           <button 
             onClick={onClose}
             className="px-4 py-2 rounded-xl text-[12px] font-medium text-white/40 hover:text-white transition-all"
           >
             Cancel
           </button>
           <button className="px-6 py-2 rounded-xl text-[12px] font-bold bg-white text-black hover:bg-white/90 transition-all shadow-lg active:scale-95">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
