# 오하꼼

오늘의 짧은 산책 미션을 제안하는 iOS/Android/Web Expo 앱입니다. `api.json`의 이메일 인증·미션·프로필·설정·보상·랭킹 API를 사용합니다.

## 실행

```bash
bun install
cp .env.example .env
bun start --port 8082
```

패키지 매니저는 Bun을 사용합니다. `.env`의 `EXPO_PUBLIC_API_BASE_URL`을 `/api/v1`까지 포함한 백엔드 주소로 설정하세요. 기본값은 배포된 개발 서버 `https://ohakkom-backend.onrender.com/api/v1`입니다. 무료 서버의 첫 연결은 1분 이상 걸릴 수 있어 요청 제한 시간은 90초입니다. 실제 기기는 PC의 LAN IP나 접근 가능한 서버 도메인을 사용해야 합니다. Expo 기본 포트도 8081이므로 개발 서버는 8082를 권장합니다. 웹 연결에는 백엔드 CORS 허용이 필요합니다.

기본값은 실제 API 모드입니다. 백엔드가 실행되지 않았으면 연결 오류가 표시되며 목업 성공으로 전환하지 않습니다. 환경 변수 변경 후 Expo를 재시작하세요.

## 서버 없이 QA

`.env`에서 `EXPO_PUBLIC_USE_MSW=true`로 설정하면 웹/네이티브 MSW를 사용합니다. 로그인 화면의 `QA 모드로 바로 둘러보기`로 진입하세요. 이 모드에서만 모의 GPS 좌표와 QA 시나리오를 제공합니다. 미션 추천 → 출발 → 도착 인증 → 설문 → 보상 및 중단을 서버 없이 확인할 수 있습니다. 목업 상태는 프로세스 재시작/웹 새로고침 시 초기화됩니다.

## 검증

```bash
bun run api:types
bun test
bun run typecheck
bun run lint
bun run doctor
bunx expo export --platform all
```

2026-09-30 변경 명세의 23개 API를 연결했습니다. 토큰 재발급, 주간 리듬, 출발 약속, 기록·지도 목록, 추천 기본값, 프로필 편집을 지원합니다. 도착 인증은 **80m 안에서 30초 체류 후 재확인**이 필요합니다. 지도는 카카오맵으로 연결합니다.

## 실제 API 테스트

```bash
RUN_LIVE_API=1 bun run test:live
```

이 명령은 위 개발 서버에 합성 계정 1개와 테스트 미션을 만들고 23개 API를 검사합니다. 실제 사용자 계정·위치를 쓰지 않습니다. 도착 체류 때문에 30초 이상 걸립니다. 기본 결과 파일은 `/tmp/ohakkom-live-report.json`이며 토큰과 비밀번호는 보고서에 기록하지 않습니다. 일반 `bun test`는 네트워크 없이 MSW로 실행합니다.

## 출시 전 남은 조건

- 사용자가 약관 원문이 아직 없다고 확인했습니다. `.env.example`의 서비스·개인정보·위치기반서비스 약관 HTTPS URL 3개를 설정하기 전까지 실제 회원가입은 비활성화됩니다. QA 가입만 합성 동의로 테스트할 수 있습니다.
- 기본 서버는 데이터가 초기화될 수 있는 개발 서버입니다. 운영 서버·약관을 설정해야 합니다.
- 동네 이름 조회/코드 선택 API가 없어 가입·프로필 편집은 10자리 동네 코드를 사용합니다. 백엔드가 지역 이름을 `지역 정보 없음`으로 반환할 수 있습니다.
- 푸시 실제 발송, 카카오 로그인, 인사이트, 쿠폰/제휴, 신고, 데이터 삭제/내보내기는 제공된 API 범위 밖입니다. 해당 화면은 준비 중으로 표시합니다.
- 지도 SDK를 삽입하지 않았고 실제 경로·걸음 수를 측정하지 않습니다. 거리에는 추정값임을 표시합니다.

설계와 검증 범위는 [architecture](docs/architecture.md), [검증 결과](docs/api-verification.md)에 기록했습니다.

## 스토어 빌드

```bash
bunx eas-cli@latest login
bun run build:ios
bun run build:android
```

Android 네이티브 빌드는 Gradle, iOS는 Xcode/EAS Build를 사용합니다.
