
# 오하꼼 React Native Expo 앱 — Native Capability Layer 구현 지시서

## 0. 현재 프로젝트 상황

현재 프로젝트는 다음 상태다.

- React Native + Expo 기반 앱이다.
- Figma에 설계된 오하꼼 UI를 기반으로 목업 화면과 주요 UI가 이미 구현되어 있다.
- 현재 개발자가 Expo Go 및 Android Emulator / iOS Simulator를 사용해 직접 테스트 중이다.
- 아직 실제 위치 인증, 백그라운드 처리, Live Activity, Android Live Update 등 네이티브 기능은 구현되지 않았다.
- 오하꼼은 Health/Fitness 앱이 아니다.
- 제품 성격은 “현실 장소를 포함하는 미션형 Todo/행동 실행 앱”이다.
- 사용자에게 운동량이나 건강 상태를 측정·판단하는 것이 목적이 아니다.

기존 UI와 디자인 시스템을 재설계하지 말고, 현재 화면에 네이티브 실행 기능을 연결하라.

---

# 1. 핵심 목표

다음 실행 루프를 실제 OS 기능까지 연결한다.

미션 선택
→ 출발 시간 확정
→ 출발
→ 진행 상태를 OS 표면에 표시
→ 목적지 진입 감지
→ 사용자 완료 확인
→ 네이티브 상태 정리
→ 기록 저장

핵심 구현 대상은 다음과 같다.

1. Expo Development Build 환경 구축
2. 플랫폼 독립적인 Native Capability 인터페이스
3. 위치 권한 및 목적지 Geofence
4. 출발 알림과 완료 후보 알림
5. iOS Live Activity / Dynamic Island
6. Android Live Update / ongoing notification
7. 딥링크
8. 미션 상태 영속화 및 앱 재실행 복구
9. 햅틱
10. 지연 가능한 백그라운드 동기화

다음 기능은 이번 범위에서 제외한다.

- HealthKit
- Health Connect
- 걸음 수 건강 분석
- 심박수
- 칼로리
- 운동 세션
- iOS Control Center Control
- Android Quick Settings Tile
- 서버 APNs 기반 Live Activity 원격 갱신

위 제외 기능을 임의로 추가하지 마라.

---

# 2. 구현 전 프로젝트 감사

먼저 코드를 수정하기 전에 아래를 조사하고 결과를 출력하라.

- 현재 Expo SDK 버전
- React Native 버전
- package manager
- Expo Router 사용 여부
- 현재 상태 관리 라이브러리
- 현재 persistence 방식
- app.json / app.config.ts 구조
- ios 및 android 디렉터리 존재 여부와 Git 추적 여부
- 현재 bundleIdentifier / applicationId
- 현재 deploymentTarget / minSdk / compileSdk / targetSdk
- 이미 설치된 Expo native package
- 현재 Expo SDK에서 expo-widgets를 지원하는지
- expo-doctor 결과

반드시 실행:

- 현재 package manager에 맞는 dependency 점검
- npx expo-doctor
- npx expo config --type public

현재 SDK가 expo-widgets를 지원하지 않는 경우:

- 전체 작업을 중단하지 마라.
- Location, Notifications, Haptics, Android native module, capability abstraction부터 구현한다.
- iOS Live Activity는 feature flag 뒤에 비활성 상태로 두고 필요한 Expo SDK 업그레이드 범위를 보고한다.
- Expo SDK를 조용히 강제 업그레이드하지 마라.
- 업그레이드가 필요하면 별도 변경 단위로 분리하고 기존 UI가 유지되는지 먼저 검증한다.

---

# 3. Expo Go와 Development Build 전략

Expo Go는 계속 UI 확인용 fallback으로 사용할 수 있어야 한다.

그러나 다음 기능은 Development Build에서만 활성화한다.

- Background location
- Geofencing
- iOS Live Activity
- Android custom Live Update module
- Background Task의 실제 실행
- 네이티브 manifest / entitlement 설정

필요한 패키지는 현재 Expo SDK와 호환되는 버전으로 `npx expo install`을 사용해 설치하라.

예상 패키지:

- expo-dev-client
- expo-location
- expo-task-manager
- expo-notifications
- expo-haptics
- expo-background-task
- expo-constants
- expo-widgets
- @expo/ui

이미 설치된 패키지는 중복 설치하지 마라.

