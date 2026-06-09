'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { ConceptNote, WrongAnswer, DayNotes } from '@/lib/types';
import { getKSTDateString, getKSTDate } from '@/lib/utils';

type NoteTab = 'concept' | 'wrong';

export default function NotesTab() {
  const { studyNotes, setStudyNotes, todayStr } = useStore();
  const [tab, setTab] = useState<NoteTab>('concept');

  // Concept form
  const [cDate, setCDate] = useState(todayStr);
  const [cSubject, setCSubject] = useState('');
  const [cContent, setCContent] = useState('');

  // Wrong answer form
  const [wSubject, setWSubject] = useState('');
  const [wTitle, setWTitle] = useState('');
  const [wDesc, setWDesc] = useState('');
  const [wImageUrl, setWImageUrl] = useState('');

  const getDayNotes = (dateKey: string): DayNotes =>
    studyNotes[dateKey] ?? { concepts: [], wrongAnswers: [] };

  const allConcepts: ConceptNote[] = Object.values(studyNotes).flatMap(d => d.concepts ?? []);
  const allWrong: WrongAnswer[] = Object.values(studyNotes).flatMap(d => d.wrongAnswers ?? []);

  const addConcept = () => {
    if (!cSubject.trim() || !cContent.trim()) return;
    const note: ConceptNote = { id: Date.now(), date: cDate, subject: cSubject.trim(), content: cContent.trim() };
    const dayNotes = getDayNotes(cDate);
    setStudyNotes(prev => ({ ...prev, [cDate]: { ...dayNotes, concepts: [...dayNotes.concepts, note] } }));
    setCSubject(''); setCContent('');
  };

  const deleteConcept = (dateKey: string, id: number) => {
    const dayNotes = getDayNotes(dateKey);
    setStudyNotes(prev => ({ ...prev, [dateKey]: { ...dayNotes, concepts: dayNotes.concepts.filter(c => c.id !== id) } }));
  };

  const addWrong = () => {
    if (!wSubject.trim() || !wTitle.trim()) return;
    const wa: WrongAnswer = { id: Date.now(), subject: wSubject.trim(), title: wTitle.trim(), description: wDesc.trim(), imageUrl: wImageUrl.trim() };
    const dateKey = todayStr;
    const dayNotes = getDayNotes(dateKey);
    setStudyNotes(prev => ({ ...prev, [dateKey]: { ...dayNotes, wrongAnswers: [...dayNotes.wrongAnswers, wa] } }));
    setWSubject(''); setWTitle(''); setWDesc(''); setWImageUrl('');
  };

  const deleteWrong = (dateKey: string, id: number) => {
    const dayNotes = getDayNotes(dateKey);
    setStudyNotes(prev => ({ ...prev, [dateKey]: { ...dayNotes, wrongAnswers: dayNotes.wrongAnswers.filter(w => w.id !== id) } }));
  };

  return (
    <div className="flex-1 flex flex-col p-3.5 space-y-3.5">
      {/* Sub-tab toggle */}
      <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-full border border-gray-200 shrink-0">
        <button onClick={() => setTab('concept')}
          className={`py-2 rounded-full text-xs font-bold transition-all ${tab === 'concept' ? 'bg-[#356761] text-white shadow' : 'text-gray-500 hover:text-[#356761]'}`}>
          개념 요약
        </button>
        <button onClick={() => setTab('wrong')}
          className={`py-2 rounded-full text-xs font-bold transition-all ${tab === 'wrong' ? 'bg-[#356761] text-white shadow' : 'text-gray-500 hover:text-[#356761]'}`}>
          오답노트
        </button>
      </div>

      {tab === 'concept' && (
        <div className="flex-1 flex flex-col bg-white rounded-2xl p-3 border border-gray-200 shadow-sm min-h-0">
          <div className="flex justify-between items-center mb-2 shrink-0">
            <span className="text-[10px] font-bold text-[#356761] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              개념 요약 목록
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 mb-3 min-h-0">
            {allConcepts.length === 0 && <p className="text-[10px] text-gray-400 italic text-center py-4">개념 요약이 없습니다.</p>}
            {allConcepts.map(c => {
              const dateKey = c.date;
              return (
                <div key={c.id} className="bg-gray-50 rounded-xl p-2.5 border border-gray-200 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-[#356761]">{c.subject}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-gray-400">{c.date}</span>
                      <button onClick={() => deleteConcept(dateKey, c.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                </div>
              );
            })}
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 space-y-2 text-[10px] shrink-0">
            <div className="grid grid-cols-2 gap-1.5">
              <input type="date" value={cDate} onChange={e => setCDate(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none text-gray-800" />
              <input value={cSubject} onChange={e => setCSubject(e.target.value)} placeholder="과목 (예: 수학)"
                className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none text-gray-800" />
            </div>
            <textarea value={cContent} onChange={e => setCContent(e.target.value)} rows={3}
              placeholder="공부한 주요 공식이나 핵심 요약 내용을 기록하세요..."
              className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 resize-none focus:outline-none focus:border-[#356761]" />
            <button onClick={addConcept}
              className="w-full py-2 bg-[#356761] text-white font-bold rounded-lg transition-transform active:scale-95">
              개념 요약 추가하기
            </button>
          </div>
        </div>
      )}

      {tab === 'wrong' && (
        <div className="flex-1 flex flex-col bg-white rounded-2xl p-3 border border-gray-200 shadow-sm min-h-0">
          <span className="text-[10px] font-bold text-[#655978] flex items-center gap-1 mb-2 shrink-0">
            <span className="material-symbols-outlined text-[14px]">assignment_late</span>
            오답노트 관리
          </span>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 mb-3 min-h-0">
            {allWrong.length === 0 && <p className="text-[10px] text-gray-400 italic text-center py-4">오답이 없습니다.</p>}
            {allWrong.map(w => {
              const dateKey = Object.entries(studyNotes).find(([, d]) => d.wrongAnswers.some(wa => wa.id === w.id))?.[0] ?? todayStr;
              return (
                <div key={w.id} className="bg-gray-50 rounded-xl p-2.5 border border-gray-200 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-[#655978]">{w.subject} — {w.title}</span>
                    <button onClick={() => deleteWrong(dateKey, w.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </button>
                  </div>
                  {w.description && <p className="text-[10px] text-gray-600 mb-1">{w.description}</p>}
                  {w.imageUrl && <img src={w.imageUrl} alt="참조 이미지" className="w-full max-h-24 object-contain rounded-lg border border-gray-200 mt-1" />}
                </div>
              );
            })}
          </div>
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 space-y-2 text-[10px] shrink-0">
            <div className="grid grid-cols-2 gap-1.5">
              <input value={wSubject} onChange={e => setWSubject(e.target.value)} placeholder="과목 (예: 수학)"
                className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none text-gray-800" />
              <input value={wTitle} onChange={e => setWTitle(e.target.value)} placeholder="오답노트 제목 (예: 미적 12번)"
                className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none text-gray-800" />
            </div>
            <input value={wDesc} onChange={e => setWDesc(e.target.value)} placeholder="틀린 원인이나 해결 방안..."
              className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none text-gray-800" />
            <input value={wImageUrl} onChange={e => setWImageUrl(e.target.value)} placeholder="참조 문제 이미지 주소 (선택)"
              className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none text-gray-800" />
            <button onClick={addWrong}
              className="w-full py-2 bg-[#655978] text-white font-bold rounded-lg transition-all active:scale-95">
              오답 기록 추가
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
