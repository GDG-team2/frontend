# 오하꼼 UI/UX 재감사

검증일: 2026-08-24

## 범위

- 홈 하단 내비게이션과 플로팅 CTA
- 문장 기반 미션 추천과 조건 선택
- 알림 목록과 상단 내비게이션 헤더
- 320×568, 390×844, 768×1024 반응형과 긴 상세 화면 스크롤

## 근거

- 홈 전후: `artifacts/qa/audit-compare-01-home.png`
- 추천 조건 전후: `artifacts/qa/audit-compare-02-chat-recommendation.png`
- 알림 전후: `artifacts/qa/audit-compare-03-notifications.png`
- 홈 최하단 인셋: `artifacts/qa/audit-final-01-home-bottom.png`
- 긴 상세 화면 sticky 헤더: `artifacts/qa/audit-after-04-sticky-header-long.png`
- 소형 홈: `artifacts/qa/audit-final-01-home-320x568-pass2.png`
- 소형 탭 라벨: `artifacts/qa/audit-after-tab-label-320.png`
- 소형 QA 1열 스택: `artifacts/qa/audit-after-qa-spacing-320.png`
- QA 초기화 CTA 간격: `artifacts/qa/audit-after-qa-reset-gap-320.png`

## 발견과 조치

1. 홈 — 개선 완료
   - 플로팅 탭바와 CTA가 두 겹의 하단 레이어를 만들고 콘텐츠를 가림.
   - 탭바를 72px 도킹 구조로 복구하고, 플로팅 CTA와 콘텐츠 끝 사이 26px, CTA와 탭바 사이 16px을 확보.
   - selected는 아이콘만 감싸던 라임 indicator 대신 아이콘과 라벨 전체를 감싸는 `surfaceSubtle` destination surface로 변경.

2. 추천 조건 — 개선 완료
   - 대화 입력 아래에 세 개의 필터 그룹이 길게 분산되어 문장 입력과 조건의 관계가 약함.
   - 입력 바로 아래에 `시간 / 분위기 / 활동` 카테고리 세그먼트를 배치하고, 현재 카테고리의 선택지만 노출하도록 변경.
   - 카테고리는 surface 상태, 실제 filter chip은 선택 상태를 유지해 역할을 분리.

3. 알림 — 개선 완료
   - 14px 헤더와 12px 본문, 카드별 그림자가 정보보다 장식을 강조.
   - 내비게이션 제목을 18px bold로 올리고, 알림 제목 16px·본문 14px로 보정.
   - 개별 shadow card를 하나의 grouped list와 hairline separator로 교체.

4. 헤더 정책 — 개선 완료
   - `TopBar`가 화면별로 스크롤과 함께 사라져 뒤로가기와 현재 위치가 불안정함.
   - 모든 상세 `TopBar`를 자동 sticky 처리. 루트 탭의 큰 맥락 헤더는 콘텐츠와 함께 스크롤되도록 유지.

5. 색과 elevation — 개선 완료
   - 라임 saturation은 직전 토큰에서 3%만 감소.
   - 일반 card, tonal card, secondary button, chip, tab bar의 무조건적인 shadow 제거.
   - elevation은 실제 overlay인 홈 플로팅 CTA와 지도 control 등에만 유지.

6. 타이포와 소형 화면 — 개선 완료
   - 앱 내부 font size를 역할별 `32 / 24 / 18 / 16 / 14 / 12px` 짝수 스케일로 통일하고 12px 미만을 제거.
   - 탭 라벨은 기본 navigator wrapper 대신 16px 고정 line box로 직접 렌더링해 baseline 잘림 제거.
   - 320px에서 QA scenario, 배지, 인사이트, 미션 지표를 1열로 전환하고 chip/metadata row는 wrap 허용.
   - QA 운영 화면 카드와 초기화 CTA 사이 32px section gap 확보.

## 접근성 확인 범위

- 탭과 카테고리 선택 상태가 접근성 트리에 노출되는 것을 확인.
- 모든 주요 터치 타깃은 최소 44px 유지.
- 11개 핵심 route를 320px에서 검사했고 문서 가로 overflow는 0건.
- 스크린샷과 web 접근성 트리로 확인했으며 VoiceOver/TalkBack, Dynamic Type 최대 크기는 실제 기기 추가 검증이 필요.

## 참고 기준

- Apple HIG Tab bars: https://developer.apple.com/design/human-interface-guidelines/tab-bars
- Apple HIG Toolbars: https://developer.apple.com/design/human-interface-guidelines/toolbars
- React Navigation Bottom Tabs: https://reactnavigation.org/docs/bottom-tab-navigator/
- Android Material 3 Navigation bar: https://developer.android.com/develop/ui/compose/components/navigation-bar
- Android Material 3 Chip: https://developer.android.com/develop/ui/compose/components/chip