Development Build 명령을 package.json scripts에 정리하라.

예시:

- dev: `expo start --dev-client`
- ios: `expo run:ios`
- android: `expo run:android`
- doctor: `expo-doctor`

개발자가 다음 흐름으로 테스트할 수 있게 하라.

1. npx expo run:ios
2. npx expo run:android
3. npx expo start --dev-client

CNG를 사용 중이면 native 프로젝트를 직접 임시 수정하는 대신 config plugin 또는 local Expo module을 우선 사용하라.

`npx expo prebuild --clean`은 생성물이 config plugin으로 완전히 재현 가능한 상태가 되기 전에는 실행하지 마라.

Expo Go에서 native-only 기능을 호출했을 때 앱이 죽어서는 안 된다.

Expo Go 환경에서는 다음처럼 동작해야 한다.

- UI 정상 작동
- 네이티브 capability의 `isSupported()`가 false 반환
- Live Activity / Live Update는 no-op
- Geofence 대신 수동 완료 제공
- 개발 모드에서만 native 기능이 비활성이라는 로그 출력
- 사용자 화면에는 불필요한 오류 노출 금지

native-only package를 app root에서 무조건 static import하여 Expo Go 실행을 깨뜨리지 마라.
플랫폼 adapter 내부에서 lazy import하고 실패를 capability unavailable로 처리하라.

---

# 4. 미션 상태 모델

네이티브 기능을 각 화면에서 직접 호출하지 마라.

먼저 단일 Mission state machine과 MissionCoordinator를 구현한다.

기본 타입은 다음 수준으로 구성하라.

```ts
export type MissionPhase =
  | 'accepted'
  | 'scheduled'
  | 'active'
  | 'arrivalCandidate'
  | 'completed'
  | 'cancelled'
  | 'expired';

export interface Mission {
  id: string;
  title: string;
  destinationName: string;

  destination: {
    latitude: number;
    longitude: number;
  };

  geofenceRadiusM: number;

  scheduledStartAt?: string;
  startedAt?: string;
  arrivalCandidateAt?: string;
  completedAt?: string;
  cancelledAt?: string;

  etaAt?: string;
  remainingDistanceM?: number;
  progress?: number;

  automaticArrivalDetectionEnabled: boolean;
  phase: MissionPhase;
}
````

다음 이벤트를 정의하라.

* ACCEPT_MISSION
* SCHEDULE_DEPARTURE
* START_MISSION
* UPDATE_PROGRESS
* ENTER_DESTINATION_GEOFENCE
* CONFIRM_ARRIVAL
* COMPLETE_MISSION
* CANCEL_MISSION
* EXPIRE_MISSION
* RESTORE_MISSION

모든 transition은 idempotent해야 한다.

예:

* 이미 active인 미션에 START_MISSION이 다시 들어와도 Live Activity가 중복 생성되면 안 된다.
* 완료된 미션에 geofence enter 이벤트가 늦게 들어와도 상태가 되돌아가면 안 된다.
* 앱 재시작 후 동일한 native notification이 중복 생성되면 안 된다.

MissionCoordinator만 아래 side effect를 호출하게 하라.

* persistence
* native live surface
* geofence
* local notification
* haptic
* analytics/event log

React component에서 직접 `Location.startGeofencingAsync`, Live Activity start, native notification start를 호출하지 마라.

---

# 5. Native Capability 인터페이스

다음 구조와 비슷하게 플랫폼 API를 추상화하라.

```ts
export interface MissionLivePayload {
  missionId: string;
  title: string;
  destinationName: string;
  phase: MissionPhase;
  scheduledStartAt?: string;
  startedAt?: string;
  etaAt?: string;
  remainingDistanceM?: number;
  progress?: number;
}

export interface MissionLiveCapability {
  isSupported(): Promise<boolean>;

  start(
    payload: MissionLivePayload
  ): Promise<{ nativeId?: string }>;

  update(payload: MissionLivePayload): Promise<void>;

  end(input: {
    missionId: string;
    result: 'completed' | 'cancelled' | 'expired';
    finalPayload?: MissionLivePayload;
  }): Promise<void>;

  recover(): Promise<
    Array<{
      missionId: string;
      nativeId?: string;
    }>
  >;
}

