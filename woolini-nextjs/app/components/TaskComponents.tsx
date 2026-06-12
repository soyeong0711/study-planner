'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Task, PALETTE_COLORS } from '@/lib/types';
import { formatTimerString, getDDayString, parseLocalDate } from '@/lib/utils';
import { getKSTDateString, getKSTDate, addDaysToDateStr } from '@/lib/utils';

const handleWrapChange = (valStr: string, maxVal: number, setter: (v: string) => void) => {
  if (valStr === "") {
    setter("");
    return;
  }
  const val = parseInt(valStr, 10);
  if (isNaN(val)) return;

  if (val < 0) {
    setter(String(maxVal));
  } else if (val > maxVal) {
    setter("0");
  } else {
    setter(valStr);
  }
};

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

export function AddTaskModal({ isOpen, onClose, editTask }: AddTaskModalProps) {
  const { tasks, setTasks, currentPlannerDate, todayStr } = useStore();

  const [title, setTitle] = useState(editTask?.title ?? '');
  const [desc, setDesc] = useState(editTask?.description ?? '');
  const [shour, setShour] = useState('');
  const [smin, setSmin] = useState('');
  const [dhour, setDhour] = useState('');
  const [dmin, setDmin] = useState('');
  const [dueText, setDueText] = useState(editTask?.dueDate ?? '');
  const [dueValue, setDueValue] = useState(editTask?.dueDate ?? '');
  const [color, setColor] = useState(editTask?.color ?? PALETTE_COLORS[0]);

  const resetFields = () => {
    setTitle(''); setDesc(''); setShour(''); setSmin('');
    setDhour(''); setDmin(''); setDueText(''); setDueValue('');
    setColor(PALETTE_COLORS[0]);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    const startH = shour ? String(parseInt(shour)).padStart(2, '0') : null;
    const startM = smin ? String(parseInt(smin)).padStart(2, '0') : '00';
    const startTime = startH ? `${startH}:${startM}` : null;
    const dh = parseInt(dhour) || 0;
    const dm = parseInt(dmin) || 0;
    const duration = dh || dm ? `${dh}시간 ${dm}분` : '';

    if (editTask) {
      setTasks(prev => prev.map(t => t.id === editTask.id
        ? { ...t, title: title.trim(), description: desc.trim(), startTime, duration, dueDate: dueValue || null, color }
        : t));
    } else {
      const newTask: Task = {
        id: Date.now(),
        title: title.trim(),
        description: desc.trim(),
        timeSeconds: 0,
        color,
        completed: '',
        startTime,
        duration,
        date: currentPlannerDate,
        dueDate: dueValue || null,
      };
      setTasks(prev => [...prev, newTask]);
    }
    resetFields();
    onClose();
  };

  const changeDueByDay = (delta: number) => {
    const base = dueValue || todayStr;
    const next = addDaysToDateStr(base, delta);
    setDueValue(next);
    setDueText(next);
  };

  const syncFromText = (val: string) => {
    setDueText(val);
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) setDueValue(val);
    else setDueValue('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="modal-card bg-white rounded-3xl max-w-[340px] w-full p-5 bubbly-shadow border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-headline font-bold text-sm text-[#356761]">
            {editTask ? '공부 계획 수정' : '공부 계획 추가'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-gray-600 mb-1">과목명/내용</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="예: 수학 미적분"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#356761]" />
          </div>
          <div>
            <label className="block font-bold text-gray-600 mb-1">상세 계획</label>
            <input value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="예: p.120 ~ 140"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#356761]" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-gray-600 mb-1">시작 시각</label>
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                <input type="number" value={shour} onChange={e => handleWrapChange(e.target.value, 23, setShour)} placeholder="09"
                  className="w-full bg-transparent border-0 p-0 text-center text-xs focus:ring-0" />
                <span className="text-[10px] text-gray-400">:</span>
                <input type="number" value={smin} onChange={e => handleWrapChange(e.target.value, 59, setSmin)} placeholder="00"
                  className="w-full bg-transparent border-0 p-0 text-center text-xs focus:ring-0" />
              </div>
            </div>
            <div>
              <label className="block font-bold text-gray-600 mb-1">예상 소요 시간</label>
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                <input type="number" value={dhour} onChange={e => handleWrapChange(e.target.value, 12, setDhour)} placeholder="2"
                  className="w-full bg-transparent border-0 p-0 text-center text-xs focus:ring-0" />
                <span className="text-[9px] text-gray-400">h</span>
                <input type="number" value={dmin} onChange={e => handleWrapChange(e.target.value, 59, setDmin)} placeholder="30"
                  className="w-full bg-transparent border-0 p-0 text-center text-xs focus:ring-0" />
                <span className="text-[9px] text-gray-400">m</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-600 mb-1">학습 마감일</label>
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5">
              <button type="button" onClick={() => changeDueByDay(-1)}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#356761]/20 text-[#356761] shrink-0">
                <span className="material-symbols-outlined text-[13px]">chevron_left</span>
              </button>
              <input type="text" value={dueText} onChange={e => syncFromText(e.target.value)}
                placeholder="YYYY-MM-DD" maxLength={10}
                className="flex-1 bg-transparent border-0 p-0 text-center text-xs focus:ring-0 min-w-0" />
              <button type="button" onClick={() => changeDueByDay(1)}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#356761]/20 text-[#356761] shrink-0">
                <span className="material-symbols-outlined text-[13px]">chevron_right</span>
              </button>
              <label className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#356761]/20 text-[#356761] cursor-pointer shrink-0">
                <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                <input type="date" value={dueValue} onChange={e => { setDueValue(e.target.value); setDueText(e.target.value); }} className="sr-only" />
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-600 mb-1.5">과목 고유 색상</label>
            <div className="flex flex-wrap gap-1.5">
              {PALETTE_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border-2 border-white transition-all ${color === c ? 'ring-2 ring-[#356761] scale-110' : 'ring-1 ring-gray-300/50'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-600 transition-colors">
              취소
            </button>
            <button onClick={handleSubmit}
              className="flex-[2] py-2.5 rounded-full bg-[#356761] bubbly-button font-bold text-white transition-all">
              {editTask ? '수정 완료' : '계획 추가'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────

interface DeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ isOpen, onConfirm, onCancel }: DeleteModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="modal-card bg-white rounded-3xl max-w-[280px] w-full p-5 bubbly-shadow border border-gray-200">
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-xl text-red-500">delete_forever</span>
          </div>
          <h3 className="font-headline font-bold text-sm text-gray-800">일정 삭제</h3>
          <p className="text-[10px] text-gray-500 mt-1">이 공부 계획을 삭제하시겠습니까?<br />삭제 후 복구할 수 없습니다.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-full bg-gray-100 font-bold text-xs text-gray-600 hover:bg-gray-200 transition-colors">취소</button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-full bg-red-500 font-bold text-xs text-white hover:bg-red-600 transition-colors">삭제</button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  isDue?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, isDue, onEdit, onDelete }: TaskCardProps) {
  const { tasks, setTasks, activeTimerTaskId, setActiveTimerTaskId, timerRunning, setTimerRunning, todayStr, addXP } = useStore();
  const postponeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setCompleted = (val: Task['completed']) => {
    const nextStatus = task.completed === val ? '' : val;

    if (postponeTimeoutRef.current) {
      clearTimeout(postponeTimeoutRef.current);
      postponeTimeoutRef.current = null;
    }

    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id !== task.id) return t;
        const wasO = t.completed === 'o';
        if (nextStatus === 'o' && !wasO) addXP(50);
        return { ...t, completed: nextStatus };
      });

      if (nextStatus === 'triangle' || nextStatus === 'x') {
        postponeTimeoutRef.current = setTimeout(() => {
          setTasks(currentTasks => {
            const currDate = parseLocalDate(task.date);
            currDate.setDate(currDate.getDate() + 1);
            const pad = (n: number) => String(n).padStart(2, '0');
            const nextDateStr = `${currDate.getFullYear()}-${pad(currDate.getMonth() + 1)}-${pad(currDate.getDate())}`;

            const alreadyCopied = currentTasks.some(t => t.title === task.title && t.date === nextDateStr);
            if (!alreadyCopied) {
              const newTask: Task = {
                ...task,
                id: Date.now() + Math.floor(Math.random() * 1000),
                date: nextDateStr,
                completed: '',
                timeSeconds: 0,
              };
              return [...currentTasks, newTask];
            }
            return currentTasks;
          });
          postponeTimeoutRef.current = null;
        }, 600);
      } else {
        const currDate = parseLocalDate(task.date);
        currDate.setDate(currDate.getDate() + 1);
        const pad = (n: number) => String(n).padStart(2, '0');
        const nextDateStr = `${currDate.getFullYear()}-${pad(currDate.getMonth() + 1)}-${pad(currDate.getDate())}`;
        return updated.filter(t => !(t.title === task.title && t.date === nextDateStr));
      }

      return updated;
    });
  };

  const toggleTimer = () => {
    if (timerRunning && activeTimerTaskId === task.id) {
      setTimerRunning(false);
    } else {
      setActiveTimerTaskId(task.id);
      setTimerRunning(true);
    }
  };

  const resetTimer = () => {
    if (activeTimerTaskId === task.id) setTimerRunning(false);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, timeSeconds: 0 } : t));
  };

  const isO = task.completed === 'o';
  const isTri = task.completed === 'triangle';
  const isX = task.completed === 'x';
  const isTicking = activeTimerTaskId === task.id && timerRunning;
  const ddayStr = getDDayString(task.dueDate, todayStr);

  const btnBase = 'py-1 rounded-xl text-xs flex items-center justify-center transition-all';
  const activeBtn = 'bg-[#356761]/20 border-2 border-[#356761] text-[#356761] font-bold';
  const inactiveBtn = 'border border-gray-300 text-gray-500';

  return (
    <div className="p-3 rounded-2xl bg-white border border-gray-200 flex flex-col gap-2.5 bubbly-shadow relative"
      style={{ borderLeft: `5px solid ${isDue ? '#ef4444' : task.color}` }}>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden w-full">
          <input type="checkbox" checked={isO} onChange={e => setCompleted(e.target.checked ? 'o' : '')}
            className="w-3.5 h-3.5 rounded shrink-0 cursor-pointer accent-[#356761]" />
          <div className="overflow-hidden flex-1 min-w-0">
            <h4 className={`text-xs font-bold text-gray-800 truncate flex items-center ${isO ? 'line-through opacity-50' : ''}`}>
              {isDue && <span className="inline-block text-[7px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-bold mr-1 shrink-0">오늘 마감</span>}
              <span className="truncate">{task.title}</span>
            </h4>
            {task.description && <p className={`text-[9px] text-gray-500 truncate ${isO ? 'opacity-50' : ''}`}>{task.description}</p>}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-[8px] font-bold text-red-500/80 mt-1 flex-wrap">
                <span>마감일: {task.dueDate} {ddayStr ? `(${ddayStr})` : ''}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={onEdit} className="text-gray-400 hover:text-[#356761] transition-colors">
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button onClick={onDelete} className="text-gray-400 hover:text-red-500 transition-colors">
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1">
        <button onClick={() => setCompleted('o')} className={`${btnBase} ${isO ? activeBtn : inactiveBtn}`}>O</button>
        <button onClick={() => setCompleted('triangle')} className={`${btnBase} ${isTri ? activeBtn : inactiveBtn}`}>△</button>
        <button onClick={() => setCompleted('x')} className={`${btnBase} ${isX ? activeBtn : inactiveBtn}`}>X</button>
      </div>

      <div className="flex items-center justify-between mt-1 gap-1 w-full">
        <div className="flex-1 flex items-center justify-center gap-0.5 bg-gray-100 border border-gray-200 rounded-lg py-0.5 px-1 min-w-0">
          <span className={`material-symbols-outlined text-[9px] text-[#356761] shrink-0 ${isTicking ? 'animate-pulse' : ''}`}>timer</span>
          <span className="text-[8px] font-bold font-headline tabular-nums text-gray-800 tracking-tighter truncate">{formatTimerString(task.timeSeconds)}</span>
        </div>
        <div className="flex gap-0.5 bg-gray-100 border border-gray-200 rounded-lg p-0.5 shrink-0">
          <button onClick={toggleTimer}
            className="w-5 h-5 rounded-full bg-[#356761] text-white flex items-center justify-center shadow transition-transform active:scale-90">
            <span className="material-symbols-outlined text-[10px]">{isTicking ? 'pause' : 'play_arrow'}</span>
          </button>
          <button onClick={resetTimer}
            className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center transition-colors active:scale-90">
            <span className="material-symbols-outlined text-[8px]">refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
