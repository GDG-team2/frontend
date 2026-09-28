# API 연동 검증 (2026-09-28)

- `bun test`: 5개 테스트 통과, 986 assertions. `api.json`의 13개 연산 전체 메서드/경로/요청·응답 스키마 검사.
- `bun run typecheck`: 통과.
- `bun run lint`: 통과.
- `EXPO_PUBLIC_USE_MSW=false bunx expo export --platform all`: iOS, Android, Web 성공. MSW 패키지의 기존 exports 경로 경고가 있으나 번들링 성공.
- 브라우저 MSW QA: 로그인 → 프로필의 1,500P 확인 → 현재 미션 없음 → 좌표 기반 추천(역삼동 근린공원, 450m/10분/50P) → 출발 → 도착 인증 → 4점 설문 → 완료 결과 50P/보유 1,550P 확인.
- 브라우저 설정 QA: 전체 알림 끄기 → PATCH → 저장 완료 표시 확인.
- 실제 API 모드 브라우저: QA 로그인 버튼 없음, 서버 미실행 시 로그인 화면에 연결 오류 표시 확인.
- 완료 화면: `artifacts/qa/api-mission-complete.png`.

실행 중인 백엔드 없이 검증했습니다. 실제 서버 인증·데이터베이스·GPS·CORS 및 `LocalTime` 직렬화 형식은 실서버가 준비되면 확인해야 합니다.