export interface MissionArrivalCapability {
  isSupported(): Promise<boolean>;
  requestPermissions(): Promise<{
    foreground: boolean;
    background: boolean;
  }>;
  arm(mission: Mission): Promise<void>;
  disarm(missionId: string): Promise<void>;
  recover(): Promise<string[]>;
}

export interface MissionReminderCapability {
  requestPermission(): Promise<boolean>;
  scheduleDepartureReminder(mission: Mission): Promise<string | null>;
  notifyArrivalCandidate(mission: Mission): Promise<void>;
  cancelMissionNotifications(missionId: string): Promise<void>;
}
```

권장 디렉터리:

```text
src/
  features/
    mission/
      domain/
        mission.types.ts
        mission.reducer.ts
        mission.events.ts
      application/
        MissionCoordinator.ts
      store/
        missionStore.ts

  native/
    capabilities/
      contracts.ts
      index.ts
      noop/
        MissionLive.noop.ts
        MissionArrival.noop.ts
      ios/
        MissionLive.ios.ts
      android/
        MissionLive.android.ts
      shared/
        MissionArrival.expo.ts
        MissionReminder.expo.ts
        MissionHaptics.expo.ts

  background/
    tasks.ts

  live-activities/
    MissionLiveActivity.tsx

modules/
  ohakom-mission-live/
    android/
    src/
