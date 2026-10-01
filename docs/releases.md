# 태그 기반 IPA·APK 배포

`v1.2.3` 태그를 push하면 GitHub Actions가 검사를 실행하고 EAS에서 Android APK와 iOS IPA를 빌드합니다. 둘 다 성공한 뒤 GitHub Release에 파일과 SHA-256 체크섬을 첨부해 공개합니다. `v1.2.3-rc.1`, `v1.2.3-beta.1`은 Pre-release가 됩니다.

## 최초 1회 설정

현재 저장소에는 Expo 프로젝트 ID와 GitHub `EXPO_TOKEN`이 없습니다. 아래 설정을 완료하기 전에는 서명된 앱을 만들 수 없습니다. 워크플로는 누락된 설정을 안내하고 빌드 전에 종료합니다.

### 1. Expo 프로젝트 연결

Expo 계정을 만들고 로컬 터미널에서 실행합니다. 조직 계정으로 관리할 앱이라면 프로젝트 생성 시 해당 조직을 선택하세요.

```bash
bunx eas-cli@24.8.0 login
bunx eas-cli@24.8.0 init
```

생성된 `app.json`의 `expo.extra.eas.projectId`를 커밋합니다. 기존 EAS 프로젝트를 연결하려면 `eas init --id <프로젝트 UUID>`를 사용합니다. 프로젝트 slug는 앱의 `ohakkom`과 일치해야 합니다.

프로젝트 ID를 코드에 두지 않을 경우 GitHub Repository variable `EAS_PROJECT_ID`를 설정할 수도 있습니다. CI는 이 값을 빌드용 `app.json`에 넣습니다. ID는 공개 식별자이고 인증 토큰은 아닙니다.

### 2. 서명과 최초 빌드

- Android: EAS의 안내에 따라 Android keystore를 생성하거나 기존 앱의 keystore를 연결합니다. 앱 ID는 `com.ohakkom.app`입니다.
- iOS: 유료 Apple Developer 계정, 배포 인증서, Ad Hoc provisioning profile이 필요합니다. 앱 ID는 `com.ohakkom.app`이며 설치할 기기를 먼저 등록합니다.

```bash
bunx eas-cli@24.8.0 device:create
bunx eas-cli@24.8.0 build --platform all --profile release
```

첫 빌드는 대화형으로 실행해 양쪽 플랫폼 모두 성공시킵니다. 인증서와 provisioning profile은 EAS가 보관하고 CI는 이를 재사용합니다. GitHub에 Apple ID 비밀번호나 인증서 파일을 넣을 필요는 없습니다.

