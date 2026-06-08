// 기존 단일 HTML(code.html)의 로컬 스토리지 데이터 관리 로직을 Next.js 환경에 맞게 React Context API 및 전역 상태(학습 계획, 타이머, 캐릭터, 테마 등)로 리팩토링한 Context 파일입니다.
"use client";


import React, { createContext, useContext, useState, useEffect } from "react";

export interface Task {
  id: number;
  title: string;
  description: string;
  timeSeconds: number;
  color: string;
  completed: "o" | "x" | "triangle";
  startTime: string | null;
  duration: string; // e.g. "2시간 30분"
  date: string; // YYYY-MM-DD
  dueDate?: string | null;
}

export interface Concept {
  id: number;
  subject: string;
  date: string;
  content: string;
}

export interface WrongAnswer {
  id: number;
  subject: string;
  title: string;
  desc: string;
  imageUrl: string;
  resolved: boolean;
}

export interface AppSettings {
  username: string;
  goalHours: string;
  avatarUrl: string;
  activeMascot: "woolini" | "yang-i" | "gom-i" | "custom";
  themeColor: "mint" | "lavender" | "yellow" | "blue" | "pink" | "green";
  bgMode: "light" | "dark";
  cardRoundness: "standard" | "sharp";
  soundEnabled: boolean;
  customMascotUrl: string;
  deadlineAlertsEnabled: boolean;
}

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  calendarNotes: Record<string, string>;
  setCalendarNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  calendarMoods: Record<string, string>;
  setCalendarMoods: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  timetableDrawings: Record<string, string>; // Format: 'YYYY-MM-DD_hour_part' -> color
  setTimetableDrawings: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  concepts: Record<string, Concept[]>; // 'YYYY-MM-DD' -> Concept[]
  setConcepts: React.Dispatch<React.SetStateAction<Record<string, Concept[]>>>;
  wrongAnswers: Record<string, WrongAnswer[]>; // 'YYYY-MM-DD' -> WrongAnswer[]
  setWrongAnswers: React.Dispatch<React.SetStateAction<Record<string, WrongAnswer[]>>>;
  notifications: Array<{ id: number; text: string; date: string; read: boolean }>;
  setNotifications: React.Dispatch<React.SetStateAction<Array<{ id: number; text: string; date: string; read: boolean }>>>;
  mascotLevel: number;
  setMascotLevel: React.Dispatch<React.SetStateAction<number>>;
  mascotXP: number;
  setMascotXP: React.Dispatch<React.SetStateAction<number>>;
  addXP: (amount: number) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loginState: boolean) => void;
  currentActiveTab: string;
  setCurrentActiveTab: (tab: string) => void;
  currentPlannerDate: string;
  setCurrentPlannerDate: (date: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentActiveTab, setCurrentActiveTab] = useState("planner");
  const [currentPlannerDate, setCurrentPlannerDate] = useState("");

  const [settings, setSettings] = useState<AppSettings>({
    username: "초보 탐험가",
    goalHours: "4시간 30분",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAL7pl4zo3S5ns-o-IQp1FW_FNeH4JNl2e17Y55WQLVloGJWyPd9QAaITZh2aNHwLGSRJpYy16uKevBs3ccUc5ETPxrfb6pJRBKDOVdkCMxiWAGIw-E3Q_XXrJLvxGrWezytHz_Rmj9b5X2W3oSH7xeGEHGjhym1K5ZETUK8Fo4iWuIv0I-49l5_TYd8eaVQdaWkirZYUv7cKL9mYiqSqG530T6nJwVlZ6hHncdvTO_FEHUkxUEfJUhol9P7Vp11o3PPhzgGDp2Rj8",
    activeMascot: "woolini",
    themeColor: "mint",
    bgMode: "light",
    cardRoundness: "standard",
    soundEnabled: true,
    customMascotUrl: "",
    deadlineAlertsEnabled: true,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarNotes, setCalendarNotes] = useState<Record<string, string>>({});
  const [calendarMoods, setCalendarMoods] = useState<Record<string, string>>({});
  const [timetableDrawings, setTimetableDrawings] = useState<Record<string, string>>({});
  const [concepts, setConcepts] = useState<Record<string, Concept[]>>({});
  const [wrongAnswers, setWrongAnswers] = useState<Record<string, WrongAnswer[]>>({});
  const [notifications, setNotifications] = useState<Array<{ id: number; text: string; date: string; read: boolean }>>([]);
  const [mascotLevel, setMascotLevel] = useState(1);
  const [mascotXP, setMascotXP] = useState(0);

  // Initialize dates
  useEffect(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    setCurrentPlannerDate(dateStr);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedSettings = localStorage.getItem("sp_settings");
      if (storedSettings) setSettings(JSON.parse(storedSettings));

      const storedTasks = localStorage.getItem("sp_tasks");
      if (storedTasks) setTasks(JSON.parse(storedTasks));

      const storedCalNotes = localStorage.getItem("sp_calendarNotes");
      if (storedCalNotes) setCalendarNotes(JSON.parse(storedCalNotes));

      const storedCalMoods = localStorage.getItem("sp_calendarMoods");
      if (storedCalMoods) setCalendarMoods(JSON.parse(storedCalMoods));

      const storedDrawings = localStorage.getItem("sp_timetableDrawings");
      if (storedDrawings) setTimetableDrawings(JSON.parse(storedDrawings));

      const storedConcepts = localStorage.getItem("sp_concepts");
      if (storedConcepts) setConcepts(JSON.parse(storedConcepts));

      const storedWrongAnswers = localStorage.getItem("sp_wrongAnswers");
      if (storedWrongAnswers) setWrongAnswers(JSON.parse(storedWrongAnswers));

      const storedMascotLevel = localStorage.getItem("sp_mascotLevel");
      if (storedMascotLevel) setMascotLevel(parseInt(storedMascotLevel));

      const storedMascotXP = localStorage.getItem("sp_mascotXP");
      if (storedMascotXP) setMascotXP(parseInt(storedMascotXP));

      const storedNotifications = localStorage.getItem("sp_notifications");
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));

      const loginState = localStorage.getItem("sp_logged_in");
      if (loginState === "true") setIsLoggedIn(true);
    } catch (e) {
      console.error("Failed to load local storage data", e);
    }
  }, []);

  // Save data to localStorage on changes
  useEffect(() => {
    if (typeof window === "undefined" || !currentPlannerDate) return;
    localStorage.setItem("sp_settings", JSON.stringify(settings));
  }, [settings, currentPlannerDate]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentPlannerDate) return;
    localStorage.setItem("sp_tasks", JSON.stringify(tasks));
  }, [tasks, currentPlannerDate]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentPlannerDate) return;
    localStorage.setItem("sp_calendarNotes", JSON.stringify(calendarNotes));
  }, [calendarNotes, currentPlannerDate]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentPlannerDate) return;
    localStorage.setItem("sp_calendarMoods", JSON.stringify(calendarMoods));
  }, [calendarMoods, currentPlannerDate]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentPlannerDate) return;
    localStorage.setItem("sp_timetableDrawings", JSON.stringify(timetableDrawings));
  }, [timetableDrawings, currentPlannerDate]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentPlannerDate) return;
    localStorage.setItem("sp_concepts", JSON.stringify(concepts));
  }, [concepts, currentPlannerDate]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentPlannerDate) return;
    localStorage.setItem("sp_wrongAnswers", JSON.stringify(wrongAnswers));
  }, [wrongAnswers, currentPlannerDate]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentPlannerDate) return;
    localStorage.setItem("sp_mascotLevel", mascotLevel.toString());
  }, [mascotLevel, currentPlannerDate]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentPlannerDate) return;
    localStorage.setItem("sp_mascotXP", mascotXP.toString());
  }, [mascotXP, currentPlannerDate]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentPlannerDate) return;
    localStorage.setItem("sp_notifications", JSON.stringify(notifications));
  }, [notifications, currentPlannerDate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("sp_logged_in", isLoggedIn ? "true" : "false");
  }, [isLoggedIn]);

  // Sync theme to root html element class
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // Remove previous background classes
    root.classList.remove("light", "dark");
    root.classList.add(settings.bgMode);

    // Toggle card corner roundness style
    if (settings.cardRoundness === "sharp") {
      root.classList.add("theme-sharp");
    } else {
      root.classList.remove("theme-sharp");
    }

    // Apply color theme mappings
    const themeColors: Record<string, string> = {
      mint: "#356761",
      lavender: "#655978",
      yellow: "#665f34",
      blue: "#3b82f6",
      pink: "#ec4899",
      green: "#10b981",
    };
    const primaryColor = themeColors[settings.themeColor] || themeColors.mint;
    root.style.setProperty("--primary-color", primaryColor);
  }, [settings.bgMode, settings.themeColor, settings.cardRoundness]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addXP = (amount: number) => {
    setMascotXP((prevXP) => {
      let newXP = prevXP + amount;
      let newLevel = mascotLevel;
      while (newXP >= 1000) {
        newXP -= 1000;
        newLevel += 1;
        // Trigger level up alert sound or bubble
        if (typeof window !== "undefined" && settings.soundEnabled) {
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, index) => {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.type = "triangle";
              osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.1);
              gain.gain.setValueAtTime(0.15, audioCtx.currentTime + index * 0.1);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + index * 0.1 + 0.4);
              osc.start(audioCtx.currentTime + index * 0.1);
              osc.stop(audioCtx.currentTime + index * 0.1 + 0.5);
            });
          } catch (e) {
            console.error(e);
          }
        }
      }
      if (newLevel !== mascotLevel) {
        setMascotLevel(newLevel);
        setNotifications((prev) => [
          {
            id: Date.now(),
            text: `🎉 축하합니다! 마스코트 레벨이 Level ${newLevel}로 상승했습니다!`,
            date: currentPlannerDate,
            read: false,
          },
          ...prev,
        ]);
      }
      return newXP;
    });
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        tasks,
        setTasks,
        calendarNotes,
        setCalendarNotes,
        calendarMoods,
        setCalendarMoods,
        timetableDrawings,
        setTimetableDrawings,
        concepts,
        setConcepts,
        wrongAnswers,
        setWrongAnswers,
        notifications,
        setNotifications,
        mascotLevel,
        setMascotLevel,
        mascotXP,
        setMascotXP,
        addXP,
        isLoggedIn,
        setIsLoggedIn,
        currentActiveTab,
        setCurrentActiveTab,
        currentPlannerDate,
        setCurrentPlannerDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