```

기존 프로젝트 구조가 명확히 다르면 해당 convention에 맞게 조정하되, UI와 native side effect가 분리되는 원칙은 유지하라.

---

# 6. 권한 UX 전략

앱 최초 실행 시 위치·알림·백그라운드 권한을 한꺼번에 요구하지 마라.

## Foreground Location

다음 시점에만 요청한다.

* 사용자가 현재 위치 기반 미션 추천을 명시적으로 요청할 때

사용 목적 문구:

* 현재 위치 주변의 장소를 찾기 위해 사용
* 전체 이동 경로를 저장하지 않음

## Notification

다음 시점에 요청한다.

* 사용자가 첫 출발 시간을 설정할 때
* 또는 알림 설정을 직접 켤 때

## Background Location

다음 시점에만 요청한다.

* 사용자가 미션 출발을 누름
* 자동 도착 감지 기능이 활성화되어 있음
* foreground 권한이 이미 허용됨

권한 요청 직전 앱 내부 설명 화면을 표시한다.

설명:

* 목적지 도착을 자동으로 확인하기 위해 필요
* 미션이 진행 중일 때 목적지 주변 진입 여부만 확인
* 전체 이동 경로는 기본 저장하지 않음
* 권한을 거부해도 수동 완료 가능

권한을 거부한 경우에도 앱 핵심 루프는 사용 가능해야 한다.

fallback:

* 미션 진행 UI 유지
* 사용자가 “도착했어요” 버튼으로 수동 완료
* Live Activity / notification은 가능한 범위에서 유지
* 설정 앱으로 이동하는 버튼 제공
* 권한 거부를 실패나 패널티로 취급하지 않음

---

# 7. 위치와 Geofence

`expo-location`과 `expo-task-manager`를 우선 사용한다.

TaskManager task 정의는 React component 내부가 아니라 JS bundle의 top-level module에서 수행하라.

한 번에 활성 미션은 하나만 지원해도 된다.

미션이 active가 될 때:

1. 기존 등록 geofence 정리
2. 목적지 중심 geofence 하나 등록
3. geofence identifier에 missionId 포함
4. radius 기본값 120m
5. 장소 특성과 위치 정확도에 따라 80~150m 범위 허용
6. 앱 상태에 미션과 geofence 등록 상태 저장

Geofence ENTER 이벤트가 들어왔다고 바로 미션을 자동 완료하지 마라.

처리:

1. ENTER 이벤트 수신
2. 현재 미션과 identifier 비교
3. phase가 active인지 확인
4. `arrivalCandidate`로 전환
5. `arrivalCandidateAt` 저장
6. 가능하면 one-shot current position으로 목적지와 거리 재확인
7. Live Activity / Live Update를 “도착 확인 중”으로 업데이트
8. “목적지 근처에 도착했어요” local notification 표시
9. 사용자가 최종 완료 확인

이 앱은 부정행위 방지 게임이 아니다.

따라서 GPS가 흔들리는 경우:

* 자동 실패 처리 금지
* 사용자의 완료 기록 삭제 금지
* 수동 완료 또는 재확인 제공
* 앱 내 문구는 “GPS 확인이 어려워요” 수준으로 작성

미션 완료·취소·만료 시 반드시:

* geofence 제거
* pending location state 제거
* 관련 notification 제거
* native live surface 종료

연속 background GPS tracking은 구현하지 마라.

Foreground journey 화면에서 현재 위치가 필요할 때만 적절히 갱신한다.
Background에서는 geofence를 기본 수단으로 사용한다.

전체 route points를 서버나 로컬에 축적하지 마라.
기록에는 필요하다면 아래만 저장한다.

* 미션 시작 시간
* 목적지
* 완료 시간
* 대략적 거리
* 완료 방식: geofence-confirmed / manual

---

# 8. 출발 알림과 딥링크

`expo-notifications`를 사용해 일반 알림을 구현한다.

필요 알림:

1. 출발 예정 알림
2. 출발 시간 알림
3. 목적지 근처 도착 후보 알림
4. 미션 만료 또는 정리 알림은 기본 비활성

한 미션당 출발 알림을 과도하게 생성하지 마라.

기본값:

* 출발 5분 전 알림 1회
* 사용자가 설정하면 정시 알림 추가

Android channel:

* `mission-reminders`
* 일반 중요도
* 소리와 진동은 사용자 설정 존중

Live Update용 channel은 별도:

* `mission-live`
* importance MIN 금지
* ongoing activity 전용

Expo Router를 사용한다면 앱 scheme을 `ohakom`으로 설정한다.

딥링크 형식:

```text
ohakom://missions/{missionId}
```

다음 모든 표면이 해당 딥링크를 사용해야 한다.

* local notification tap
* iOS Live Activity tap
* Android Live Update tap

앱이 종료된 상태, background 상태, foreground 상태에서 모두 동일한 미션 상세 화면으로 연결되는지 테스트하라.

---

# 9. iOS Live Activity / Dynamic Island

현재 Expo SDK가 지원한다면 `expo-widgets`를 우선 사용한다.

커스텀 Swift ActivityKit module을 먼저 만들지 마라.

Live Activity는 추천만 받은 상태에는 표시하지 않는다.

시작 조건:

* 사용자가 실제로 “출발”을 누름
* mission phase가 active로 변경됨

종료 조건:

* completed
* cancelled
* expired

Live Activity props:

```ts
type OhakomLiveActivityProps = {
  missionId: string;
  title: string;
  destinationName: string;
  phase:
    | 'active'
    | 'arrivalCandidate'
    | 'completed'
    | 'cancelled';

  etaAt?: string;
  remainingDistanceM?: number;
  progress?: number;
};
```

Live Activity UI에는 위도·경도를 표시하거나 전달하지 마라.

표현할 내용:

## Lock Screen banner

* 미션 제목
* 목적지명
* ETA 또는 남은 거리
* 진행률
* 현재 상태

## Dynamic Island compact

* leading: 목적지 또는 미션을 나타내는 단순 아이콘
* trailing: ETA 또는 남은 시간

## Dynamic Island minimal

* 단순 진행 아이콘 또는 남은 시간

## expanded

* 미션 제목
* 목적지
* 진행률
* 남은 거리
* ETA

현재 오하꼼에 별도 로고를 강제로 추가하지 마라.
시스템 아이콘 또는 기존 디자인 시스템의 단순 아이콘을 사용하라.

Live Activity component는 props만으로 렌더링되게 하고:

* React hook 사용 금지
* 비동기 API 호출 금지
* 전역 JS 앱 상태 직접 참조 금지

`start`, `update`, `end`, `getInstances`를 감싼 iOS adapter를 구현한다.

앱 재실행 시:

1. 현재 persisted active mission 확인
2. Live Activity getInstances로 활성 인스턴스 확인
3. 동일 mission이면 연결 복구
4. 앱에는 미션이 없는데 Live Activity만 남아 있으면 종료
5. 미션은 active인데 인스턴스가 없으면 필요 시 새로 시작

Live Activity는 매초 JS에서 갱신하지 마라.

ETA countdown은 timestamp 기반 시스템 표현을 사용하고, 업데이트는 다음 이벤트에서만 한다.

* 미션 시작
* foreground 이동 정보가 유의미하게 변경
* ETA가 크게 변경
* geofence 진입
* 완료/취소

최소 throttle 기준:

* 30초 이내 반복 update 금지
* 또는 거리 변화 100m 미만이면 update 생략
* phase 변경은 즉시 반영

---

# 10. Android Live Update / Progress notification

먼저 설치된 `expo-notifications`가 현재 SDK에서 ProgressStyle / promoted ongoing Live Update를 공식 지원하는지 실제 타입과 문서로 확인하라.

지원하지 않으면 local Expo Module을 생성한다.

예:

```bash
npx create-expo-module@latest --local
```

모듈 이름 예시:

```text
ohakom-mission-live
```

TypeScript API:

```ts
export interface AndroidMissionLiveModule {
  isSupported(): Promise<boolean>;
  canPromote(): Promise<boolean>;

