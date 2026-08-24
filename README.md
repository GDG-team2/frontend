# 오하꼼

결정 피로를 줄여 오늘의 짧은 외출 미션 하나를 제안하는 iOS/Android Expo 앱입니다. Figma Pages/Components의 디자인 시스템을 기준으로 구현했고, 핵심 CTA·권한·랭킹 공개 흐름은 모바일 UX에 맞게 보완했습니다.

## 실행

```bash
bun install
bun start
bun ios
bun android
bun web
```

패키지 매니저는 Bun만 사용합니다. Android 네이티브 빌드는 Expo/React Native 구조상 Gradle/Android Gradle Plugin을 사용하고, JavaScript 번들은 Metro가 담당합니다. iOS는 Xcode 또는 EAS Build를 사용합니다.

## 백엔드/Kakao 없이 QA

- MSW가 native와 web 모두에서 목업 API를 가동합니다.
- 첫 화면의 `QA 모드로 바로 둘러보기`로 인증·온보딩을 건너뜁니다.
- 홈 우측 조절 아이콘 또는 설정의 `QA 시나리오`에서 정상/느림/오류/빈 상태를 바꿉니다.
- Kakao 키가 없을 때 로그인은 MSW, 지도는 Figma 지도 에셋과 모의 위치로 동작합니다.

자세한 결정은 `docs/ux-audit.md`, 통합 경계는 `docs/architecture.md`를 참고하세요.

## 검사

```bash
bun run typecheck
bun run lint
bun run doctor
bunx expo export --platform all
```

## 스토어 빌드

```bash
bunx eas-cli@latest login
bun run build:ios
bun run build:android
```

Android 네이티브 빌드는 Gradle/Android Gradle Plugin, iOS 빌드는 Xcode 사용. 앱 JavaScript 번들은 양쪽 모두 Metro 사용.

## 구조

- `src/app`: Expo Router 화면과 레이아웃
- `src/components/ui`: Figma 기반 디자인 시스템
- `src/mocks`: MSW handler와 현실적인 QA 데이터
- `src/services`: API, Kakao, 위치 통합 경계
- `docs`: UX 감사 및 통합 구조
