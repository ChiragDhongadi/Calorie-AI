import React from 'react';
import { 
  LayoutDashboard, 
  Settings,
  LogOut,
  Flame,
  MessageSquare
} from 'lucide-react';

const Sidebar = ({ user, activeTab, setActiveTab, onLogoClick, onLogout, onSettingsClick, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard },
    { id: 'Calorie burn prediction', icon: Flame },
    { id: 'AI Coach', icon: MessageSquare },
    { id: 'Setting', icon: Settings },
  ];

  const handleTabClick = (id) => {
    if (id === 'Setting') {
      onSettingsClick();
    } else {
      setActiveTab(id);
    }
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <nav className={`
        fixed md:relative h-screen border-r border-white/5 flex flex-col items-center md:items-start py-8 glass z-50 flex-shrink-0 transition-all duration-300
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 w-24 lg:w-64'}
      `}>
        <div 
          className="px-6 mb-12 flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-all w-full md:w-auto" 
          onClick={() => {
            onLogoClick();
            if (setIsMobileOpen) setIsMobileOpen(false);
          }}
        >
          <div className="w-10 h-10 bg-neon-gradient rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(163,255,18,0.3)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(163,255,18,0.5)] transition-all duration-300">
            <Flame className="text-black fill-black" size={24} />
          </div>
          <span className={`text-xl font-black tracking-tight text-white italic ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>
             CALORIE <span className="text-accent-green">AI</span>
          </span>
        </div>

        <div className="flex-1 w-full px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative group
                ${activeTab === item.id 
                  ? 'bg-accent-green/10 text-accent-green' 
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'drop-shadow-[0_0_8px_rgba(163,255,18,0.8)]' : ''} />
              <span className={`font-semibold text-sm tracking-wide ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>
                {item.id}
              </span>
              
              {activeTab === item.id && (
                <div className="absolute left-[-1rem] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-accent-green rounded-full shadow-[0_0_15px_rgba(163,255,18,1)]" />
              )}
            </button>
          ))}
        </div>

        <div className="w-full px-4 mt-auto">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={22} />
            <span className={`font-semibold text-sm ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