  start(payload: MissionLivePayload): Promise<{
    notificationId: number;
    promoted: boolean;
  }>;

  update(payload: MissionLivePayload): Promise<void>;

  end(
    missionId: string,
    result: 'completed' | 'cancelled' | 'expired'
  ): Promise<void>;

  getActive(): Promise<
    Array<{
      missionId: string;
      notificationId: number;
    }>
  >;

  openLiveUpdateSettings(): Promise<void>;
}
```

구현 원칙:

* NotificationCompat 또는 현재 공식 Android API 사용
* API level과 compileSdk를 확인하고 runtime gating
* 지원 버전에서는 ProgressStyle 사용
* 지원되지 않는 버전에서는 standard ongoing notification fallback
* 사용자 설정상 promoted notification이 비활성인 경우 standard ongoing notification fallback
* fallback도 실패로 처리하지 않음

Live Update 승격 조건을 준수하라.

* manifest에 POST_PROMOTED_NOTIFICATIONS 구성
* promoted ongoing 요청
* setOngoing(true)
* contentTitle 필수
* custom RemoteViews 사용 금지
* group summary 사용 금지
* colorized notification 사용 금지
* channel importance MIN 사용 금지
* canPostPromotedNotifications 확인
* 사용자가 설정을 변경할 수 있는 settings intent 제공

Live Update 시작 조건:

* 사용자가 “출발”을 누른 active mission

추천·예정·광고·일반 알림에는 Live Update를 사용하지 마라.

표시 내용:

* 미션 제목
* 목적지명
* progress
* 남은 거리 또는 ETA
* 상태바 chip에는 가능한 경우 짧은 ETA
* content intent는 `ohakom://missions/{id}`

Android notification ID는 missionId로부터 안정적으로 생성하고 앱 재시작 후 동일하게 복구할 수 있어야 한다.

native module의 SharedPreferences 등에 최소 상태를 저장해도 되지만 앱의 domain state와 충돌하지 않게 하라.

JS persisted state가 source of truth이고, native persistence는 활성 notification 복구용 mirror로만 사용한다.

이번 버전에서는 notification 내 커스텀 복잡한 action을 과도하게 넣지 마라.

최소:

* notification tap → 미션 상세 열기

추후 확장을 위한 구조만 마련:

* 잠깐 멈춤
* 미션 종료
* 도착 확인

---

# 11. 진행률 계산

Background에서 지속적인 위치 tracking을 하지 않으므로 진행률을 가짜로 생성하지 마라.

progress source 우선순위:

1. foreground journey 화면에서 route provider가 제공하는 남은 거리
2. 현재 위치와 목적지 사이의 실제 거리
3. 진행률을 알 수 없으면 indeterminate 상태

```ts
progress =
  totalDistanceM > 0
    ? clamp(1 - remainingDistanceM / totalDistanceM, 0, 1)
    : undefined;
```

앱이 background일 때 정확한 진행률을 계속 갱신할 수 없다면 마지막 확인값을 유지하고, “이동 중” 상태만 표시하라.

매초 감소하는 가짜 거리나 가짜 progress를 만들지 마라.

ETA는 가능하면 절대 timestamp로 저장한다.

```ts
etaAt: ISODateString
```

UI와 시스템 surface에서는 이 timestamp를 기준으로 표시한다.

---

# 12. Haptics

`expo-haptics`를 사용한다.

남발하지 마라.

기본 mapping:

* 미션 카드 선택: selection
* 미션 수락: light impact
* 출발: medium impact
* 목적지 근처 도착 후보: light notification
* 완료: success notification
* 취소: 별도 강한 경고 없음
* GPS 오류: warning은 사용자가 직접 재확인을 눌렀을 때만

