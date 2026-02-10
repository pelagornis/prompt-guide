# What Installs What — 기능별 추가 내용

어떤 기능(CLI·설정·프리셋·플랫폼)이 **무엇을 추가하고**, **나중에 처리할 때** 어떻게 바꾸면 되는지 정리한 문서입니다.  
**모든 프로젝트**(언어·프레임워크 무관)에서 동일한 구조로 사용할 수 있습니다.

**CLI 상세 사용법**은 [docs/CLI.md](CLI.md)를 참고하세요.

---

## 0. CLI 명령 요약

| 명령 | 설명 |
|------|------|
| `prompt-guide init` | 현재 디렉터리에 ai/, prompts/, docs/ 설치 및 플랫폼별 .gitignore 추가. `-p <platform>` 또는 대화형 선택. |
| `prompt-guide init --dry-run` | 실제 쓰기 없이 할 작업만 출력. |
| `prompt-guide doctor` | ai/, config, prompts/, docs/, .gitignore 존재·유효성 점검. |
| `prompt-guide doctor --fix` | .gitignore에 prompt-guide 블록이 없으면 자동으로 추가(또는 .gitignore 생성). |

---

## 1. 설치 시 추가되는 것 (CLI `init` 또는 수동 복사)

| 추가되는 경로 | 설명 | 누가 추가 |
|---------------|------|-----------|
| **ai/ai.config.yml** | 모델·컨텍스트·시스템 역할·태스크 프리셋·플랫폼·규칙 설정. **전체 동작의 기준.** | CLI init / 수동 복사 |
| **prompts/system.core.yml** | 기본 규칙 원문(YAML). 도구는 `prompt` 키를 주입. | CLI init / 수동 복사 |
| **prompts/review.yml** | 리뷰용 규칙 원문. `prompt` 키 사용. | CLI init / 수동 복사 |
| **prompts/rules.by-platform.yml** | 플랫폼별 추가 규칙(ios·android·flutter·web·server·common). `platforms.<이름>.prompt` | CLI init / 수동 복사 |
| **prompts/guide.template.yml** | 작업용 프롬프트 템플릿 필드 정의. | CLI init / 수동 복사 |
| **docs/system.core.md** | 기본 규칙 요약(사람 읽기용). | CLI init / 수동 복사 |
| **docs/review.md** | 리뷰 기준 요약. | CLI init / 수동 복사 |
| **docs/rules-by-platform.md** | 플랫폼별 규칙 요약. | CLI init / 수동 복사 |
| **.gitignore** (추가 블록) | 공통 + **선택한 플랫폼**에 맞는 ignore 패턴. | CLI init (플랫폼별로 다름) |

CLI로 설치 시 **플랫폼을 고르면** `ai.config.yml`의 `platform`이 설정되고, `.gitignore`에 해당 플랫폼용 패턴이 붙습니다.

---

## 2. ai.config.yml — 섹션별로 추가·제어하는 것

| 섹션 | 추가·제어 내용 | 나중에 바꿀 때 |
|------|----------------|----------------|
| **model** | 기본 모델·옵션 목록. | `model.default`, `model.options` 수정. 프리셋별로 쓰는 모델은 `task_presets.<이름>.model` 추가. |
| **context** | 어떤 경로를 컨텍스트로 넣을지(include)·제외할지(exclude), max_files·max_tokens. | 프로젝트 구조에 맞게 `include`/`exclude` 수정. |
| **system_role** | 시스템 역할(기본 품질·보안·에러 등)을 정의하는 파일. | 보통 유지. 바꾸려면 `system_role`이 가리키는 YAML의 `prompt` 수정. |
| **prompts** | default·review 등 이름별 프롬프트 파일. | 새 이름 추가하거나 경로 변경. |
| **task_presets** | 태스크별로 쓰는 프롬프트·추가 규칙·모델. | 새 프리셋 추가, 기존의 `prompt`/`rules_extra`/`model` 수정. |
| **platform** | 현재 플랫폼(ios|android|flutter|web|server). null이면 플랫폼 병합 안 함. | `platform: ios` 등으로 바꾸면 아래 플랫폼 설정이 적용됨. |
| **platforms** | 플랫폼별 context.include·rules_key(어떤 규칙 블록 쓸지). | `platforms.<id>.context.include`를 프로젝트 경로에 맞게 수정. |
| **rules** | 전역 규칙(no_auto_scan, strict, cite_sources 등). | 도구가 지원하면 여기서 켜고 끔. |

---

## 3. 프롬프트 파일 — 각각 추가하는 규칙

| 파일 | 추가하는 규칙(요약) | 언제 적용되는지 |
|------|---------------------|------------------|
| **prompts/system.core.yml** | 역할·응답, 코드 품질, 보안, 에러·견고성, 문서·유지보수, 협업·체크. MUST/MUST NOT. | `system_role`·`prompts.default`·대부분 태스크 프리셋에서 사용. |
| **prompts/review.yml** | 리뷰 범위, 체크리스트(일관성·품질·보안·에러·호환), 출력 형식, 승인/수정 결론. | `prompts.review`·태스크 프리셋 `review`·`security_audit`에서 사용. |
| **prompts/rules.by-platform.yml** | 플랫폼별 추가 규칙(iOS·Android·Flutter·Web·Server·공통). | `platform`이 설정된 경우, 해당 `platforms.<id>.rules_key`에 해당하는 `prompt`가 시스템 역할 뒤에 병합됨. |
| **prompts/guide.template.yml** | 작업용 필드 정의(플랫폼·역할·맥락·작업·제약·출력). | 사람이 복사해 채워서 쓸 때. 도구가 자동 주입하는 건 아님. |

