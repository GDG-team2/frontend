# 오하꼼 앱 구조

## 런타임

- Expo SDK 57 / React Native 0.86 / React 19 / TypeScript 6
- Bun 1.3.14 단일 패키지 매니저
- Expo Router 파일 기반 라우팅
- TanStack Query 서버 상태, Zustand 로컬 UX/QA 상태
- MSW 2 (`msw/native`, `msw/browser`) 백엔드 및 Kakao 인증 대체

## 통합 경계

- `src/services/kakao.ts`: Kakao 앱 키 감지와 로그인 어댑터 경계.
- `src/components/ui/MapPreview.tsx`: Kakao 지도 키가 없을 때 Figma 지도와 모의 좌표를 사용.
- `src/services/location.ts`: 실제 위치 권한 요청과 web QA 우회를 분리.
- `src/services/api.ts`: API base URL, MSW 시나리오 헤더, 오류 정규화.

## 실제 백엔드/Kakao 전환

1. `EXPO_PUBLIC_USE_MSW=false` 설정.
2. API base URL을 환경별 값으로 교체.
3. Kakao 네이티브 앱 키/JavaScript 키를 EAS 환경 변수로 등록.
4. Kakao 로그인 SDK 어댑터에서 access token을 받은 뒤 `/auth/kakao`로 전달.
5. `MapPreview`의 fallback을 Kakao 지도 native/web 구현으로 대체.

화면과 query key는 유지하므로 통합 시 UI 재작업은 필요하지 않다.
