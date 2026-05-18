import React from 'react';
import { 
  Mic, 
  Settings2, 
  LogOut,
  User,
  Share2,
  History,
  Video,
  Library,
  Crown,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const WHITELISTED_EMAILS = ['sachinamliyar15@gmail.com', 'amliyarsachin248@gmail.com'];
const isWhitelisted = (email: string | null | undefined) => email ? WHITELISTED_EMAILS.includes(email) : false;

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  currentUser, 
  userProfile, 
  onLogin, 
  onLogout, 
  handleShare,
  setIsPricingModalOpen,
  setShowSettings,
  selectedVoice
}: any) {
  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 p-6 flex flex-col gap-8 transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="hidden md:flex items-center gap-3">
        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
          <Mic className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-display font-bold tracking-tight">
          VoxNova <span className="text-emerald-500 font-medium text-base">Text to Speech</span>
        </h1>
      </div>

      <nav className="flex flex-col gap-2">
        <button 
          onClick={() => { setActiveTab('generate'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'generate' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
        >
          <Mic size={20} />
          Text to Speech Voice
        </button>
        <button 
          onClick={() => { setActiveTab('voice-changer'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'voice-changer' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
        >
          <RefreshCw size={20} />
          Voice Changer
        </button>
        <button 
          onClick={() => { setActiveTab('voice-clone'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'voice-clone' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
        >
          <Sparkles size={20} />
          Voice Clone
        </button>
        <button 
          onClick={() => { setActiveTab('captions'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'captions' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
        >
          <Video size={20} />
          Auto Caption
        </button>
        <button 
          onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
        >
          <History size={20} />
          Generation History
        </button>
        <button 
          onClick={() => { setActiveTab('library'); setIsMobileMenuOpen(false); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'library' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
        >
          <Library size={20} />
          Voice Library
        </button>
        <button 
          onClick={() => { handleShare(); setIsMobileMenuOpen(false); }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
        >
          <Share2 size={20} />
          Share App
        </button>
        <button 
          onClick={() => { setIsPricingModalOpen(true); setIsMobileMenuOpen(false); }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all border border-emerald-100"
        >
          <Crown size={20} />
          Premium Plans
        </button>
      </nav>

      <div className="mt-auto p-4 glass-panel rounded-2xl border-zinc-100">
        {currentUser ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="" 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border border-zinc-200"
                />
              ) : null}
              <div 
                className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200 font-bold"
                style={{ display: currentUser.photoURL ? 'none' : 'flex' }}
              >
                {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{currentUser.displayName}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                  {isWhitelisted(currentUser.email) ? 'Owner' : (userProfile?.plan || 'Free')} Plan
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                  title="Settings"
                >
                  <Settings2 size={18} />
                </button>
                <button onClick={onLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Credits</span>
                <span className="text-xs font-mono text-emerald-600">
                  {isWhitelisted(currentUser.email) ? 'Unlimited' : (userProfile ? userProfile.credits?.toLocaleString() : '...')}
                </span>
              </div>
              <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: isWhitelisted(currentUser.email) ? '100%' : `${Math.min(100, ((userProfile?.credits || 0) / 20000) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white font-bold py-3 rounded-xl hover:bg-zinc-800 transition-all"
          >
            <User size={18} />
            Login with Google
          </button>
        )}
      </div>
    </aside>
  );
}
