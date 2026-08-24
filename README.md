# 오하꼼

Bun, Expo SDK 57, React Native, TypeScript, Expo Router 기반 앱.

## 실행

```bash
bun install
bun start
```

개발 서버에서 `i`는 iOS, `a`는 Android, `w`는 웹 실행.

```bash
bun run ios
bun run android
```

## 검사

```bash
bun run typecheck
bun run lint
bun run doctor
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
- `src/components`: 공용 UI 컴포넌트
- `src/constants`: 디자인 토큰과 상수
- `assets`: Figma 이미지, 아이콘, 폰트

첫 화면은 임시 화면. Figma 디자인 URL 기준으로 화면, 컴포넌트, 토큰, 에셋 구현 예정.
