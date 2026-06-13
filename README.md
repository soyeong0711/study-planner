# Moodin (Android)

울리니 캐릭터 감정 인터랙션 안드로이드 앱.

## 실행 방법 (Android Studio)

1. Android Studio 실행 → **File → Open** → 압축 푼 `MoodinApp` 폴더 선택
2. 우측 하단에 "Gradle sync" 가 자동으로 돌아감. 처음엔 의존성 다운로드로 몇 분 걸림 (인터넷 필요)
3. 상단에 기기/에뮬레이터 선택 후 ▶ (Run) 버튼 클릭
4. 에뮬레이터가 없으면: Device Manager → Create Device 로 가상 폰 하나 만들기

## .apk 만들기 (핸드폰에 설치)

- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- 빌드 완료 후 뜨는 알림에서 `locate` 클릭 → `app/build/outputs/apk/debug/app-debug.apk`
- 이 파일을 핸드폰으로 옮겨 설치 (출처를 알 수 없는 앱 설치 허용 필요)

## 구조

- `app/src/main/java/.../CharacterInteractionFeature.kt` — 화면 UI + 감정 로직
- `app/src/main/java/.../MainActivity.kt` — 앱 진입점
- `app/src/main/assets/` — 울리니 표정 HTML 3종
  - `woolini.html` (기본/기쁨/인사/터치)
  - `woolini_cry.html` (슬픔·울음)
  - `angry_woolini.html` (화남)

## 감정 조작

- 입력창: "화나/짜증" → 화남, "슬퍼/우울/울고" → 울음, "좋아/행복" → 기쁨, "안녕" → 인사
- 버튼: 인사 / 울음 / 화남 / 대기
- 캐릭터 영역을 터치하면 반응
