// 로그인 및 자체 회원가입, 소셜 간편 로그인 데모 기능 구현
"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";

interface UserRecord {
  email: string;
  username: string;
  password?: string;
  goalHours: string;
  avatarUrl: string;
}

export default function LoginPage() {
  const { isLoggedIn, setIsLoggedIn, updateSettings } = useApp();
  const router = useRouter();

  const [formMode, setFormMode] = useState<"login" | "register">("login");
  const [userDb, setUserDb] = useState<UserRecord[]>([]);

  // Local login inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Local signup inputs
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [regGoalHours, setRegGoalHours] = useState("");
  const [regAvatarUrl, setRegAvatarUrl] = useState("");

  // Social login loader state
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialLoadingText, setSocialLoadingText] = useState("");

  // Read users database on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDb = localStorage.getItem("sp_user_db");
      if (storedDb) {
        setUserDb(JSON.parse(storedDb));
      }
    }
  }, []);

  const saveUserDb = (db: UserRecord[]) => {
    setUserDb(db);
    localStorage.setItem("sp_user_db", JSON.stringify(db));
  };

  const handleLocalLoginSubmit = () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    const matchedUser = userDb.find(
      (u) => u.email === loginEmail.trim() && u.password === loginPassword.trim()
    );

    if (!matchedUser) {
      alert("이메일 혹은 비밀번호가 일치하지 않습니다.");
      return;
    }

    // Sync settings
    updateSettings({
      username: matchedUser.username,
      avatarUrl: matchedUser.avatarUrl,
      goalHours: matchedUser.goalHours,
    });

    setIsLoggedIn(true);
    router.push("/planner");
  };

  const handleLocalRegisterSubmit = () => {
    if (!regEmail.trim() || !regUsername.trim() || !regPassword.trim()) {
      alert("이메일, 이름, 비밀번호는 필수 입력 사항입니다.");
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    const duplicate = userDb.find((u) => u.email === regEmail.trim());
    if (duplicate) {
      alert("이미 가입된 이메일 주소입니다.");
      return;
    }

    const newDb: UserRecord[] = [
      ...userDb,
      {
        email: regEmail.trim(),
        username: regUsername.trim(),
        password: regPassword.trim(),
        goalHours: regGoalHours.trim() || "4시간 30분",
        avatarUrl: regAvatarUrl.trim() || "https://img.icons8.com/color/150/user.png",
      },
    ];

    saveUserDb(newDb);
    alert("회원가입이 완료되었습니다. 방금 생성하신 이메일과 비밀번호로 로그인해주세요.");

    // Reset inputs
    setRegEmail("");
    setRegUsername("");
    setRegPassword("");
    setRegPasswordConfirm("");
    setRegGoalHours("");
    setRegAvatarUrl("");

    setFormMode("login");
  };

  const handleSocialLogin = (provider: "kakao" | "naver" | "google") => {
    let dummyName = "";
    let dummyAvatar = "";
    let dummyGoal = "";

    if (provider === "kakao") {
      setSocialLoadingText("카카오톡 인증 서버 연동 중...");
      dummyName = "카카오 프렌즈";
      dummyAvatar = "https://img.icons8.com/color/150/kakaotalk.png";
      dummyGoal = "3시간 30분";
    } else if (provider === "naver") {
      setSocialLoadingText("네이버 로그인 계정 연동 중...");
      dummyName = "네이버 탐험가";
      dummyAvatar = "https://img.icons8.com/color/150/naver.png";
      dummyGoal = "4시간 00분";
    } else if (provider === "google") {
      setSocialLoadingText("구글 보안 토큰 연동 중...");
      dummyName = "구글 스튜던트";
      dummyAvatar = "https://img.icons8.com/color/150/google-logo.png";
      dummyGoal = "5시간 00분";
    }

    setSocialLoading(true);

    setTimeout(() => {
      updateSettings({
        username: dummyName,
        avatarUrl: dummyAvatar,
        goalHours: dummyGoal,
      });

      setSocialLoading(false);
      setIsLoggedIn(true);
      router.push("/planner");
    }, 1200);
  };

  return (
    <div className="absolute inset-x-0 bottom-0 top-0 bg-surface dark:bg-inverse-surface z-[70] flex flex-col p-6 overflow-y-auto no-scrollbar">
      {/* Social Loading Spinner simulation */}
      {socialLoading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[95] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-white">{socialLoadingText}</p>
        </div>
      )}

      <div className="my-auto space-y-6">
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto text-primary">
            <span className="material-symbols-outlined text-3xl">edit_calendar</span>
          </div>
          <h2 className="font-headline font-bold text-xl text-primary">Study Planner</h2>
          <p className="text-[10px] text-on-surface-variant">나만의 모바일 스마트 플래너</p>
        </div>

        {/* Local Login Card */}
        {formMode === "login" ? (
          <div className="bg-surface-container rounded-3xl p-5 border border-surface-variant/20 space-y-3.5 shadow-md">
            <div className="flex justify-between items-center pb-2 border-b border-surface-variant/20">
              <span className="text-xs font-bold text-primary">로그인</span>
              <button
                onClick={() => setFormMode("register")}
                className="text-[10px] text-on-surface-variant hover:underline cursor-pointer"
              >
                회원가입하기
              </button>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant mb-1">
                이메일 주소 (ID)
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary text-on-surface"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant mb-1">
                비밀번호
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="비밀번호"
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary text-on-surface"
              />
            </div>
            <button
              onClick={handleLocalLoginSubmit}
              className="w-full py-2.5 rounded-full bg-primary bubbly-button text-white font-bold text-xs transition-all cursor-pointer"
            >
              로그인
            </button>
          </div>
        ) : (
          /* Local Signup Card */
          <div className="bg-surface-container rounded-3xl p-5 border border-surface-variant/20 space-y-3 shadow-md">
            <div className="flex justify-between items-center pb-2 border-b border-surface-variant/20">
              <span className="text-xs font-bold text-primary">자체 회원가입</span>
              <button
                onClick={() => setFormMode("login")}
                className="text-[10px] text-on-surface-variant hover:underline cursor-pointer"
              >
                로그인하러 가기
              </button>
            </div>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant mb-0.5">
                  이메일 주소 (ID)
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary text-on-surface"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant mb-0.5">
                  사용자 이름
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="이름 (예: 소영)"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary text-on-surface"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant mb-0.5">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary text-on-surface"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant mb-0.5">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={regPasswordConfirm}
                  onChange={(e) => setRegPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary text-on-surface"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant mb-0.5">
                  하루 목표 시간
                </label>
                <input
                  type="text"
                  value={regGoalHours}
                  onChange={(e) => setRegGoalHours(e.target.value)}
                  placeholder="예: 4시간 30분"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary text-on-surface"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-on-surface-variant mb-0.5">
                  프로필 이미지 URL (선택)
                </label>
                <input
                  type="text"
                  value={regAvatarUrl}
                  onChange={(e) => setRegAvatarUrl(e.target.value)}
                  placeholder="주소를 입력하세요"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary text-on-surface"
                />
              </div>
            </div>
            <button
              onClick={handleLocalRegisterSubmit}
              className="w-full py-2.5 rounded-full bg-primary bubbly-button text-white font-bold text-xs transition-all mt-2 cursor-pointer"
            >
              회원가입 완료
            </button>
          </div>
        )}

        {/* Social login simulation options */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-center gap-2">
            <span className="h-px bg-surface-variant/40 flex-1"></span>
            <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-wider">
              소셜 간편 로그인
            </span>
            <span className="h-px bg-surface-variant/40 flex-1"></span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => handleSocialLogin("kakao")}
              className="w-full py-2 bg-[#FEE500] text-[#191919] font-bold text-[10px] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">chat_bubble</span>
              <span>카카오톡으로 로그인</span>
            </button>
            <button
              onClick={() => handleSocialLogin("naver")}
              className="w-full py-2 bg-[#03C75A] text-white font-bold text-[10px] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">check_box</span>
              <span>네이버로 로그인</span>
            </button>
            <button
              onClick={() => handleSocialLogin("google")}
              className="w-full py-2 bg-white border border-outline-variant/60 text-on-surface-variant font-bold text-[10px] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">mail</span>
              <span>구글 계정으로 로그인</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