---

## 4. 태스크 프리셋 — 선택 시 추가되는 것

| 프리셋 | 사용하는 프롬프트 | 추가로 붙는 규칙(rules_extra) |
|--------|-------------------|-------------------------------|
| **default** | system.core.yml | 없음 (기본만) |
| **review** | review.yml | 없음 |
| **refactor** | system.core.yml | 동작 변경 금지·의미 유지, 작은 단위로 한 번에 한 변경. |
| **implement** | system.core.yml | 스펙/티켓만 구현, 테스트 또는 테스트 계획 추가. |
| **fix_bug** | system.core.yml | 원인 파악 후 최소 수정, 불필요한 리팩터 금지. |
| **security_audit** | review.yml | 비밀·입력 검증·인증 경계·로그 내 민감정보만 집중. |

프리셋을 바꾸면 **같은 프로젝트**에서도 “지금 이 작업만” 다른 규칙·프롬프트가 적용됩니다.

---

## 5. 플랫폼 — 선택 시 추가·병합되는 것

| 플랫폼 | 추가되는 context.include 예시 | 추가되는 규칙(규칙 파일) |
|--------|------------------------------|---------------------------|
| **ios** | ios/**, *.xcodeproj/**, Shared/**, src/** | rules.by-platform → platforms.ios.prompt (Swift·UI·Keychain 등) |
| **android** | android/**, app/**, lib/**, src/** | platforms.android.prompt (Kotlin·a11y·Keystore 등) |
| **flutter** | lib/**, ios/**, android/**, test/**, pubspec.yaml | platforms.flutter.prompt (Dart·Semantics·시크릿 등) |
| **web** | src/**, public/**, app/**, *.config.js 등 | platforms.web.prompt (a11y·XSS·CORS 등) |
| **server** | src/**, lib/**, app/**, internal/**, cmd/** | platforms.server.prompt (API·시크릿·입력 검증 등) |

`platform: null`이면 위 플랫폼 병합이 적용되지 않고, **context**는 `ai.config.yml` 최상단 `context`만 사용됩니다.

---

## 6. 나중에 처리할 때 — 시나리오별로 바꾸는 것

| 하고 싶은 일 | 바꾸면 되는 것 |
|--------------|----------------|
| **다른 플랫폼으로 전환** | `ai.config.yml`에서 `platform` 값을 변경. 필요하면 `platforms.<id>.context.include`를 해당 프로젝트 경로에 맞게 수정. |
| **리뷰만 엄하게** | 리뷰 시 `task_presets.review` 사용(이미 연결됨). 더 세게 하려면 `prompts/review.yml`의 `prompt` 내용 수정. |
| **컨텍스트 범위 조정** | `context.include`/`context.exclude`를 프로젝트 구조에 맞게 수정. 플랫폼 쓰면 `platforms.<id>.context.include`도 수정. |
| **모델만 바꾸기** | `model.default` 변경. 특정 태스크만 다른 모델 쓰려면 `task_presets.<이름>.model` 추가. |
| **새 태스크(에이전트) 추가** | `task_presets`에 새 이름으로 `description`, `prompt`, 필요 시 `rules_extra`·`model` 추가. |
| **프로젝트 전용 규칙 추가** | `prompts/system.core.yml`의 `prompt`에 문단 추가하거나, 새 YAML 파일 만들고 `system_role`/`prompts`에서 참조. |

---

## 7. 모든 프로젝트에서 쓰는 방법

- **설치**: CLI 전역 설치 후 `prompt-guide init` 또는 수동으로 `ai/`, `prompts/`, `docs/` 복사. 설치 후 `prompt-guide doctor`로 상태 점검, `.gitignore`만 빠졌다면 `prompt-guide doctor --fix`로 보정.
- **공통**: `ai.config.yml` + `prompts/system.core.yml` + `prompts/review.yml` + `prompts/rules.by-platform.yml` 구조는 **언어·프레임워크 무관**으로 동일.
- **프로젝트별로만 바꾸는 것**: `context.include`/`exclude`, `platform`, `platforms.<id>.context.include`, 필요 시 `model.default`·프리셋.
- **문서**: 규칙 내용은 `docs/system.core.md`, `docs/review.md`, `docs/rules-by-platform.md`에서 확인. CLI 사용법은 `docs/CLI.md`. YAML은 도구가, MD는 사람이 읽는 용도.

이 문서는 **룰·문서 설치 후**, “어떤 기능이 뭘 추가했는지”와 “나중에 뭘 바꾸면 되는지”를 한 곳에서 보려고 쓴 것입니다.
