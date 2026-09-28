# 오하꼼

오늘의 짧은 산책 미션을 제안하는 iOS/Android/Web Expo 앱입니다. `api.json`의 이메일 인증·미션·프로필·설정·보상·랭킹 API를 사용합니다.

## 실행

```bash
bun install
cp .env.example .env
bun start --port 8082
```

패키지 매니저는 Bun을 사용합니다. `.env`의 `EXPO_PUBLIC_API_BASE_URL`을 `/api/v1`까지 포함한 백엔드 주소로 설정하세요. 기본값은 `http://localhost:8081/api/v1`입니다. 실제 기기는 PC의 LAN IP나 접근 가능한 서버 도메인을 사용해야 합니다. Expo 기본 포트도 8081이므로 개발 서버는 8082를 권장합니다. 웹 연결에는 백엔드 CORS 허용이 필요합니다.

기본값은 실제 API 모드입니다. 백엔드가 실행되지 않았으면 연결 오류가 표시되며 목업 성공으로 전환하지 않습니다. 환경 변수 변경 후 Expo를 재시작하세요.

## 서버 없이 QA

`.env`에서 `EXPO_PUBLIC_USE_MSW=true`로 설정하면 웹/네이티브 MSW를 사용합니다. 로그인 화면의 `QA 모드로 바로 둘러보기`로 진입하세요. 이 모드에서만 모의 GPS 좌표와 QA 시나리오를 제공합니다. 미션 추천 → 출발 → 도착 인증 → 설문 → 보상 및 중단을 서버 없이 확인할 수 있습니다. 목업 상태는 프로세스 재시작/웹 새로고침 시 초기화됩니다.

## 검증

```bash
bun run api:types
bun test
bun run typecheck
bun run lint
bunx expo export --platform all
```

명세에 없는 기록 조회·프로필 수정·지도 저장·인사이트 등은 실제 모드에서 준비 중으로 표시합니다. 카카오 로그인 대신 명세의 이메일 로그인/회원가입을 사용합니다. 지도는 목적지의 외부 지도 링크로 엽니다.

통합 범위와 명세의 `LocalTime` 직렬화 모호성은 [docs/architecture.md](docs/architecture.md)에 기록했습니다. 실제 백엔드 서버에 대한 통합 테스트는 아직 수행하지 않았습니다.

## 스토어 빌드

```bash
bunx eas-cli@latest login
bun run build:ios
bun run build:android
```

Android 네이티브 빌드는 Gradle, iOS는 Xcode/EAS Build를 사용합니다.
