# 플랫폼별 추가 규칙 (사람 읽기용)

실제 주입용 문장은 **YAML**에 있습니다.  
→ `prompts/rules.by-platform.yml` (도구는 `platforms.<이름>.prompt` 사용)

- **언제 적용되는지**: `ai.config.yml`에서 `platform: ios`(또는 android, flutter, web, server)로 설정된 경우, 해당 플랫폼 블록이 시스템 역할 뒤에 병합됩니다. `platform: null`이면 이 규칙은 적용되지 않습니다.
- **포크 시**: 대상 플랫폼 블록만 사용. 여러 플랫폼을 쓰는 프로젝트면 블록을 병합해 사용할 수 있습니다.

---

## iOS (Swift / SwiftUI / UIKit)

- Swift 네이밍·들여쓰기·옵셔널·에러 처리는 프로젝트 스타일 가이드 준수. 의존성 Podfile·SPM·Carthage lock 유지. 임의 버전 변경 금지.
- UI 접근성(VoiceOver·Dynamic Type), 다크모드·다국어 반드시 고려. UI 업데이트는 **메인 스레드만**.
- 비밀은 코드·plist에 저장 금지. Keychain·env만 사용. 로그에 PII·토큰 포함 금지.

## Android (Kotlin / Java)

- Kotlin/Java 코딩 컨벤션·패키지 구조 준수. 의존성 Gradle·버전 카탈로그 일치. 임의 버전 변경 금지.
- a11y(contentDescription·TalkBack), 설정·다국어·테마 반드시 고려. UI 작업은 **Main dispatcher만**.
- 비밀은 코드·리소스에 저장 금지. Keystore·BuildConfig/환경변수만 사용. 로그·크래시 리포트에 PII 포함 금지.

## Flutter (Dart)

- effective_dart·프로젝트 분석 옵션 준수. 의존성 pubspec.lock·버전 범위 유지. 임의 변경 금지.
- 접근성(Semantics·라벨), 반응형·다국어 반드시 고려. 비동기는 async/await·Future. UI는 build 내 **동기만**.
- 비밀은 코드에 저장 금지. flutter_dotenv·--dart-define·네이티브 시크릿만 사용. 로그에 비밀·PII 포함 금지.

## Web (JS/TS · React/Vue/Svelte 등)

- 프로젝트 프레임워크·번들러·lint 규칙 준수. 의존성 package-lock·yarn.lock·pnpm-lock 유지. 임의 변경 금지.
- a11y(시맨틱·ARIA·키보드·포커스), 반응형·i18n 반드시 고려. CSR/SSR·hydration 일관 유지.
- 비밀은 클라이언트 코드·빌드 산출물에 포함 금지. env·빌드 시 주입만. XSS·CORS·CSP 고려. 로그·에러에 PII 포함 금지.

## Server (Node/Go/Rust/Java/Python 등)

- 프로젝트 컨벤션·디렉터리 구조 준수. 의존성 lockfile·go.sum·Cargo.lock·requirements.txt 등 유지. 임의 변경 금지.
- API 응답 형식 통일(예: `{ success, data?, error? }`). HTTP 2xx/4xx/5xx·타임아웃·rate limit 반드시 적용. 장시간 작업은 queue·백그라운드만.
- 비밀은 코드에 저장 금지. env·시크릿 매니저만 사용. 입력 검증·인증·권한 생략 금지. 로그에 비밀·PII 포함 금지.

## 공통 (모든 플랫폼)

- 공개 API/유틸에 **단위 테스트** 추가. 테스트명은 “조건→기대결과”. mock은 외부 의존성만.
- 커밋은 “동사+대상”. **1커밋=1논리변경**. PR에 이유·테스트 방법·breaking 여부 반드시 기재.
