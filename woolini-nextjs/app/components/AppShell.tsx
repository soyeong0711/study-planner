'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { TabType } from '@/lib/types';
import LoginGateway from './LoginGateway';
import NavDrawer from './NavDrawer';
import PlannerTab from './PlannerTab';
import CalendarTab from './CalendarTab';
import NotesTab from './NotesTab';
import CharacterTab from './CharacterTab';

const TABS: { id: TabType; icon: string; label: string }[] = [
  { id: 'planner', icon: 'timer', label: '플래너' },
  { id: 'calendar', icon: 'calendar_month', label: '달력' },
  { id: 'notes', icon: 'description', label: '노트' },
  { id: 'character', icon: 'smart_toy', label: '캐릭터' },
];

function AndroidClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
      const kst = new Date(utc + 3600000 * 9);
      const h = String(kst.getHours()).padStart(2, '0');
      const m = String(kst.getMinutes()).padStart(2, '0');
      setTime(`${h}:${m}`);
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-white font-bold text-[10px]">{time}</span>;
}

export default function AppShell() {
  const { isLoggedIn, activeTab, setActiveTab, notifications, setNotifications, getMascotUrl } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const clearAllNotifications = () => {
    setNotifications([]);
    setNotifOpen(false);
  };

  return (
    <>
      {/* Android Status Bar */}
      <div className="h-11 bg-[#6c5dd3]/10 flex items-center justify-between px-7 pt-2.5 z-50 shrink-0">
        <AndroidClock />
        <div className="flex items-center gap-1 text-white">
          <span className="material-symbols-outlined text-[14px]">wifi</span>
          <span className="material-symbols-outlined text-[14px]">signal_cellular_4_bar</span>
          <span className="material-symbols-outlined text-[14px]">battery_full</span>
        </div>
      </div>

      {/* Camera punch-hole */}
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-[80] flex items-center justify-center pointer-events-none">
        <div className="w-3 h-3 bg-neutral-900 rounded-full border border-neutral-800/50 ml-auto mr-3" />
      </div>

      {/* Main App Screen */}
      <div id="app-screen" className="flex-1 bg-[#f7f9fc] flex flex-col overflow-hidden relative">
        {/* Nav Drawer */}
        <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

        {/* AppBar */}
        <header className="h-14 bg-white/60 backdrop-blur-md border-b border-gray-200/20 flex items-center justify-between px-3 z-40 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setDrawerOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all active:scale-95">
              <span className="material-symbols-outlined text-base text-gray-600">menu</span>
            </button>
            <div className="flex flex-col">
              <h1 className="font-headline font-bold text-xs text-[#356761] leading-tight">Study Planner</h1>
              <span className="text-[8px] text-gray-400 leading-tight">Woolini</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <button onClick={() => setNotifOpen(v => !v)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all active:scale-95 relative">
                <span className="material-symbols-outlined text-base text-gray-600">notifications</span>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-2xl shadow-xl py-3 z-[90] max-h-64 flex flex-col">
                  <div className="flex items-center justify-between px-3 pb-2 border-b border-gray-100">
                    <span className="text-[11px] font-bold text-[#356761]">알림</span>
                    <button onClick={clearAllNotifications} className="text-[9px] text-red-500 hover:underline font-bold">전체삭제</button>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-gray-400 text-center py-4">알림이 없습니다.</p>
                    ) : notifications.map(n => (
                      <div key={n.key} className="px-3 py-2 border-b border-gray-50 text-[10px] text-gray-700">{n.text}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#356761]/30 bg-[#356761]/10 flex items-center justify-center cursor-pointer">
              <img src={getMascotUrl()} className="w-6 h-6 object-contain" alt="avatar" />
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Login overlay */}
          {!isLoggedIn && <LoginGateway />}

          {/* Tab Views */}
          <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === 'planner' ? '' : 'hidden'}`}>
            <PlannerTab />
          </div>
          <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === 'calendar' ? '' : 'hidden'}`}>
            <CalendarTab />
          </div>
          <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === 'notes' ? '' : 'hidden'}`}>
            <NotesTab />
          </div>
          <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === 'character' ? '' : 'hidden'}`}>
            <CharacterTab />
          </div>
        </div>

        {/* Bottom Tab Bar */}
        <nav className="h-15 bg-white border-t border-gray-200 flex items-center justify-around z-50 shadow-lg shrink-0 py-2">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 transition-colors ${activeTab === tab.id ? 'text-[#356761]' : 'text-gray-400 hover:text-[#356761]'}`}>
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              <span className="text-[8px] font-bold">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
