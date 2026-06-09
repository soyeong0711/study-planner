'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function LoginGateway() {
  const { setIsLoggedIn } = useStore();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialText, setSocialText] = useState('');

  const handleLogin = () => {
    const stored = localStorage.getItem('woolini_account');
    if (!stored) { setError('가입된 계정이 없습니다. 회원가입 해주세요.'); return; }
    const account = JSON.parse(stored);
    if (account.email !== email || account.pw !== pw) { setError('이메일 또는 비밀번호가 올바르지 않습니다.'); return; }
    setIsLoggedIn(true);
  };

  const handleSignup = () => {
    if (!email || !pw || !name) { setError('모든 필드를 입력해주세요.'); return; }
    if (pw !== pw2) { setError('비밀번호가 일치하지 않습니다.'); return; }
    localStorage.setItem('woolini_account', JSON.stringify({ email, pw, name }));
    setIsLoggedIn(true);
  };

  const handleSocial = (provider: string) => {
    setSocialLoading(true);
    setSocialText(`${provider} 계정으로 로그인 중...`);
    setTimeout(() => { setSocialLoading(false); setIsLoggedIn(true); }, 1500);
  };

  return (
    <div className="absolute inset-x-0 bottom-0 top-11 bg-[#f7f9fc] z-[70] flex flex-col p-6 overflow-y-auto no-scrollbar">
      {socialLoading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[95] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#356761] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-white">{socialText}</p>
        </div>
      )}

      <div className="my-auto space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#356761]/20 flex items-center justify-center mx-auto text-[#356761]">
            <span className="material-symbols-outlined text-3xl">edit_calendar</span>
          </div>
          <h2 className="font-headline font-bold text-xl text-[#356761]">Study Planner</h2>
          <p className="text-[10px] text-gray-500">나만의 모바일 스마트 플래너</p>
        </div>

        {/* Toggle */}
        <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-full border border-gray-200">
          <button onClick={() => { setIsSignup(false); setError(''); }}
            className={`py-2 rounded-full text-xs font-bold transition-all ${!isSignup ? 'bg-[#356761] text-white shadow' : 'text-gray-500'}`}>
            로그인
          </button>
          <button onClick={() => { setIsSignup(true); setError(''); }}
            className={`py-2 rounded-full text-xs font-bold transition-all ${isSignup ? 'bg-[#356761] text-white shadow' : 'text-gray-500'}`}>
            회원가입
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3">
          {error && <p className="text-[10px] text-red-500 text-center">{error}</p>}

          {isSignup && (
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="이름" type="text"
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#356761]" />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="이메일" type="email"
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#356761]" />
          <input value={pw} onChange={e => setPw(e.target.value)}
            placeholder="비밀번호" type="password"
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#356761]" />
          {isSignup && (
            <input value={pw2} onChange={e => setPw2(e.target.value)}
              placeholder="비밀번호 확인" type="password"
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#356761]" />
          )}

          <button onClick={isSignup ? handleSignup : handleLogin}
            className="w-full py-3 rounded-full bg-[#356761] text-white font-bold text-sm bubbly-button">
            {isSignup ? '회원가입' : '로그인'}
          </button>
        </div>

        {/* Social */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[9px] text-gray-400 font-bold">간편 로그인</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleSocial('카카오')}
              className="flex-1 py-2.5 rounded-full bg-[#FEE500] text-[#3C1E1E] text-xs font-bold flex items-center justify-center gap-1">
              <span className="text-sm">💬</span> 카카오
            </button>
            <button onClick={() => handleSocial('네이버')}
              className="flex-1 py-2.5 rounded-full bg-[#03C75A] text-white text-xs font-bold flex items-center justify-center gap-1">
              <span className="font-black text-sm">N</span> 네이버
            </button>
            <button onClick={() => handleSocial('구글')}
              className="flex-1 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center gap-1">
              <span className="text-sm">G</span> 구글
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