스크롤, progress update, 위치 갱신마다 햅틱을 실행하지 마라.

---

# 13. Background Task

`expo-background-task`는 다음에만 사용한다.

* 전송하지 못한 미션 이벤트 동기화
* 오래된 pending native state 정리
* stale mission cleanup
* 로컬 기록 서버 동기화

다음 용도로 사용하지 마라.

* 초 단위 countdown
* 실시간 위치 tracking
* 정확한 출발 알림
* Live Activity의 반복 갱신
* Geofence polling

정확한 시간 알림은 local notification을 사용한다.
도착 감지는 geofence를 사용한다.
진행 표시는 native live surface를 사용한다.

Background Task는 실행 시점이 OS에 의해 지연될 수 있다는 전제로 구현하라.

---

# 14. Persistence와 복구

기존 persistence가 있으면 그대로 사용한다.

상태 관리가 Zustand라면 현재 store와 persistence middleware를 유지한다.
native 기능 때문에 새로운 대형 DB를 무조건 도입하지 마라.

persist 대상:

* current active mission
* mission phase
* scheduled notification IDs
* live native ID 또는 notification ID
* geofence armed 여부
* 마지막 native sync 시간
* 마지막 native payload hash

앱 시작 시 `reconcileNativeMissionState()`를 실행한다.

순서:

1. persisted current mission 로드
2. registered TaskManager task 확인
3. registered geofence 확인
4. iOS Live Activity instances 또는 Android active notification 확인
5. 서로 맞지 않는 stale native state 제거
6. active mission이면 필요한 native state 복구
7. completed/cancelled mission이면 모든 native state 정리

로그아웃·계정 삭제 시:

* geofence 제거
* 모든 mission notification 제거
* Live Activity 종료
* Android ongoing notification 종료
* local active mission state 삭제

---

# 15. UI 연결

기존 Figma 기반 UI를 유지한다.

아래 액션에만 coordinator를 연결하라.

## 미션 제안 화면

“이걸로 갈래”

* ACCEPT_MISSION
* 상태 저장
* 아직 Live Activity 시작 금지

## 출발 약속 화면

“이 시간으로 약속하기”

* SCHEDULE_DEPARTURE
* notification permission 필요 시 요청
* 출발 reminder 예약

## 이동 시작

“출발” 또는 “계속 가기”

* START_MISSION
* 자동 도착 감지 설정 확인
* 필요 시 background location 권한 요청
* geofence arm
* Live Activity / Android Live Update start
* haptic

## 목적지 진입

* ENTER_DESTINATION_GEOFENCE
* arrivalCandidate UI
* “도착했나요?” 안내
* 사용자가 완료 확인

## 완료 화면

“기록 완료”

* COMPLETE_MISSION
* live surface end
* geofence disarm
* notification cleanup
* haptic success
* 기록 저장

## 중도 종료

* CANCEL_MISSION
* 패널티 없음
* native cleanup
* 취소 이유 저장은 선택

---

# 16. Feature Flag

native 기능을 각각 독립적으로 끌 수 있게 하라.

예:

```ts
export const nativeFeatureFlags = {
  geofence: true,
  iosLiveActivity: true,
  androidLiveUpdate: true,
  missionNotifications: true,
  haptics: true,
  backgroundSync: true,
};
```

환경 변수 또는 app config extra를 사용할 수 있다.

한 capability가 실패해도 다른 capability까지 실패하면 안 된다.

예:

* Live Activity 실패 → in-app UI와 geofence는 계속 작동
* Geofence 권한 거부 → Live Activity와 수동 완료는 계속 작동
* Notification 권한 거부 → mission 자체는 계속 작동
* promoted Live Update 불가 → standard ongoing notification 사용

---

# 17. 테스트 전략

## Expo Go

확인:

* 앱 시작 정상
* 기존 모든 UI 정상
* native-only import crash 없음
* capability false / no-op
* 수동 완료 가능

## iOS Simulator

확인:

* Development Build 실행
* local notification
* deep link
* 위치 시뮬레이션
* Live Activity start/update/end
* 지원되는 Simulator 기기에서 Dynamic Island 레이아웃 확인
* 앱 재실행 후 getInstances 복구

## 실제 iPhone

확인:

