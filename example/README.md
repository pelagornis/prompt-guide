# Example — 테스트용 프로젝트

이 폴더는 **prompt-guide CLI**를 테스트하기 위한 샘플 프로젝트입니다.  
`prompt.config.js` + `prompts/` + `docs/` 가 들어 있어 `install`, `doctor` 를 바로 실행해 볼 수 있습니다.

## 테스트 방법

### 1. 이 레포에서 (루트에서)

```bash
# example 폴더로 이동 후 CLI 실행
npm run example:install   # example/ 에서 prompt-guide install
npm run example:doctor    # example/ 에서 prompt-guide doctor
```

또는 직접:

```bash
cd example
node ../cli/bin/cli.js install
node ../cli/bin/cli.js doctor
```

### 2. 전역 설치된 CLI로

```bash
cd example
prompt-guide install
prompt-guide doctor
```

### 3. init 테스트 (덮어쓰기)

example 을 init 대상으로 쓸 수 있습니다. **기존 내용이 덮어씌워집니다.**

```bash
cd example
prompt-guide init -y
prompt-guide install
```

## 포함된 것

| 경로 | 설명 |
|------|------|
| `prompt.config.js` | 샘플 설정 (tool: cursor, platform: web) |
| `prompts/` | system.core, review, rules.by-platform, guide.template |
| `docs/` | 규칙 요약 마크다운 |

**참고:** `prompt-guide install`이 참고하는 건 **`tool`**과 **`prompts.default` / `prompts.review`** 뿐입니다. `taskPresets`, `platforms`, `rules`, `model`, `context`는 설정 파일에만 있고, CLI가 생성하는 파일 내용에는 넣지 않습니다. (다른 도구가 prompt.config.js를 읽어 쓸 수 있도록 정의만 해 둔 것.)

`prompt-guide install` 실행 시 **CLI가 `prompt.config.js`와 `prompts/*.yml`을 읽어** `tool` 값에 따라 다음을 **자동 생성**합니다.

- **cursor** → `.cursor/rules/use-prompt-guide.mdc`
- **codex** → `AGENTS.md`
- **windsurf** → `.windsurfrules`
- **claude** → `.claude/rules/prompt-guide-*.md`

→ 설정을 바꾸려면 **`prompt.config.js`나 `prompts/`를 수정한 뒤** 다시 `prompt-guide install`을 실행하세요. 생성된 파일은 덮어쓰기되므로 직접 수정하지 마세요.

생성 파일은 `example/.gitignore` 에 의해 무시됩니다 (테스트 시에만 로컬에 생성).
