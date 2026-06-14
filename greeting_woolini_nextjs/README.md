# Woolini (Next.js)

원본 단일 HTML 파일(`인사하는울리니.html`, 검정 배경에 인사하는 울리니 GIF 1장)을
Next.js(App Router + TypeScript)로 변환한 프로젝트입니다.

GIF는 base64로 임베드돼 있어 약 1MB라, 컴포넌트에 직접 넣지 않고
`public/woolini.gif` 파일로 분리했습니다.

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 접속.

## 구조

- `app/layout.tsx` — `lang="ko"`, 타이틀 `Woolini`, body 마진 제거
- `app/page.tsx`   — 검정 배경 + 중앙 정렬된 울리니 GIF (next/image, unoptimized)
- `public/woolini.gif` — 원본에서 추출한 애니메이션 GIF
