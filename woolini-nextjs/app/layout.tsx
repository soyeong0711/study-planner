import type { Metadata } from "next";
import { Noto_Sans_KR, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Woolini - 스터디 플래너",
  description: "나만의 모바일 스마트 플래너",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${notoSansKR.variable} ${plusJakarta.variable} bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-950 min-h-screen flex items-center justify-center p-0 md:p-6 overflow-x-hidden`}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
