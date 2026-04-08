# Example (CLI 검증용)

이 폴더는 **`prompt-guide init`** / **`prompt-guide install`** 결과를 그대로 두어 CLI를 끝까지 검증합니다.

## 레이어 편집 위치

- **사람이 고치는 곳**: `docs/prompt-guide/**/*.md` (레이어 트리와 동일한 경로)
- **`install`이 만드는 곳**: `prompt.config.js`의 `layers.source`(기본 `.claude`)와 미러 루트(`.cursor/`, `codex/`, `.windsurf/`) 아래 **같은 상대 경로의 `*.yml`** (`prompt:` 키)

`layers.manifest.yml`은 `layers.source` 기준으로 **`.yml`** 경로를 가리킵니다.

## 저장소 루트에서 재생성

```bash
rm -rf example && mkdir example && cd example
node ../cli/bin/cli.js init -y
node ../cli/bin/cli.js install
node ../cli/bin/cli.js doctor
```

한 줄:

```bash
rm -rf example && mkdir example && cd example && node ../cli/bin/cli.js init -y && node ../cli/bin/cli.js install && node ../cli/bin/cli.js doctor
```

첫 실행 전: 루트에서 `npm run build`, 템플릿을 바꿨다면 `cd cli && node scripts/copy-templates.cjs`.
