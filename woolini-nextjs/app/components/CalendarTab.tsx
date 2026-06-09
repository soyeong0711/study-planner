'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { MoodType } from '@/lib/types';
import { parseLocalDate } from '@/lib/utils';

const MOODS: { id: MoodType; emoji: string }[] = [
  { id: 'happy', emoji: '😊' },
  { id: 'calm', emoji: '😐' },
  { id: 'tired', emoji: '😴' },
  { id: 'focus', emoji: '📝' },
  { id: 'passionate', emoji: '🔥' },
];

export default function CalendarTab() {
  const { calendarNotes, setCalendarNotes, calendarMoods, setCalendarMoods, getVisibleTasksForDate, todayStr } = useStore();

  const [year, setYear] = useState(() => parseInt(todayStr.split('-')[0]));
  const [month, setMonth] = useState(() => parseInt(todayStr.split('-')[1]) - 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNote, setModalNote] = useState('');
  const [modalMood, setModalMood] = useState<MoodType>('');
  const [modalDateKey, setModalDateKey] = useState('');

  const pad = (n: number) => String(n).padStart(2, '0');
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const todayYear = parseInt(todayStr.split('-')[0]);
  const todayMonth = parseInt(todayStr.split('-')[1]) - 1;
  const todayDay = parseInt(todayStr.split('-')[2]);

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m); setYear(y); setSelectedDay(null);
  };

  const openModal = (dateKey: string) => {
    setModalDateKey(dateKey);
    setModalNote(calendarNotes[dateKey] ?? '');
    setModalMood((calendarMoods[dateKey] as MoodType) ?? '');
    setModalOpen(true);
  };

  const saveNote = () => {
    if (modalNote.trim()) setCalendarNotes(prev => ({ ...prev, [modalDateKey]: modalNote.trim() }));
    else { setCalendarNotes(prev => { const n = { ...prev }; delete n[modalDateKey]; return n; }); }
    if (modalMood) setCalendarMoods(prev => ({ ...prev, [modalDateKey]: modalMood }));
    else { setCalendarMoods(prev => { const n = { ...prev }; delete n[modalDateKey]; return n; }); }
    setModalOpen(false);
  };

  const selDateKey = selectedDay ? `${year}-${pad(month + 1)}-${pad(selectedDay)}` : null;
  const selTasks = selDateKey ? getVisibleTasksForDate(selDateKey) : [];

  return (
    <div className="flex-1 flex flex-col p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-headline font-bold text-sm text-[#356761]">월간 플래너</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => changeMonth(-1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-[#356761]/10 text-[#356761] active:scale-95">
            <span className="material-symbols-outlined text-xs">chevron_left</span>
          </button>
          <span className="text-[11px] font-bold text-gray-800 min-w-[70px] text-center">{year}년 {month + 1}월</span>
          <button onClick={() => changeMonth(1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-[#356761]/10 text-[#356761] active:scale-95">
            <span className="material-symbols-outlined text-xs">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl p-2.5 border border-gray-200 bubbly-shadow">
        <div className="grid grid-cols-7 mb-1.5 text-center text-[9px] font-bold text-gray-400">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <div key={d} className={i === 0 ? 'text-red-500' : i === 6 ? 'text-[#655978]' : ''}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Empty leading cells */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`pre-${i}`} className="aspect-square rounded-lg bg-gray-50/40" />
          ))}
          {/* Day cells */}
          {Array.from({ length: totalDays }, (_, i) => {
            const day = i + 1;
            const isToday = year === todayYear && month === todayMonth && day === todayDay;
            const isSelected = selectedDay === day;
            const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
            const hasNote = !!calendarNotes[dateKey];
            const mood = calendarMoods[dateKey] as MoodType | undefined;
            const dayTasks = getVisibleTasksForDate(dateKey);
            const emoji = MOODS.find(m => m.id === mood)?.emoji ?? '';

            return (
              <button key={day} onClick={() => setSelectedDay(day)}
                className={`aspect-square flex flex-col items-center justify-center text-[10px] font-bold rounded-lg transition-all active:scale-90 relative ${
                  isToday ? 'bg-[#356761] text-white bubbly-shadow' :
                  isSelected ? 'bg-[#356761]/20 text-[#356761] border border-[#356761]' :
                  'bg-gray-50/80 hover:bg-[#a5d8d1]/20 text-gray-800'}`}>
                <span>{day}</span>
                {isToday ? (
                  <span className="text-[7px] font-bold block leading-none mt-0.5 opacity-90">오늘</span>
                ) : emoji ? (
                  <span className="text-[8px] absolute bottom-0.5">{emoji}</span>
                ) : dayTasks.length > 0 ? (
                  <div className="flex gap-0.5 justify-center mt-0.5">
                    {dayTasks.slice(0, 3).map((t, j) => (
                      <span key={j} className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                    ))}
                  </div>
                ) : hasNote ? (
                  <span className="w-1.5 h-0.5 bg-[#356761] absolute bottom-1" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day notes */}
      <div className="flex-1 bg-gray-50/60 rounded-2xl p-3.5 border border-gray-200 flex flex-col gap-1.5 min-h-[120px]">
        <h4 className="text-[11px] font-bold text-[#356761] flex items-center gap-1 shrink-0">
          <span className="material-symbols-outlined text-[15px]">edit_note</span>
          {selDateKey ? `${selDateKey} 계획` : '날짜를 선택하세요'}
        </h4>
        {selDateKey ? (
          <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
            {calendarNotes[selDateKey] && (
              <p className="text-[10px] text-gray-600 leading-relaxed">{calendarNotes[selDateKey]}</p>
            )}
            {calendarMoods[selDateKey] && (
              <p className="text-[10px] text-gray-500">기분: {MOODS.find(m => m.id === calendarMoods[selDateKey])?.emoji}</p>
            )}
            {selTasks.map(t => (
              <div key={t.id} className="flex items-center gap-1.5 text-[9px] text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                <span>{t.title}</span>
                <span className="text-gray-400">{t.completed === 'o' ? '✓' : ''}</span>
              </div>
            ))}
            <button onClick={() => openModal(selDateKey)}
              className="w-full py-2 rounded-xl border-2 border-dashed border-[#356761]/30 hover:border-[#356761]/60 bg-[#356761]/5 text-[9px] font-bold text-[#356761] flex items-center justify-center gap-1 mt-auto transition-all">
              <span className="material-symbols-outlined text-sm">add</span>
              {calendarNotes[selDateKey] ? '메모 수정하기' : '이 날의 메모 및 기분 추가하기'}
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-gray-400 italic">날짜를 클릭하면 메모를 추가할 수 있어요.</p>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="modal-card bg-white rounded-3xl max-w-[340px] w-full p-5 bubbly-shadow border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-headline font-bold text-base text-[#356761]">일반 계획 기록</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">{modalDateKey}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1">메모 작성</label>
                <textarea value={modalNote} onChange={e => setModalNote(e.target.value)} rows={3}
                  placeholder="예: 단어 외우기 마감..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#356761] text-xs text-gray-800 resize-none" />
              </div>
              <div>
                <label className="block font-bold text-gray-600 mb-1.5">오늘의 기분</label>
                <div className="grid grid-cols-5 gap-1">
                  {MOODS.map(m => (
                    <button key={m.id} onClick={() => setModalMood(prev => prev === m.id ? '' : m.id)}
                      className={`py-1.5 rounded-lg border text-center text-[10px] flex flex-col items-center transition-all ${modalMood === m.id ? 'border-2 border-[#356761] bg-[#356761]/10' : 'border border-gray-200 bg-gray-50'}`}>
                      <span>{m.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <button onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-600 transition-colors">취소</button>
                <button onClick={saveNote}
                  className="flex-[2] py-2.5 rounded-full bg-[#356761] bubbly-button font-bold text-white">저장</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
