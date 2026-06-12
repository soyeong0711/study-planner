'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Task } from '@/lib/types';
import { TaskCard, AddTaskModal, DeleteConfirmModal } from './TaskComponents';
import { formatTimerString, parseLocalDate, parseDurationMinutes, addDaysToDateStr } from '@/lib/utils';

function WeeklyCalendar() {
  const { currentPlannerDate, setCurrentPlannerDate, todayStr } = useStore();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const current = parseLocalDate(currentPlannerDate);
  const dow = current.getDay();
  const sunday = new Date(current);
  sunday.setDate(current.getDate() - dow);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-gray-50 rounded-2xl p-1.5 border border-gray-200 shadow-sm">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date(sunday);
          d.setDate(sunday.getDate() + i);
          const ds = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          const isSelected = ds === currentPlannerDate;
          const isToday = ds === todayStr;
          return (
            <button key={i} onClick={() => setCurrentPlannerDate(ds)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all active:scale-95 ${isSelected ? 'bg-[#356761] text-white shadow-sm scale-105 font-bold' : 'hover:bg-[#356761]/10 text-gray-600'}`}>
              <span className={`text-[7px] uppercase tracking-wider block font-bold opacity-80 ${!isSelected && i === 0 ? 'text-red-500' : ''} ${!isSelected && i === 6 ? 'text-[#655978]' : ''}`}>{days[i]}</span>
              <span className="text-xs font-headline font-bold block mt-0.5">{d.getDate()}</span>
              {isToday && !isSelected && <span className="w-1 h-1 rounded-full bg-[#356761] mt-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeTableGrid() {
  const { tasks, timetableDrawings, setTimetableDrawings, currentPlannerDate } = useStore();
  const [brushColor, setBrushColor] = useState('#a5d8d1');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showText, setShowText] = useState(true);

  const getTaskColor = (hour: number, part: number): string | null => {
    const dayTasks = tasks.filter(t => t.date === currentPlannerDate || t.dueDate === currentPlannerDate);
    const cellStart = hour * 60 + part * 10;
    const cellEnd = cellStart + 10;

    for (const task of dayTasks) {
      if (!task.startTime || !task.duration) continue;
      const [sh, sm] = task.startTime.split(':').map(Number);
      const startMinute = sh * 60 + sm;
      const durationMin = parseDurationMinutes(task.duration);
      const endMinute = startMinute + durationMin;

      // Normal overlap
      if (cellStart < endMinute && cellEnd > startMinute) return task.color;

      // Midnight wrap-around check (1440 minutes)
      if (endMinute > 1440) {
        const wrappedStart = 0;
        const wrappedEnd = endMinute - 1440;
        if (cellStart < wrappedEnd && cellEnd > wrappedStart) return task.color;
      }
    }
    return null;
  };

  const getDrawing = (hour: number, part: number): string | null =>
    timetableDrawings[`${currentPlannerDate}_${hour}_${part}`] ?? null;

  const handleCellInteract = (hour: number, part: number) => {
    const key = `${currentPlannerDate}_${hour}_${part}`;
    setTimetableDrawings(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = brushColor;
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-1 shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#356761]" />
          <span className="text-[7px] font-bold text-gray-500">브러시</span>
          <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)}
            className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent" />
        </div>
        <div className="flex items-center gap-1">
          <label className="flex items-center gap-0.5 cursor-pointer">
            <input type="checkbox" checked={showText} onChange={e => setShowText(e.target.checked)} className="sr-only peer" />
            <div className="w-6 h-3.5 bg-gray-200 rounded-full peer peer-checked:bg-[#356761] after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:after:translate-x-2.5 relative" />
            <span className="text-[7px] font-bold text-gray-500">텍스트</span>
          </label>
        </div>
      </div>
      {/* Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-px">
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={hour} className="flex items-center gap-1.5 h-6 relative">
            <span className="w-3.5 text-[9px] font-bold text-gray-400 text-right font-headline shrink-0">{hour}</span>
            <div className="flex-1 h-full grid grid-cols-6 gap-px bg-gray-200 rounded overflow-hidden">
              {Array.from({ length: 6 }, (_, part) => {
                const taskColor = getTaskColor(hour, part);
                const drawColor = getDrawing(hour, part);
                const activeColor = taskColor || drawColor;
                return (
                  <div key={part}
                    onMouseDown={() => { setIsDrawing(true); handleCellInteract(hour, part); }}
                    onMouseEnter={() => { if (isDrawing) handleCellInteract(hour, part); }}
                    onMouseUp={() => setIsDrawing(false)}
                    onTouchStart={() => handleCellInteract(hour, part)}
                    className="timetable-grid-cell bg-white hover:bg-[#a5d8d1]/20 cursor-pointer relative transition-colors"
                    style={activeColor ? { backgroundColor: activeColor } : {}}>
                    {showText && taskColor && part === 0 && (
                      <span className="absolute top-0 left-0 text-[6px] text-white font-bold truncate px-0.5 leading-none pointer-events-none">
                        {tasks.find(t => {
                          if (!t.startTime) return false;
                          const [sh] = t.startTime.split(':').map(Number);
                          return sh === hour && (t.date === currentPlannerDate || t.dueDate === currentPlannerDate);
                        })?.title ?? ''}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlannerTab() {
  const { tasks, setTasks, currentPlannerDate, setCurrentPlannerDate, todayStr, getVisibleTasksForDate } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const visible = getVisibleTasksForDate(currentPlannerDate);
  const dueTasks = visible.filter(t => t.dueDate === currentPlannerDate);
  const regTasks = visible.filter(t => t.dueDate !== currentPlannerDate);

  const totalSeconds = visible.reduce((s, t) => s + t.timeSeconds, 0);
  const completedCount = visible.filter(t => t.completed === 'o').length;

  const changePlannerDate = (delta: number) => {
    setCurrentPlannerDate(addDaysToDateStr(currentPlannerDate, delta));
  };

  const handleDelete = (id: number) => setDeleteId(id);
  const confirmDelete = () => {
    if (deleteId !== null) {
      setTasks(prev => {
        const task = prev.find(t => t.id === deleteId);
        const filtered = prev.filter(t => t.id !== deleteId);
        if (task) {
          const currDate = parseLocalDate(task.date);
          currDate.setDate(currDate.getDate() + 1);
          const pad = (n: number) => String(n).padStart(2, '0');
          const nextDateStr = `${currDate.getFullYear()}-${pad(currDate.getMonth() + 1)}-${pad(currDate.getDate())}`;
          return filtered.filter(t => !(t.title === task.title && t.date === nextDateStr));
        }
        return filtered;
      });
    }
    setDeleteId(null);
  };

  const isToday = currentPlannerDate === todayStr;

  return (
    <div className="flex-1 flex flex-col p-3.5 space-y-3 relative">
      {/* Due today banners */}
      {dueTasks.length > 0 && (
        <div className="space-y-1.5 shrink-0">
          {dueTasks.map(t => (
            <div key={t.id} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 text-[9px]">
              <span className="material-symbols-outlined text-[12px] text-red-500">alarm</span>
              <span className="font-bold text-red-600">오늘 마감: {t.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Date selector */}
      <div className="flex items-center justify-between bg-[#356761]/10 p-2.5 rounded-2xl border border-[#356761]/20">
        <div className="flex items-center gap-1">
          <button onClick={() => changePlannerDate(-1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#356761]/20 text-[#356761] active:scale-95">
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="font-headline font-bold text-xs text-[#356761] tracking-wide">{currentPlannerDate.replace(/-/g, '.')}</span>
            {isToday && <span className="text-[7px] font-bold bg-[#356761] text-white px-1.5 py-0.5 rounded-full leading-none mt-0.5">오늘</span>}
          </div>
          <button onClick={() => changePlannerDate(1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#356761]/20 text-[#356761] active:scale-95">
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
        <div className="text-right">
          <span className="text-[8px] font-bold text-gray-500 block uppercase tracking-wider">총 공부 시간</span>
          <span className="font-headline font-bold text-sm text-[#356761] tabular-nums tracking-tighter">{formatTimerString(totalSeconds)}</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-[10px] font-bold shrink-0">
        <span className="text-gray-500">오늘의 학습 현황</span>
        <div className="flex gap-2.5 items-center">
          <span className="text-[#356761] flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[11px]">check_circle</span>완료 {completedCount}개
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-red-500 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[11px]">pending</span>남음 {visible.length - completedCount}개
          </span>
        </div>
      </div>

      {/* Weekly calendar */}
      <WeeklyCalendar />

      {/* Main planner area */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        {/* Task list */}
        <div className="col-span-5 flex flex-col gap-2 overflow-y-auto no-scrollbar">
          {dueTasks.length > 0 && (
            <>
              <div className="text-[9px] font-bold text-red-500 flex items-center gap-1 uppercase tracking-wider shrink-0">
                <span className="material-symbols-outlined text-[11px]">alarm</span>오늘 마감
              </div>
              {dueTasks.map(t => (
                <TaskCard key={t.id} task={t} isDue onEdit={() => { setEditTask(t); setShowAddModal(true); }} onDelete={() => handleDelete(t.id)} />
              ))}
            </>
          )}
          {regTasks.length > 0 && (
            <>
              {dueTasks.length > 0 && <div className="text-[9px] font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wider shrink-0 border-t border-gray-100 pt-2 mt-1">
                <span className="material-symbols-outlined text-[11px]">list_alt</span>오늘의 할 일
              </div>}
              {regTasks.map(t => (
                <TaskCard key={t.id} task={t} onEdit={() => { setEditTask(t); setShowAddModal(true); }} onDelete={() => handleDelete(t.id)} />
              ))}
            </>
          )}
          {visible.length === 0 && <p className="text-[10px] text-gray-400 italic text-center py-4">오늘 등록된 계획이 없습니다.</p>}
          <button onClick={() => { setEditTask(null); setShowAddModal(true); }}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-[#356761]/30 hover:border-[#356761]/60 bg-[#356761]/5 text-[10px] font-bold text-[#356761] flex items-center justify-center gap-1 shrink-0 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>할일/과목 추가
          </button>
        </div>

        {/* Timetable */}
        <div className="col-span-7 bg-white rounded-2xl p-2 border border-gray-200 bubbly-shadow overflow-hidden flex flex-col">
          <TimeTableGrid />
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal isOpen={showAddModal} editTask={editTask}
        onClose={() => { setShowAddModal(false); setEditTask(null); }} />
      <DeleteConfirmModal isOpen={deleteId !== null}
        onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
