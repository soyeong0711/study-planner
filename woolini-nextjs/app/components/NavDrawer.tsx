'use client';

import { useStore } from '@/lib/store';
import { TabType, THEME_COLORS } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TAB_ITEMS: { id: TabType; icon: string; label: string }[] = [
  { id: 'planner', icon: 'timer', label: '플래너' },
  { id: 'calendar', icon: 'calendar_month', label: '달력' },
  { id: 'notes', icon: 'description', label: '노트' },
  { id: 'character', icon: 'smart_toy', label: '캐릭터' },
];

export default function NavDrawer({ isOpen, onClose }: Props) {
  const { settings, setSettings, setActiveTab, getMascotUrl } = useStore();

  const navigate = (tab: TabType) => { setActiveTab(tab); onClose(); };

  const setTheme = (color: string) => {
    setSettings(prev => ({ ...prev, themeColor: color }));
  };

  const toggle = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'bgMode') {
      if (value) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="absolute inset-0 z-[84] bg-black/40" onClick={onClose} />
      )}

      {/* Drawer Panel */}
      <div className={`absolute inset-y-0 left-0 z-[85] w-[260px] bg-[#f7f9fc] border-r border-gray-200 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Profile Header */}
        <div className="bg-[#356761]/10 p-5 border-b border-gray-200 flex items-center gap-3 pt-14">
          <div className="w-11 h-11 rounded-full bg-[#356761]/20 overflow-hidden border-2 border-[#356761]/30 flex-shrink-0">
            <img src={getMascotUrl()} className="w-full h-full object-contain" alt="mascot" />
          </div>
          <div>
            <p className="font-bold text-xs text-[#356761]">{settings.username}</p>
            <p className="text-[9px] text-gray-500">목표: {settings.goalHours}</p>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1">
          {/* Tab Navigation */}
          <div className="border-b border-gray-100 pb-2 mb-1">
            <div className="px-4 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">화면 이동</div>
            {TAB_ITEMS.map(item => (
              <button key={item.id} onClick={() => navigate(item.id)}
                className="w-full px-4 py-2.5 rounded-xl hover:bg-[#356761]/10 flex items-center gap-3 text-xs font-bold text-gray-800 transition-all active:scale-[0.98]">
                <span className="material-symbols-outlined text-base text-[#356761]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Settings */}
          <div className="px-4 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">플래너 꾸미기</div>

          {/* Theme Colors */}
          <div className="px-3 pb-2">
            <p className="text-[9px] font-bold text-gray-500 mb-2">테마 색상</p>
            <div className="grid grid-cols-3 gap-1">
              {Object.entries(THEME_COLORS).map(([key, val]) => (
                <button key={key} onClick={() => setTheme(key)}
                  className={`py-1.5 rounded-lg border text-[9px] font-bold transition-all ${settings.themeColor === key ? 'ring-2 ring-offset-1' : ''}`}
                  style={{ backgroundColor: `${val.primary}15`, color: val.primary, borderColor: `${val.primary}50` }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          {[
            { label: '다크 모드', key: 'bgMode', checked: settings.bgMode === 'dark', val: (v: boolean) => v ? 'dark' : 'light' },
            { label: '알림 효과음', key: 'soundEnabled', checked: !!settings.soundEnabled, val: (v: boolean) => v },
            { label: '카드 모서리 둥글게', key: 'cardRoundness', checked: settings.cardRoundness === 'standard', val: (v: boolean) => v ? 'standard' : 'sharp' },
            { label: '마감일 D-Day 알림', key: 'deadlineAlertsEnabled', checked: !!settings.deadlineAlertsEnabled, val: (v: boolean) => v },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
              <span className="text-[10px] font-bold text-gray-600">{item.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={item.checked}
                  onChange={e => setSettings(prev => ({ ...prev, [item.key]: item.val(e.target.checked) } as any))} />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#356761]" />
              </label>
            </div>
          ))}

          {/* Logout */}
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button onClick={() => { localStorage.setItem('woolini_loggedIn', 'false'); window.location.reload(); }}
              className="w-full px-4 py-3 rounded-xl hover:bg-red-50 flex items-center gap-3 text-xs font-bold text-red-500 transition-all">
              <span className="material-symbols-outlined text-base">logout</span>
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
