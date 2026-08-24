# 오하꼼 Design QA

검증일: 2026-08-24

## 근거

- Figma 원본: `artifacts/figma/core-board.png`, `auth-onboarding.png`, `detailed-journeys.png`, `account-community.png`, `operational-states.png`, `components.png`
- 구현 캡처: `artifacts/qa/login.png`, `audit-final-01-home.png`, `audit-after-02-chat-recommendation.png`, `audit-after-03-notifications.png`, `mission.png`, `commit.png`, `active.png`, `complete-pass2.png`, `map-pass3.png`, `profile.png`
- 동일 390×844 비교: `artifacts/qa/audit-compare-01-home.png`, `audit-compare-02-chat-recommendation.png`, `audit-compare-03-notifications.png`, `compare-mission.png`, `compare-complete-pass2.png`, `compare-map-pass3.png`, `compare-profile.png`
- 반응형 확인: 320×568 홈/미션/QA/탭, 390×844 핵심 여정, 768×1024 홈/마이 화면. 긴 상세 화면 sticky header와 홈 최하단 CTA inset 추가 확인.

## 상호작용

- QA 로그인 → 홈 → 미션 제안 → 출발 약속 → 위치 QA 우회 → 이동 → 도착 → 기록 저장 통과.
- Kakao 목업 로그인 → 약관 온보딩 진입 통과.
- 39개 정적 route export 및 전체 구현 route 전수 렌더 통과.
- MSW 정상, 1.2초 지연, 503 오류/재시도, 빈 상태 통과.
- cold start 브라우저 error/warn 0건.

## 해결한 발견

| 심각도 | 표면 | 발견 | 조치 |
|---|---|---|---|
| P1 | 홈 하단 구조 | 홈 CTA와 탭바가 콘텐츠를 이중으로 덮고 단절된 여백을 만듦 | CTA는 232–280px 중앙 플로팅 필로 유지하고 탭바는 72px 도킹으로 복구. 콘텐츠 끝–CTA 26px, CTA–탭바 16px로 조정 |
| P1 | 추천 조건 | 대화 입력과 category chip 그룹이 멀리 분산됨 | 입력 바로 아래 category segment를 두고 현재 category 선택지만 노출 |
| P1 | 레이아웃 | 긴 화면 CTA가 스크롤에 묻히거나 내용과 겹침 | 비탭 상세 화면에는 `Page` 도킹 action과 동적 높이, scroll padding 적용 |
| P1 | 지도 에셋 | Figma SVG가 높은 지도 프레임에서 좌우 crop되어 marker가 잘림 | 원본 SVG의 `preserveAspectRatio=none` 의도에 맞춰 fill 적용 |
| P1 | 완료 화면 | 저장 장소 카드가 고정 CTA 아래로 과도하게 가려짐 | 성공 halo와 섹션 간격을 줄여 첫 viewport에서 카드 전체 노출 |
| P2 | 디자인 토큰 | 선택 chip이 Figma의 검정 선택 상태 대신 라임으로 표시 | 검정 surface/흰 글자 선택 token으로 통일 |
| P2 | 공간 토큰 | 홈 바깥 수평 여백이 Figma 24px 그리드보다 좁음 | 전역 `screenPadding`을 24px로 복구하고 hero 내부 수평 여백은 20px로 정렬 |
| P2 | 색상 토큰 | 피드백 반영 과정에서 accent가 과도하게 회색화됨 | Figma DS hue/lightness로 복구하고 요청 범위인 saturation +6%만 적용 |
| P2 | 색상 토큰 | 최종 lime saturation 미세 보정 필요 | 직전 lime 계열 saturation에서 정확히 3% 감소, purple은 유지 |
| P2 | 내비게이션 상태 | selected 배경이 아이콘만 감싸고 primary 계열을 사용 | 아이콘+라벨 전체 destination에 `surfaceSubtle` 배경과 hairline 적용 |
| P2 | 탭 라벨 | navigator 기본 label wrapper가 11px 텍스트의 16px line-height를 10px로 잘라 표시 | 탭 전체를 직접 렌더링하고 12px/16px line box, 56px destination 높이로 고정 |
| P2 | 타이포 | 11/15/17/23/31px 등 역할이 섞인 홀수 font size 사용 | `32/24/18/16/14/12px` 짝수 role scale로 통일하고 최소 12px 보장 |
| P2 | 소형 화면 | QA 2열 카드와 일부 지표/배지 row가 320px에서 과밀 | 360px 미만 1열 stack, chip/metadata wrap, copy `minWidth: 0` 적용. 핵심 11 route 가로 overflow 0건 확인 |
| P2 | QA 간격 | 운영 화면 목록과 상태 초기화 CTA 사이 section gap 누락 | 32px gap 추가 |
| P2 | 헤더/알림 | 상세 헤더와 알림 텍스트가 작고 화면마다 스크롤 정책이 다름 | 모든 상세 `TopBar` sticky, 제목 18px, 알림 제목 16px·본문 14px 적용 |
| P2 | elevation | 일반 카드와 컨트롤에 shadow가 과도하게 반복됨 | 일반 surface는 border/tonal contrast로 구분하고 실제 overlay만 elevation 유지 |
| P2 | 콘텐츠 | 프로필 mock nickname이 원본과 불일치 | Figma의 `선우`로 정렬 |
| P2 | 지도 밀도 | QA 지도 marker 수가 내 지도 원본보다 적음 | 동일 icon family marker를 추가해 저장 장소 밀도 보완 |

## 최종 판정

P0/P1/P2 미해결 항목 없음. Figma 디자인 언어를 유지하면서 고정 CTA, 권한 시점, Kakao/MSW QA, 프라이버시 기본값을 개선했고 iOS/Android/web 번들을 검증함.

passed
