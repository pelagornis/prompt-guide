# CLI 사용 가이드

Prompt Guide CLI는 프로젝트에 `ai/`, `prompts/`, `docs/`를 설치하고 플랫폼별 `.gitignore`를 설정하는 도구입니다.  
설치 후 설정 상태를 점검하는 `doctor` 명령도 제공합니다.

---

## 목차

- [실행 방법](#실행-방법)
- [전역 옵션](#전역-옵션)
- [init — 프로젝트 초기화](#init--프로젝트-초기화)
- [doctor — 설정 점검 및 자동 수정](#doctor--설정-점검-및-자동-수정)
- [에러 및 종료 코드](#에러-및-종료-코드)

---

## 실행 방법

### 1. 전역 설치 후 실행 (권장)

한 번만 설치하면 어떤 디렉터리에서든 사용할 수 있습니다.

```bash
npm install -g prompt-guide-cli
prompt-guide              # 도움말 + 배너
prompt-guide init         # 대화형 초기화
prompt-guide init -p web  # web 플랫폼으로 초기화
prompt-guide doctor       # 설정 점검
```

프로젝트 `package.json`에 의존성을 추가하지 않아도 됩니다.

### 2. npx로 한 번만 실행

전역 설치 없이 최신 버전을 바로 실행할 때:

```bash
npx prompt-guide-cli init
npx prompt-guide-cli init --platform=ios
npx prompt-guide-cli doctor --fix
```

### 3. 이 레포에서 직접 실행 (개발/디버깅)

저장소 루트에서:

```bash
npm install    # 워크스페이스 의존성 설치
npm run build  # CLI 빌드 (cli/ 디렉터리)
npm run cli    # 도움말 출력 (node cli/bin/cli.js)
npm run init   # init 대화형 실행 (node cli/bin/cli.js init)
npm run cli -- init -p web        # 특정 플랫폼으로 init
npm run cli -- init --dry-run    # 실제 쓰기 없이 할 일만 표시
npm run cli -- doctor            # 점검
npm run cli -- doctor --fix      # .gitignore 자동 보정
npm run cli -- doctor -v         # 상세 출력
```

`--` 뒤에 오는 인자는 CLI에 그대로 전달됩니다.

---

## 전역 옵션

모든 명령에서 사용할 수 있는 옵션입니다.

| 옵션 | 설명 |
|------|------|
| `-v`, `--verbose` | 추가 정보 출력. init 시 템플릿 경로, doctor 시 실패 항목 힌트 항상 표시. |
| `-V`, `--version` | CLI 버전 출력. |
| `-h`, `--help` | 해당 명령 도움말 출력. |

예:

```bash
prompt-guide init -p flutter -v
prompt-guide doctor -v
prompt-guide --help
prompt-guide init --help
```

---

## init — 프로젝트 초기화

현재 디렉터리에 Prompt Guide 설정을 설치합니다.

### 사용법

```bash
prompt-guide init [옵션]
```

### 옵션

| 옵션 | shorthand | 설명 |
|------|-----------|------|
| `--platform <platform>` | `-p` | 플랫폼 지정. 생략 시 터미널에서 1~5 또는 이름으로 선택. |
| `--dry-run` | — | 실제로 파일을 쓰지 않고, **무엇을 할지만** 출력. |

### 지원 플랫폼

`ios` | `android` | `flutter` | `web` | `server`

- **ios**: iOS (Swift/SwiftUI). context에 `ios/**`, `*.xcodeproj/**` 등 포함. `.gitignore`에 Xcode 관련 패턴 추가.
- **android**: Android (Kotlin/Java). `android/**`, `app/**` 등. Gradle·빌드 디렉터리 ignore.
- **flutter**: Flutter (Dart). `lib/**`, `test/**`, `pubspec.yaml` 등. Dart/Flutter 빌드·캐시 ignore.
- **web**: 웹 (JS/TS, React/Vue 등). `src/**`, `public/**`, `*.config.js` 등. `dist/`, `.next/`, `.vite/` 등 ignore.
- **server**: 서버 (Node/Go/Rust/Python 등). `src/**`, `lib/**`, `cmd/**` 등. `venv/`, `node_modules/`, `target/` 등 ignore.

### init이 하는 일

1. **플랫폼 선택**  
   `-p`/`--platform`이 없으면 터미널에서 번호(1~5) 또는 이름으로 선택합니다.
2. **디렉터리 복사**  
   템플릿에서 `ai/`, `prompts/`, `docs/`를 현재 디렉터리로 복사합니다.
3. **설정 반영**  
   `ai/ai.config.yml`의 `platform` 값을 선택한 플랫폼으로 설정합니다.
4. **.gitignore**  
   `.gitignore`가 있으면 끝에 prompt-guide용 블록(공통 + 플랫폼별)을 붙입니다. 없으면 새로 만듭니다.

### 예시

```bash
# 대화형: 플랫폼을 터미널에서 선택
prompt-guide init

# 플랫폼을 옵션으로 지정
prompt-guide init --platform=ios
prompt-guide init -p web
prompt-guide init -p server

# 실제 쓰기 없이 할 작업만 확인
prompt-guide init -p flutter --dry-run

# 상세 로그와 함께 초기화
prompt-guide init -p android -v
```

### 주의사항

- **이미 `ai/`, `prompts/`, `docs/`가 있는 경우**  
  init은 기존 파일을 **덮어씁니다**. 중요한 수정이 있다면 백업 후 실행하거나, 필요한 파일만 수동으로 복사하세요.
- **템플릿을 찾지 못하는 경우**  
  `Templates not found` 에러가 나면, 전역 설치한 경우 패키지를 재설치하거나, 이 레포에서 실행 시 `npm run build` 후 `cli/`에 `ai/`, `prompts/`, `docs/`가 있는지 확인하세요.

---

## doctor — 설정 점검 및 자동 수정

설치된 Prompt Guide 구조와 설정이 올바른지 검사합니다.  
`.gitignore`에 prompt-guide 블록이 없을 때 **자동으로 추가**하는 `--fix` 옵션을 지원합니다.

### 사용법

```bash
prompt-guide doctor [옵션]
```

### 옵션

| 옵션 | 설명 |
|------|------|
| `--fix` | `.gitignore`가 없거나 prompt-guide 블록이 없으면, **자동으로 생성·추가**합니다. `ai/ai.config.yml`의 `platform`(없으면 `web`)을 사용합니다. |

### 점검 항목

| 항목 | 통과 조건 | 실패 시 힌트 |
|------|-----------|--------------|
| **ai/** | `ai/` 디렉터리 존재 | `prompt-guide init` 실행 |
| **ai/ai.config.yml** | 파일 존재 + `platform:` 및 `context:` 포함 | `prompt-guide init` 또는 해당 키 추가 |
| **prompts/** | `prompts/` 디렉터리 존재 | `prompt-guide init` |
| **docs/** | `docs/` 디렉터리 존재 | `prompt-guide init` |
| **.gitignore** | 파일 존재 + `# prompt-guide (added by prompt-guide-cli)` 블록 포함 | `prompt-guide doctor --fix` 또는 `prompt-guide init` |

### 예시

```bash
# 점검만 (수정 없음)
prompt-guide doctor

# .gitignore 블록이 없으면 추가
prompt-guide doctor --fix

# 상세 출력 (실패 항목 힌트 항상 표시)
prompt-guide doctor -v
prompt-guide doctor --fix -v
```

### doctor --fix 동작

- **.gitignore가 없는 경우**  
  `ai/ai.config.yml`에서 `platform`을 읽어(없거나 null이면 `web`) prompt-guide 공통 + 해당 플랫폼용 ignore 블록으로 **새 `.gitignore` 파일**을 만듭니다.
- **.gitignore는 있는데 prompt-guide 블록만 없는 경우**  
  기존 내용 끝에 **같은 블록을 추가**합니다.  
  이미 블록이 있으면 아무 것도 하지 않습니다.

init을 다시 실행하지 않아도 `.gitignore`만 보정할 때 유용합니다.

---

## 에러 및 종료 코드

| 상황 | 종료 코드 | 메시지 예 |
|------|-----------|------------|
| 정상 완료 | 0 | — |
| init 실패 (템플릿 없음, 플랫폼 오류 등) | 1 | `✗ Templates not found. ...` / `✗ Platform must be one of: ...` |
| doctor 점검 실패 (항목 하나라도 실패) | 1 | 터미널에 `✗` 항목 표시 후 `Fix the items above, or run doctor --fix ...` |
| doctor 전 항목 통과 | 0 | `All checks passed.` |

---

## 다음 단계

- **설치 후**: `ai/ai.config.yml`에서 `model.default`, `context.include`를 프로젝트에 맞게 수정하세요. 자세한 설정은 [README의 Configuration Reference](../README.md#configuration-reference)와 [WHAT-INSTALLS.md](WHAT-INSTALLS.md)를 참고하세요.
- **규칙 요약**: `docs/system.core.md`, `docs/review.md`, `docs/rules-by-platform.md`에서 사람이 읽기 좋은 규칙 요약을 볼 수 있습니다.
