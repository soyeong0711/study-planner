'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { MASCOT_URLS } from '@/lib/types';

const CHAT_RESPONSES = [
  '열심히 하고 있구나! 오늘도 파이팅! 🐉',
  '공부 잘 되고 있어? 틈틈이 쉬는 것도 중요해~ 😊',
  '집중력 최고야! 이 기세로 쭉 달려봐! 🔥',
  '한 번에 다 하려 하지 말고 조금씩 꾸준히! 💪',
  '잘하고 있어! 오늘 목표 꼭 달성하자! ⭐',
];

interface ChatMessage { text: string; isUser: boolean; }

export default function CharacterTab() {
  const { settings, setSettings, getMascotUrl, mascotXP, mascotLevel, addXP } = useStore();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: '안녕! 나는 울리니야. 오늘도 공부 열심히 하자! 🐉', isUser: false },
  ]);
  const [mood, setMood] = useState('포근함 🐉');

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { text: chatInput.trim(), isUser: true };
    const botMsg: ChatMessage = { text: CHAT_RESPONSES[Math.floor(Math.random() * CHAT_RESPONSES.length)], isUser: false };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setChatInput('');
  };

  const petMascot = () => {
    const moods = ['신남 ✨', '포근함 🐉', '힘냄 🔥', '행복함 😊', '집중중 📝'];
    setMood(moods[Math.floor(Math.random() * moods.length)]);
    addXP(10);
  };

  const xpPercent = (mascotXP / 1000) * 100;

  return (
    <div className="flex-1 flex flex-col p-3.5 space-y-3">
      {/* Mascot status */}
      <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 flex items-center gap-3 relative bubbly-shadow">
        <div className="w-16 h-16 rounded-full bg-[#356761]/20 flex items-center justify-center overflow-hidden border border-[#356761]/20 floating-mate cursor-pointer shrink-0"
          onClick={petMascot}>
          <img src={getMascotUrl()} className="w-11 h-11 object-contain" alt="mascot" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-xs text-[#356761]">울리니</h3>
            <span className="text-[8px] bg-[#655978]/20 text-[#655978] px-2 py-0.5 rounded-full font-bold">기분: {mood}</span>
          </div>
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center justify-between text-[8px] font-bold text-gray-500">
              <span>Level {mascotLevel}</span>
              <span>{mascotXP} / 1000 XP</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#356761] h-full rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl p-3.5 border border-gray-200 bubbly-shadow min-h-[180px]">
        <span className="text-[9px] font-bold text-[#655978] uppercase tracking-wider block mb-2">울리니 AI 스터디 메이트</span>
        <div className="flex-1 bg-gray-50 rounded-xl p-2.5 border border-gray-200 overflow-y-auto custom-scrollbar flex flex-col gap-2 max-h-[140px]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-1.5 ${msg.isUser ? 'flex-row-reverse' : ''}`}>
              {!msg.isUser && (
                <img src={getMascotUrl()} className="w-5 h-5 object-contain shrink-0" alt="mascot" />
              )}
              <div className={`max-w-[80%] px-2.5 py-1.5 rounded-2xl text-[10px] leading-relaxed ${
                msg.isUser ? 'bg-[#356761]/20 text-[#356761] rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
          <input value={chatInput} onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendChat()}
            placeholder="학습 피드백이나 질문을 해보세요..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-xs focus:outline-none focus:border-[#655978] text-gray-800" />
          <button onClick={sendChat}
            className="w-7 h-7 rounded-full bg-[#655978] text-white flex items-center justify-center shadow-md active:scale-90 transition-all shrink-0">
            <span className="material-symbols-outlined text-[13px]">send</span>
          </button>
        </div>
      </div>

      {/* Mascot selection */}
      <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 flex flex-col gap-2">
        <span className="text-[9px] font-bold text-gray-500 block uppercase tracking-wider">캐릭터 선택</span>
        <div className="grid grid-cols-4 gap-1.5">
          {Object.entries(MASCOT_URLS).map(([key, url]) => (
            <button key={key} onClick={() => setSettings(prev => ({ ...prev, activeMascot: key }))}
              className={`flex flex-col items-center gap-1 p-1 rounded-xl border transition-all ${settings.activeMascot === key ? 'border-[#356761] bg-[#356761]/10' : 'border-gray-200 bg-white'}`}>
              <img src={url} className="w-7 h-7 object-contain" alt={key} />
              <span className="text-[7px] font-bold text-gray-600">{key === 'woolini' ? '울리니' : key === 'yang-i' ? '양양이' : '곰곰이'}</span>
            </button>
          ))}
          <button onClick={() => setSettings(prev => ({ ...prev, activeMascot: 'custom' }))}
            className={`flex flex-col items-center gap-1 p-1 rounded-xl border transition-all ${settings.activeMascot === 'custom' ? 'border-[#356761] bg-[#356761]/10' : 'border-gray-200 bg-white'}`}>
            <img src={settings.customMascotUrl || 'https://img.icons8.com/color/150/user.png'} className="w-7 h-7 object-cover rounded-full" alt="custom" />
            <span className="text-[7px] font-bold text-gray-600">커스텀</span>
          </button>
        </div>
        <div className="flex gap-1.5 mt-1">
          <input value={settings.customMascotUrl} onChange={e => setSettings(prev => ({ ...prev, customMascotUrl: e.target.value }))}
            placeholder="나만의 캐릭터 이미지 주소..."
            className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-[9px] focus:outline-none focus:border-[#356761] text-gray-800" />
          <button onClick={() => setSettings(prev => ({ ...prev, activeMascot: 'custom' }))}
            className="px-3 py-1.5 bg-[#356761] text-white text-[9px] font-bold rounded-xl active:scale-95 transition-all">등록</button>
        </div>
      </div>
    </div>
  );
}