Ad Hoc IPA는 프로비저닝에 포함된 기기에서만 설치됩니다. 새 기기를 추가하거나 인증서가 만료되면 `device:create` 후 `eas build --platform ios --profile release`를 대화형으로 실행하여 프로필을 갱신하세요. CI는 기기 목록을 자동으로 확장하지 않습니다. 공개 iOS 배포는 별도로 TestFlight/App Store가 필요합니다. [Expo 내부 배포 안내](https://docs.expo.dev/build/internal-distribution/)

### 3. GitHub Secret과 Variables

[Expo Access tokens](https://expo.dev/accounts)에서 토큰을 만들고 [저장소 Actions secrets](https://github.com/GDG-team2/frontend/settings/secrets/actions)에 **`EXPO_TOKEN`** 이름으로 저장합니다. 토큰은 프로젝트 빌드 권한이 있는 Expo 계정의 것이어야 합니다. CLI로 입력할 수도 있습니다.

```bash
gh secret set EXPO_TOKEN --repo GDG-team2/frontend
```

토큰은 위 명령의 입력 프롬프트에 붙여넣고, 코드·채팅·명령 인수로 기록하지 마세요. GitHub Release 업로드는 Actions가 제공하는 `GITHUB_TOKEN`을 사용하므로 별도의 GitHub PAT는 필요하지 않습니다.

다음 값은 [Repository variables](https://github.com/GDG-team2/frontend/settings/variables/actions)에 설정합니다.

| 이름                             | 용도 / 기본값                                                          |
| -------------------------------- | ---------------------------------------------------------------------- |
| `EAS_PROJECT_ID`                 | `app.json`에 프로젝트 ID를 커밋하지 않을 때만 필요                     |
| `EXPO_PUBLIC_API_BASE_URL`       | 선택. 기본값은 `https://ohakkom-backend.onrender.com/api/v1` 개발 서버 |
| `EXPO_PUBLIC_SERVICE_TERMS_URL`  | 서비스 약관 HTTPS URL                                                  |
| `EXPO_PUBLIC_PRIVACY_TERMS_URL`  | 개인정보 동의문 HTTPS URL                                              |
| `EXPO_PUBLIC_LOCATION_TERMS_URL` | 위치기반서비스 약관 HTTPS URL                                          |

약관 URL 3개가 없으면 기존 정책대로 실제 회원가입은 비활성화됩니다. 운영용 바이너리를 배포할 때는 운영 API 주소와 약관을 설정하세요. 공개 설정만 원격 빌드의 `eas.json`에 전달하며 MSW는 항상 꺼집니다. `EXPO_TOKEN`은 앱 설정/Release 산출물에 넣지 않습니다.

## 새 버전 배포

최초 설정 변경이 main에 반영된 뒤, 배포할 커밋에서 실행합니다.

```bash
git switch main
git pull --ff-only
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

테스트 배포는 `v1.0.1-rc.1` 같은 태그를 사용합니다. 앱의 사용자 표시 버전은 태그의 숫자 세 자리로 빌드되며, iOS build number와 Android version code는 EAS의 원격 버전 관리로 자동 증가합니다. 태그 이름 전체는 Release 제목과 파일명에 남습니다. 빌드용 버전 변경을 저장소에 다시 커밋하지 않습니다.

이미 존재하는 태그를 수동 실행하려면 Actions의 **Release IPA and APK → Run workflow**에 태그를 입력하거나 아래 명령을 사용합니다.

```bash
gh workflow run release.yml --repo GDG-team2/frontend --ref main -f tag=v1.0.0
```

결과 파일:

```text
ohakkom-v1.0.0.apk
ohakkom-v1.0.0.ipa
SHA256SUMS
release-manifest.json
```

`release-manifest.json`에는 태그, 소스 커밋, EAS 빌드 ID/버전과 체크섬이 들어갑니다. 서명된 다운로드 URL이나 인증 토큰은 포함하지 않습니다. 파일은 [GitHub Releases](https://github.com/GDG-team2/frontend/releases)에서 받습니다.

## 실패와 재실행

- PR/main CI 및 Release CI에서 테스트, 타입 검사, lint, 생성 API 타입 일치를 검사합니다.
- Release는 두 EAS 빌드가 끝날 때까지 기다립니다. APK/IPA의 프로젝트·커밋·버전·프로필·완료 상태와 ZIP 구조를 확인합니다.
- 어느 한쪽 빌드/다운로드/검증이라도 실패하면 Release를 공개하지 않습니다. 빌드 파일을 준비한 뒤 Draft를 만들고 첨부가 끝나야 공개합니다.
- 업로드가 중단되면 Draft가 남을 수 있습니다. 원인을 해결하고 같은 태그의 Actions를 재실행할 수 있습니다. 재실행은 두 빌드를 다시 수행하며 EAS 빌드 사용량이 발생합니다.
- 이미 공개된 Release의 바이너리는 덮어쓰지 않습니다. 수정은 새 태그로 배포하세요. 태그를 이동하거나 강제 push하지 마세요.
- 검증을 마친 파일은 Actions artifact에도 14일 보관합니다. 동일 태그 실행은 순차 처리하고 진행 중인 실행을 자동 취소하지 않습니다.
- EAS 무료 빌드 횟수/대기열과 GitHub Actions 실행 시간 한도가 적용됩니다. 180분 제한을 넘기면 실행은 실패하며 EAS 대시보드에서 원격 빌드 상태를 확인해야 합니다.

기존 `production` 프로필은 스토어 빌드용으로 유지합니다. 새 `release` 프로필은 Metro 없이 실행되는 내부 배포용 APK/Ad Hoc IPA이며 스토어 자동 제출을 하지 않습니다. [Expo CI 설정](https://docs.expo.dev/build/building-on-ci/), [버전 관리](https://docs.expo.dev/build-reference/app-versions/)

## 이번 변경 검증

태그 해석, 빌드 환경 전달, 다른 커밋/버전/프로젝트 및 실패한 빌드 거부, 파일 누락/변조 시 공개 차단을 자동 테스트합니다. Workflow는 actionlint로 검사하고 EAS CLI 24.8.0의 스키마로 두 플랫폼의 release 프로필을 확인했습니다. 실제 서명 빌드와 Release 게시 검증은 Expo/Apple 초기 설정 후 가능합니다.
