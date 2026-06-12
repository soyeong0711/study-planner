# 스터디 플래너 프로젝트 (Study Planner)

이 저장소는 스터디 플래너 애플리케이션의 세 가지 버전을 포함하고 있습니다. 다른 노트북(컴퓨터)에서 코드가 실행되지 않는 경우, 아래의 실행 가이드와 문제 해결 방법을 참고하여 설정해 주세요.

---

## 📂 프로젝트 구조

1. **`studyplanner` (단일 HTML 버전)**
   - `code.html` 파일로 구성된 단일 HTML 버전입니다.
   - 데이터는 브라우저의 `localStorage`에만 저장됩니다.
   
2. **`woolini-nextjs` (클라이언트 전용 Next.js 버전)**
   - Next.js 기반으로 변환된 버전으로, 데이터는 브라우저의 `localStorage`를 사용합니다.
   - 별도의 데이터베이스 설정이 필요하지 않습니다.

3. **`sp_essential` (Full Stack Next.js 버전) ⭐**
   - SQLite 데이터베이스(Prisma ORM)와 NextAuth(사용자 인증), Gemini API(AI 피드백)가 연동된 완전한 풀스택 버전입니다.
   - **다른 컴퓨터에서 실행 시 데이터베이스 및 환경 변수 설정이 반드시 필요합니다.**

---

## 🚀 버전별 실행 방법

### 1. `studyplanner` (HTML) 실행 방법
- 별도의 서버 없이 `studyplanner/code.html` 파일을 브라우저로 직접 열어 실행할 수 있습니다.
- 단, Tailwind CSS 및 아이콘 폰트를 CDN을 통해 불러오므로 **인터넷 연결이 필요합니다.**

### 2. `woolini-nextjs` 실행 방법
의존성 패키지를 설치한 후 개발 서버를 구동합니다.
```bash
cd woolini-nextjs
npm install
npm run dev
```
구동 후 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

### 3. `sp_essential` (DB 연동 버전) 실행 방법
데이터베이스(SQLite)와 Prisma 설정이 필요하므로 아래 단계를 순서대로 진행해야 합니다.

#### **Step 1: 환경 변수 파일 생성**
1. `sp_essential` 폴더 안에 있는 `.env.example` 파일을 복사하여 **`.env`** 파일을 생성합니다.
2. 생성한 `.env` 파일에 아래 내용을 입력하고 저장합니다.
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your_random_secret_key"
   NEXTAUTH_URL="http://localhost:3000"
   GEMINI_API_KEY="your_gemini_api_key_here"  # AI 기능 사용 시 필요
   ```

#### **Step 2: 의존성 패키지 설치**
```bash
cd sp_essential
npm install
```

#### **Step 3: 데이터베이스 초기화 및 Prisma 클라이언트 생성**
Prisma를 사용하여 로컬 SQLite 데이터베이스 파일(`dev.db`)을 생성하고 테이블을 만듭니다.
```bash
npx prisma db push
```
*(참고: 이 명령어를 실행하면 `prisma/dev.db` 파일이 자동 생성되고 Prisma 클라이언트 코드가 생성됩니다.)*

#### **Step 4: 개발 서버 구동**
```bash
npm run dev
```
서버 구동 후 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

---

## 🔍 자주 발생하는 문제 및 해결 방법 (Troubleshooting)

### ❓ **"Environment variable not found: DATABASE_URL" 에러가 발생해요**
- **원인:** `sp_essential` 폴더 내에 `.env` 파일이 없거나, `DATABASE_URL` 변수가 정의되지 않았기 때문입니다.
- **해결:** `sp_essential` 내에 `.env` 파일을 만들고 `DATABASE_URL="file:./dev.db"` 줄을 추가해 주세요. (위의 Step 1 참고)

### ❓ **"Prisma Client has not been generated yet" 에러 또는 DB 조회 에러가 발생해요**
- **원인:** 데이터베이스 스키마가 로컬 SQLite 파일에 반영되지 않았거나 Prisma Client 빌드가 되지 않았습니다.
- **해결:** `sp_essential` 폴더에서 `npx prisma db push` 또는 `npx prisma generate` 명령을 실행해 주세요.

### ❓ **npm install 시 에러가 발생해요**
- **원인:** Node.js 버전이 너무 낮거나 기존 lock 파일 충돌일 수 있습니다.
- **해결:** 노트북의 Node.js 버전을 최신 LTS(v18 또는 v20 이상)로 업데이트한 후, `node_modules` 폴더를 지우고 `npm install`을 다시 실행해 보세요.
