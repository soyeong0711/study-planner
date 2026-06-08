// 전역 Context Provider 설정 컴포넌트입니다.
"use client";

import { AppProvider } from "@/lib/AppContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}