* foreground location permission
* background location permission
* 앱 background 상태 geofence
* Live Activity 잠금화면
* Dynamic Island
* 앱 강제 종료 및 재실행 복구
* 권한 거부 fallback

## Android Emulator API 36 이상

확인:

* notification permission
* mission-live channel
* ProgressStyle
* promoted Live Update 가능 여부
* 상태바 chip
* lock screen
* 앱 재시작 후 notification 복구
* simulated location geofence
* deep link

## Android API 33~35

확인:

* Live Update 미지원 fallback
* standard ongoing notification
* completion 시 정상 제거
* 알림 권한 거부 fallback

## 공통 테스트

* 미션 start 연타 시 중복 native surface 없음
* 미션 complete 연타 시 오류 없음
* 완료 후 geofence 제거
* 취소 후 notification 제거
* 오래된 미션 복구 시 stale native UI 정리
* 미션 A 이후 미션 B 시작 시 A의 geofence/notification 제거
* 앱에 active mission 하나만 존재
* 12px 미만 텍스트 생성 금지
* 기존 Bottom Navigation 및 scroll layout 훼손 금지

Android 제조사별 background kill behavior는 완전히 보장할 수 없으므로 문서화하라.

---

# 18. 코드 품질 조건

* TypeScript strict 유지
* 신규 `any` 사용 금지
* UI component에서 native side effect 직접 실행 금지
* native 호출은 adapter와 coordinator로 제한
* native 기능은 availability check 후 호출
* 모든 cleanup 함수는 idempotent
* event handler에서 예외가 발생해도 mission domain state가 손상되지 않게 처리
* native error는 typed error로 변환
* 개인정보가 포함된 좌표를 일반 console log에 남기지 않음
* full route points 저장 금지
* 실시간 update를 위한 무제한 setInterval 금지
* 현재 디자인 토큰과 재사용 컴포넌트를 유지
* 새로운 로고나 마스코트 임의 추가 금지

---

# 19. 문서와 산출물

다음 파일을 작성하라.

```text
docs/NATIVE_CAPABILITIES.md
```

포함 내용:

* architecture
* feature matrix
* Expo Go vs Development Build 차이
* permission flow
* iOS Live Activity 구조
* Android Live Update 구조
* geofence lifecycle
* mission state transition
* debugging commands
* emulator/simulator 테스트법
* 실제 기기에서만 확인 가능한 기능
* known platform limitations
* feature flags
* cleanup/recovery 전략

최종 응답에는 다음을 보고하라.

1. 변경한 파일
2. 추가한 dependency
3. app config 변경
4. 추가한 native module
5. Expo Go에서 작동하는 부분
6. Development Build가 필요한 부분
7. iOS 테스트 결과
8. Android 테스트 결과
9. 실제 기기에서 추가 검증이 필요한 부분
10. 미완성 또는 SDK 버전으로 막힌 항목
11. 실행 명령
12. 다음 구현 우선순위

---

# 20. 최종 수용 조건

다음 조건을 모두 만족해야 작업 완료로 간주한다.

* 기존 Expo UI 앱이 그대로 실행됨
* Expo Go에서 앱이 crash하지 않음
* Development Build가 iOS와 Android에서 빌드됨
* mission state machine이 구현됨
* 출발 알림이 동작함
* 목적지 geofence가 등록·해제됨
* 권한 거부 시 수동 완료가 가능함
* iOS 지원 환경에서 Live Activity가 시작·갱신·종료됨
* Android 지원 환경에서 Live Update 또는 ProgressStyle이 동작함
* 미지원 Android에서는 ongoing notification fallback이 동작함
* 모든 system surface tap이 미션 상세 딥링크로 연결됨
* 완료·취소 시 모든 native 상태가 정리됨
* 앱 재실행 시 native state를 복구하거나 stale 상태를 제거함
* HealthKit/Health Connect를 추가하지 않음
* 연속 background GPS tracking을 추가하지 않음
* 전체 이동 경로를 저장하지 않음
* 기존 Figma 기반 레이아웃과 디자인 시스템을 훼손하지 않음

먼저 감사 결과와 단계별 구현 계획을 출력한 뒤 실제 구현을 진행하라.
단순 계획만 작성하고 끝내지 말고, 빌드 가능한 코드와 테스트 가능한 상태까지 완성하라.

[1]: https://docs.expo.dev/faq/ "https://docs.expo.dev/faq/"
