# prompt-guide

Claude Code, Codex CLI, Cursor 설정을 단일 `prompt-guide.yml`로 통합 관리하는 CLI 툴.

```bash
prompt-guide init          # 프로젝트 초기화 (대화형)
prompt-guide sync          # 모든 툴 설정 파일 생성/갱신
prompt-guide diff          # 변경사항 미리보기
prompt-guide validate      # prompt-guide.yml 검증
prompt-guide add skill     # 새 skill 추가
prompt-guide add rule      # 새 rule 추가
prompt-guide add agent     # 새 agent 추가
prompt-guide status        # 현재 생성된 파일 상태 확인
```

---

## 기술 스택

| 영역         | 선택                        | 이유                                 |
| ------------ | --------------------------- | ------------------------------------ |
| 런타임       | Bun                         | 네이티브 TS 실행, 빠른 cold start    |
| 언어         | TypeScript 5.x strict       | 타입 안전성                          |
| 모노레포     | pnpm workspaces + Turborepo | 빌드 캐싱, 태스크 파이프라인         |
| 스키마 검증  | Zod v4                      | 런타임 검증 + 타입추론 + JSON Schema |
| 에러 처리    | neverthrow                  | Result 패턴, throw 제거              |
| 설정 탐색    | cosmiconfig                 | 다중 형식 자동 탐색                  |
| 템플릿       | eta                         | TS 친화적, Handlebars보다 빠름       |
| CLI 파싱     | citty (UnJS)                | 경량, 선언적                         |
| CLI 프롬프트 | @clack/prompts              | 세련된 인터랙티브 UI                 |
| 린트/포맷    | Biome                       | ESLint + Prettier 통합               |
| 테스트       | Vitest + memfs              | 파일시스템 인메모리 모킹             |
| 버전 관리    | Changesets                  | CHANGELOG 자동화                     |

---

## 모노레포 디렉토리 구조

```
prompt-guide/
├── packages/
│   ├── schema/                    # Zod 스키마, 공유 타입
│   │   ├── src/
│   │   │   ├── config.schema.ts   # 메인 스키마 정의
│   │   │   ├── skill.schema.ts    # Skill frontmatter 스키마
│   │   │   ├── rule.schema.ts     # Rule 스키마
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── core/                      # 설정 로드·병합·검증
│   │   ├── src/
│   │   │   ├── resolver.ts        # cosmiconfig 탐색
│   │   │   ├── merger.ts          # 글로벌 → 로컬 deep merge
│   │   │   ├── validator.ts       # Zod 검증 레이어
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── adapters/
│   │   ├── interface.ts           # 공유 Adapter 인터페이스
│   │   ├── claude/                # Claude Code 어댑터
│   │   │   ├── src/
│   │   │   │   ├── adapter.ts
│   │   │   │   ├── generators/
│   │   │   │   │   ├── claude-md.ts
│   │   │   │   │   ├── settings-json.ts
│   │   │   │   │   ├── rules.ts
│   │   │   │   │   ├── agents.ts
│   │   │   │   │   ├── skills.ts
│   │   │   │   │   └── mcp-json.ts
│   │   │   │   └── templates/
│   │   │   │       ├── CLAUDE.md.eta
│   │   │   │       ├── skill.md.eta
│   │   │   │       ├── agent.md.eta
│   │   │   │       └── rule.md.eta
│   │   │   └── package.json
│   │   ├── codex/                 # Codex CLI 어댑터
│   │   │   ├── src/
│   │   │   │   ├── adapter.ts
│   │   │   │   ├── generators/
│   │   │   │   │   ├── agents-md.ts
│   │   │   │   │   └── config-toml-guide.ts  # config.toml은 안내만 출력
│   │   │   │   └── templates/
│   │   │   │       ├── AGENTS.md.eta
│   │   │   │       └── codex-setup.md.eta
│   │   │   └── package.json
│   │   └── cursor/                # Cursor 어댑터
│   │       ├── src/
│   │       │   ├── adapter.ts
│   │       │   ├── generators/
│   │       │   │   └── rules-mdc.ts
│   │       │   └── templates/
│   │       │       └── rule.mdc.eta
│   │       └── package.json
│   │
│   └── cli/                       # CLI 진입점
│       ├── src/
│       │   ├── index.ts
│       │   └── commands/
│       │       ├── init.ts
│       │       ├── sync.ts
│       │       ├── diff.ts
│       │       ├── validate.ts
│       │       ├── status.ts
│       │       └── add/
│       │           ├── skill.ts
│       │           ├── rule.ts
│       │           └── agent.ts
│       └── package.json
│
├── templates/                     # 프로젝트 타입별 기본 prompt-guide.yml
│   ├── ios-swift/
│   │   └── prompt-guide.yml
│   ├── web-react/
│   │   └── prompt-guide.yml
│   ├── web-vue/
│   │   └── prompt-guide.yml
│   ├── python/
│   │   └── prompt-guide.yml
│   └── node/
│       └── prompt-guide.yml
│
├── turbo.json
├── pnpm-workspace.yaml
├── biome.json
└── package.json
```

---

## 소스 파일 설정 (`prompt-guide.yml`)

```yaml
version: "1"

project:
  name: AlarmApp
  type: ios-swift
  description: AlarmKit 기반 알람 앱

tools:
  claude_code: true
  codex: false
  cursor: true

context:
  tech_stack:
    - SwiftUI
    - AlarmKit
    - LiveActivity
    - DynamicIsland

  # CLAUDE.md + AGENTS.md 핵심 요약 (토큰 예산 의식)
  # Claude Code: ≤500 토큰 권장 (시스템 프롬프트가 ~50슬롯 선점)
  summary: |
    AlarmKit 기반 iOS 알람 앱. SwiftUI + MVVM 아키텍처.
    강제 언래핑 금지. async/await 우선. Preview 필수.

  # 경로 스코프 룰 → .claude/rules/ + .cursor/rules/ (globs 모드)
  path_rules:
    - name: swift-ui
      path: ["**/*.swift"]
      description: SwiftUI 및 Swift 파일 작업 규칙
      content: |
        - @Observable 매크로 우선 (ObservableObject 지양)
        - async/await 필수, Combine은 마이그레이션 대상
        - Preview는 모든 View에 포함
        - MVVM: View는 UI만, ViewModel은 비즈니스 로직만

    - name: alarmkit
      path: ["**/Alarm*.swift", "**/LiveActivity*.swift"]
      description: AlarmKit 및 LiveActivity 관련 파일 규칙
      content: |
        - AlarmKit countdown 방식 우선 (fixed-time 지양)
        - LiveActivity는 AlarmKit.AlarmActivity 채택
        - Dynamic Island: compact, expanded, minimal 모두 구현

    - name: tests
      path: ["**/*Tests.swift", "**/*Spec.swift"]
      content: |
        - XCTest 사용
        - 각 테스트 독립 실행 가능
        - given/when/then 주석 구조

  # Skills → .claude/skills/*/SKILL.md + ~/.agents/skills/ (공유 표준)
  skills:
    - name: generate-view
      description: >
        SwiftUI 뷰 + ViewModel 생성.
        Swift 파일 편집 시 자동 활성화.
      allowed_tools: [Read, Write, "Bash(swift:*)"]
      auto_invoke: true # description 기반 자동 활성화
      prompt: |
        MVVM 패턴으로 SwiftUI 뷰를 생성한다:
        1. $ARGUMENTS를 파싱해 뷰 이름, 데이터 타입 확인
        2. ViewModel (@Observable) 먼저 작성
        3. View 파일 작성 (Preview 포함)
        4. 파일명은 PascalCase

    - name: review-pr
      description: PR 코드 리뷰. diff 있을 때 요청 시 활성화.
      allowed_tools: [Read, "Bash(git:*)"]
      auto_invoke: false # 사용자 호출만 (/review-pr)
      prompt: |
        PR 코드를 리뷰한다:
        1. git diff main으로 변경사항 확인
        2. 아키텍처, 성능, 보안 순서로 검토
        3. 한국어로 개선점 정리 출력

    - name: generate-test
      description: 선택한 파일의 XCTest 유닛 테스트 생성
      allowed_tools: [Read, Write]
      auto_invoke: false
      prompt: |
        $ARGUMENTS 파일을 분석해 XCTest를 생성한다:
        1. public 메서드/프로퍼티 파악
        2. given/when/then 구조로 작성
        3. 엣지 케이스 포함

  # Agents → .claude/agents/*.md
  agents:
    - name: reviewer
      description: 코드 리뷰 전담 서브에이전트
      tools: [Read, "Bash(git:*)"]
      prompt: |
        변경된 코드를 리뷰하고 개선점을 한국어로 보고한다.
        아키텍처 → 성능 → 보안 → 스타일 순서.

    - name: tester
      description: 테스트 생성 전담 서브에이전트
      tools: [Read, Write, "Bash(xcodebuild:*)"]
      prompt: |
        주어진 파일에 대한 XCTest 유닛 테스트를 생성한다.

  # Hooks → .claude/settings.json hooks 섹션
  hooks:
    post_write:
      - matcher: "Write|Edit"
        command: "swiftformat $CLAUDE_FILE_PATHS"
        timeout: 30
    pre_bash:
      - matcher: "Bash"
        command: ".claude/hooks/block-dangerous.sh"
        timeout: 5

  # MCP 서버 → .claude/.mcp.json
  mcp_servers:
    - name: github
      type: http
      url: https://mcp.github.com/mcp
      auth_env: GITHUB_TOKEN

  # 절대 금지 (모든 툴 공통 반영)
  forbidden:
    - "강제 언래핑(!) 사용"
    - "print() 디버그 로그 커밋"
    - "새 의존성 무단 추가"
    - "하드코딩된 비밀키"

  # Cursor 전용: 룰 활성화 모드 오버라이드
  cursor:
    always_apply_rules: [core] # alwaysApply: true
    # path_rules는 globs 모드로 자동 변환
    # skills는 description 기반 agent-requested 모드로 변환
```

---

## 스키마 레이어 (`packages/schema`)

### `src/config.schema.ts`

```typescript
import { z } from "zod";

const ProjectTypeSchema = z.enum([
  "ios-swift",
  "web-react",
  "web-vue",
  "python",
  "node",
  "custom",
]);

const PathRuleSchema = z.object({
  name: z.string(),
  path: z.array(z.string()),
  description: z.string().optional(),
  content: z.string(),
});

const SkillSchema = z.object({
  name: z.string(),
  description: z.string(),
  allowed_tools: z.array(z.string()).default([]),
  auto_invoke: z.boolean().default(false),
  prompt: z.string(),
});

const AgentSchema = z.object({
  name: z.string(),
  description: z.string(),
  tools: z.array(z.string()).default([]),
  prompt: z.string(),
});

const HookEntrySchema = z.object({
  matcher: z.string(),
  command: z.string(),
  timeout: z.number().default(30),
});

const McpServerSchema = z.object({
  name: z.string(),
  type: z.enum(["http", "stdio"]),
  url: z.string().optional(),
  command: z.string().optional(),
  auth_env: z.string().optional(),
});

const CursorConfigSchema = z.object({
  always_apply_rules: z.array(z.string()).default([]),
});

const ContextSchema = z.object({
  tech_stack: z.array(z.string()).default([]),
  summary: z.string().optional(),
  path_rules: z.array(PathRuleSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  agents: z.array(AgentSchema).default([]),
  hooks: z
    .object({
      post_write: z.array(HookEntrySchema).default([]),
      pre_bash: z.array(HookEntrySchema).default([]),
    })
    .default({}),
  mcp_servers: z.array(McpServerSchema).default([]),
  forbidden: z.array(z.string()).default([]),
  cursor: CursorConfigSchema.default({}),
});

export const PromptGuideConfigSchema = z.object({
  version: z.literal("1").default("1"),
  project: z.object({
    name: z.string(),
    type: ProjectTypeSchema,
    description: z.string().optional(),
  }),
  tools: z
    .object({
      claude_code: z.boolean().default(true),
      codex: z.boolean().default(false),
      cursor: z.boolean().default(true),
    })
    .default({}),
  context: ContextSchema.default({}),
});

export type PromptGuideConfig = z.infer<typeof PromptGuideConfigSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type PathRule = z.infer<typeof PathRuleSchema>;
export type Agent = z.infer<typeof AgentSchema>;
```

---

## 코어 레이어 (`packages/core`)

### `src/resolver.ts`

```typescript
import { cosmiconfig } from "cosmiconfig";
import { Result, ok, err } from "neverthrow";
import {
  PromptGuideConfigSchema,
  type PromptGuideConfig,
} from "@prompt-guide/schema";

export type ResolveError =
  | { type: "NOT_FOUND" }
  | { type: "VALIDATION_ERROR"; issues: string[] };

export async function resolveConfig(
  cwd: string,
): Promise<Result<PromptGuideConfig, ResolveError>> {
  const explorer = cosmiconfig("prompt-guide", {
    searchPlaces: [
      "prompt-guide.yml",
      "prompt-guide.yaml",
      ".prompt-guiderc",
      "package.json",
    ],
  });

  const result = await explorer.search(cwd);
  if (!result) return err({ type: "NOT_FOUND" });

  const parsed = PromptGuideConfigSchema.safeParse(result.config);
  if (!parsed.success) {
    return err({
      type: "VALIDATION_ERROR",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
      ),
    });
  }

  return ok(parsed.data);
}
```

### `src/merger.ts`

```typescript
import { deepmerge } from "deepmerge-ts";
import type { PromptGuideConfig } from "@prompt-guide/schema";

// 프로젝트 타입별 기본값 → 로컬 설정 순서로 merge
export function mergeWithDefaults(
  local: PromptGuideConfig,
  typeDefaults: Partial<PromptGuideConfig>,
): PromptGuideConfig {
  return deepmerge(typeDefaults, local) as PromptGuideConfig;
}
```

---

## 어댑터 인터페이스 (`packages/adapters/interface.ts`)

```typescript
import type { Result } from "neverthrow";
import type { PromptGuideConfig } from "@prompt-guide/schema";

export interface GeneratedFile {
  path: string; // 프로젝트 루트 기준 상대경로
  content: string;
  skipIfExists?: boolean;
}

export interface FileDiff {
  path: string;
  status: "created" | "updated" | "unchanged" | "deleted";
  diff?: string;
}

export interface AdapterError {
  adapter: string;
  message: string;
}

export interface Adapter {
  readonly name: string;
  generate(
    config: PromptGuideConfig,
  ): Promise<Result<GeneratedFile[], AdapterError>>;
  validate(config: PromptGuideConfig): Result<void, string[]>;
  diff(config: PromptGuideConfig, projectRoot: string): Promise<FileDiff[]>;
}
```

---

## Claude Code 어댑터 (`packages/adapters/claude`)

### `src/adapter.ts`

```typescript
import { ok, err } from "neverthrow";
import type { Adapter, GeneratedFile } from "../../interface";
import type { PromptGuideConfig } from "@prompt-guide/schema";
import { generateClaudeMd } from "./generators/claude-md";
import { generateSettingsJson } from "./generators/settings-json";
import { generateRules } from "./generators/rules";
import { generateAgents } from "./generators/agents";
import { generateSkills } from "./generators/skills";
import { generateMcpJson } from "./generators/mcp-json";

export class ClaudeAdapter implements Adapter {
  readonly name = "claude";

  async generate(config: PromptGuideConfig) {
    try {
      const files: GeneratedFile[] = [
        ...generateClaudeMd(config),
        ...generateSettingsJson(config),
        ...generateRules(config),
        ...generateAgents(config),
        ...generateSkills(config),
        ...generateMcpJson(config),
        // block-dangerous.sh 훅 스크립트
        {
          path: ".claude/hooks/block-dangerous.sh",
          skipIfExists: true,
          content: `#!/bin/bash
# 위험한 명령어 차단 훅
COMMAND="$BASH_COMMAND"
if echo "$COMMAND" | grep -qE "rm -rf|DROP TABLE|format C:"; then
  echo "차단: 위험한 명령어 감지됨 - $COMMAND"
  exit 2  # exit 2 = Claude Code에게 hard stop 신호
fi`,
        },
      ];
      return ok(files);
    } catch (e) {
      return err({ adapter: this.name, message: String(e) });
    }
  }

  validate(config: PromptGuideConfig) {
    const errors: string[] = [];
    if (!config.project.name) errors.push("project.name 필요");
    // CLAUDE.md 토큰 예산 경고
    const summaryTokens = (config.context.summary ?? "").length / 4;
    if (summaryTokens > 375) {
      errors.push(
        `context.summary가 너무 김 (≈${Math.round(summaryTokens)} 토큰, 권장 ≤375)`,
      );
    }
    return errors.length
      ? { ok: false as const, error: errors }
      : { ok: true as const, value: undefined };
  }

  async diff(
    config: PromptGuideConfig,
    projectRoot: string,
  ): Promise<FileDiff[]> {
    const { readFile } = await import("node:fs/promises");
    const generated = await this.generate(config);
    if (generated.isErr()) return [];

    return Promise.all(
      generated.value.map(async (file) => {
        try {
          const existing = await readFile(
            `${projectRoot}/${file.path}`,
            "utf-8",
          );
          return {
            path: file.path,
            status: existing === file.content ? "unchanged" : "updated",
          } as FileDiff;
        } catch {
          return { path: file.path, status: "created" } as FileDiff;
        }
      }),
    );
  }
}
```

### `src/generators/claude-md.ts`

```typescript
import type { PromptGuideConfig } from "@prompt-guide/schema";
import type { GeneratedFile } from "../../../interface";

export function generateClaudeMd(config: PromptGuideConfig): GeneratedFile[] {
  const { project, context } = config;
  const lines: string[] = [];

  // 헤더 — 핵심 요약만 (토큰 예산)
  lines.push(`# ${project.name}`);
  if (project.description) lines.push(`\n${project.description}`);
  if (context.summary) lines.push(`\n${context.summary}`);

  // 기술 스택
  if (context.tech_stack.length) {
    lines.push(
      `\n## 기술 스택\n${context.tech_stack.map((t) => `- ${t}`).join("\n")}`,
    );
  }

  // 절대 금지 — 가장 중요하므로 최상단 근처에
  if (context.forbidden.length) {
    lines.push(
      `\n## 절대 금지\n${context.forbidden.map((f) => `- ${f}`).join("\n")}`,
    );
  }

  // 경로별 상세 룰은 파일 참조로 분리 (토큰 절약)
  if (context.path_rules.length) {
    lines.push("\n## 경로별 규칙");
    context.path_rules.forEach((rule) => {
      lines.push(
        `- @.claude/rules/${rule.name}.md — \`${rule.path.join(", ")}\``,
      );
    });
  }

  // Skills 참조
  if (context.skills.length) {
    lines.push("\n## 슬래시 커맨드");
    context.skills.forEach((s) => {
      lines.push(`- /${s.name} — ${s.description.split("\n")[0]}`);
    });
  }

  return [{ path: "CLAUDE.md", content: lines.join("\n") }];
}
```

### `src/generators/settings-json.ts`

```typescript
import type { PromptGuideConfig } from "@prompt-guide/schema";
import type { GeneratedFile } from "../../../interface";

export function generateSettingsJson(
  config: PromptGuideConfig,
): GeneratedFile[] {
  const { context } = config;
  const hooks: Record<string, unknown[]> = {};

  // post_write hooks
  if (context.hooks.post_write.length) {
    hooks["PostToolUse"] = context.hooks.post_write.map((h) => ({
      matcher: h.matcher,
      hooks: [{ type: "command", command: h.command, timeout: h.timeout }],
    }));
  }

  // pre_bash hooks
  if (context.hooks.pre_bash.length) {
    hooks["PreToolUse"] = context.hooks.pre_bash.map((h) => ({
      matcher: h.matcher,
      hooks: [{ type: "command", command: h.command, timeout: h.timeout }],
    }));
  }

  const settings = {
    permissions: {
      allow: ["Bash", "Read", "Write"],
      deny: [],
    },
    hooks,
  };

  return [
    {
      path: ".claude/settings.json",
      content: JSON.stringify(settings, null, 2),
    },
  ];
}
```

### `src/generators/rules.ts`

```typescript
import type { PromptGuideConfig } from "@prompt-guide/schema";
import type { GeneratedFile } from "../../../interface";

export function generateRules(config: PromptGuideConfig): GeneratedFile[] {
  return config.context.path_rules.map((rule) => {
    // YAML frontmatter — path 기반 lazy-load
    const frontmatter = [
      "---",
      `path: [${rule.path.map((p) => `"${p}"`).join(", ")}]`,
      "---",
    ].join("\n");

    return {
      path: `.claude/rules/${rule.name}.md`,
      content: `${frontmatter}\n\n${rule.content.trim()}`,
    };
  });
}
```

### `src/generators/skills.ts`

```typescript
import type { PromptGuideConfig } from "@prompt-guide/schema";
import type { GeneratedFile } from "../../../interface";

export function generateSkills(config: PromptGuideConfig): GeneratedFile[] {
  return config.context.skills.map((skill) => {
    const frontmatterLines = [
      "---",
      `name: ${skill.name}`,
      `description: ${skill.description.trim().split("\n").join(" ")}`,
    ];

    if (skill.allowed_tools.length) {
      frontmatterLines.push(`allowed-tools: ${skill.allowed_tools.join(", ")}`);
    }

    // auto_invoke: false → disable-model-invocation: true (사용자만 호출)
    if (!skill.auto_invoke) {
      frontmatterLines.push("disable-model-invocation: false");
    }

    frontmatterLines.push("---");
    const frontmatter = frontmatterLines.join("\n");

    return {
      path: `.claude/skills/${skill.name}/SKILL.md`,
      content: `${frontmatter}\n\n${skill.prompt.trim()}`,
    };
  });
}
```

### `src/generators/agents.ts`

```typescript
import type { PromptGuideConfig } from "@prompt-guide/schema";
import type { GeneratedFile } from "../../../interface";

export function generateAgents(config: PromptGuideConfig): GeneratedFile[] {
  return config.context.agents.map((agent) => {
    const frontmatter = [
      "---",
      `name: ${agent.name}`,
      `description: ${agent.description}`,
      `tools: ${agent.tools.join(", ")}`,
      "---",
    ].join("\n");

    return {
      path: `.claude/agents/${agent.name}.md`,
      content: `${frontmatter}\n\n${agent.prompt.trim()}`,
    };
  });
}
```

### `src/generators/mcp-json.ts`

```typescript
import type { PromptGuideConfig } from "@prompt-guide/schema";
import type { GeneratedFile } from "../../../interface";

export function generateMcpJson(config: PromptGuideConfig): GeneratedFile[] {
  if (!config.context.mcp_servers.length) return [];

  const mcpConfig: Record<string, unknown> = { mcpServers: {} };
  const servers = mcpConfig.mcpServers as Record<string, unknown>;

  config.context.mcp_servers.forEach((server) => {
    if (server.type === "http" && server.url) {
      servers[server.name] = {
        type: "http",
        url: server.url,
        ...(server.auth_env
          ? {
              headers: { Authorization: `Bearer \${${server.auth_env}}` },
            }
          : {}),
      };
    } else if (server.type === "stdio" && server.command) {
      servers[server.name] = {
        type: "stdio",
        command: server.command,
      };
    }
  });

  return [
    {
      path: ".claude/.mcp.json",
      content: JSON.stringify(mcpConfig, null, 2),
    },
  ];
}
```

---

## Codex 어댑터 (`packages/adapters/codex`)

### `src/generators/agents-md.ts`

```typescript
import type { PromptGuideConfig } from "@prompt-guide/schema";
import type { GeneratedFile } from "../../../interface";

export function generateAgentsMd(config: PromptGuideConfig): GeneratedFile[] {
  const { project, context } = config;
  const lines: string[] = [];

  lines.push(`# AGENTS.md — ${project.name}`);
  if (project.description) lines.push(`\n${project.description}`);

  // tech stack
  if (context.tech_stack.length) {
    lines.push(
      `\n## 기술 스택\n${context.tech_stack.map((t) => `- ${t}`).join("\n")}`,
    );
  }

  // summary
  if (context.summary) {
    lines.push(`\n## 개요\n${context.summary}`);
  }

  // 절대 금지
  if (context.forbidden.length) {
    lines.push(
      `\n## 절대 금지\n${context.forbidden.map((f) => `- ${f}`).join("\n")}`,
    );
  }

  // 경로별 규칙 (Codex는 서브디렉토리 AGENTS.md 방식이므로 여기선 통합 요약)
  if (context.path_rules.length) {
    lines.push("\n## 파일 타입별 규칙");
    context.path_rules.forEach((rule) => {
      lines.push(`\n### ${rule.name} (\`${rule.path.join(", ")}\`)`);
      lines.push(rule.content.trim());
    });
  }

  // 워크플로우 (skills → 작업 지침으로 변환)
  if (context.skills.length) {
    lines.push("\n## 반복 워크플로우");
    context.skills.forEach((s) => {
      lines.push(`\n### ${s.name}\n${s.prompt.trim()}`);
    });
  }

  return [{ path: "AGENTS.md", content: lines.join("\n") }];
}
```

### `src/generators/config-toml-guide.ts`

````typescript
import type { PromptGuideConfig } from "@prompt-guide/schema";
import type { GeneratedFile } from "../../../interface";

// ~/.codex/config.toml 은 글로벌 파일이므로 직접 쓰지 않고 안내 파일 생성
export function generateConfigTomlGuide(
  config: PromptGuideConfig,
): GeneratedFile[] {
  const lines: string[] = [
    "# Codex 글로벌 설정 안내",
    "",
    "`~/.codex/config.toml` 에 아래 내용을 추가하세요:",
    "",
    "```toml",
    "# 기본 모델 설정",
    'model = "gpt-5.4"',
    'sandbox_mode = "workspace-write"',
    'approval_mode = "on-request"',
    "",
    "# AGENTS.md 탐색 범위 확장 (선택)",
    "project_doc_max_bytes = 65536",
    "",
  ];

  // MCP 서버 설정
  if (config.context.mcp_servers.length) {
    config.context.mcp_servers.forEach((server) => {
      if (server.type === "http" && server.url) {
        lines.push(`[mcp.${server.name}]`);
        lines.push(`type = "http"`);
        lines.push(`url = "${server.url}"`);
        if (server.auth_env) {
          lines.push(`[mcp.${server.name}.headers]`);
          lines.push(`Authorization = "Bearer \${${server.auth_env}}"`);
        }
        lines.push("");
      }
    });
  }

  lines.push("```");
  lines.push("");
  lines.push(
    "> Skills는 `~/.agents/skills/` 에 저장하면 Codex + Claude Code 공유 가능",
  );

  return [{ path: ".codex-setup.md", content: lines.join("\n") }];
}
````

---

## Cursor 어댑터 (`packages/adapters/cursor`)

### `src/generators/rules-mdc.ts`

```typescript
import type { PromptGuideConfig } from "@prompt-guide/schema";
import type { GeneratedFile } from "../../../interface";

export function generateRulesMdc(config: PromptGuideConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const { context } = config;
  const alwaysApplyNames = context.cursor.always_apply_rules;

  // 1. core.mdc — 항상 로드 (alwaysApply)
  const coreFrontmatter = ["---", "alwaysApply: true", "---"].join("\n");

  const coreBody = [
    "# 핵심 규칙",
    "",
    "## 실행 원칙",
    "- 동의 전 가정 검증. 기존 코드 먼저 파악.",
    "- 최소 변경 원칙. 재사용 가능 코드 탐색 후 구현.",
    "- 변경 전 계획 제시, 확인 후 진행.",
    "",
  ];

  if (context.forbidden.length) {
    coreBody.push("## 절대 금지");
    context.forbidden.forEach((f) => coreBody.push(`- ${f}`));
  }

  files.push({
    path: ".cursor/rules/core.mdc",
    content: `${coreFrontmatter}\n\n${coreBody.join("\n")}`,
  });

  // 2. 경로 스코프 룰 → globs 모드 .mdc
  context.path_rules.forEach((rule) => {
    const isAlways = alwaysApplyNames.includes(rule.name);

    const frontmatterLines = ["---"];
    if (isAlways) {
      frontmatterLines.push("alwaysApply: true");
    } else {
      frontmatterLines.push("alwaysApply: false");
      if (rule.description) {
        frontmatterLines.push(`description: ${rule.description}`);
      }
      frontmatterLines.push(
        `globs: [${rule.path.map((p) => `"${p}"`).join(", ")}]`,
      );
    }
    frontmatterLines.push("---");

    files.push({
      path: `.cursor/rules/${rule.name}.mdc`,
      content: `${frontmatterLines.join("\n")}\n\n${rule.content.trim()}`,
    });
  });

  // 3. Skills → agent-requested 룰 (description만, globs 없음)
  context.skills.forEach((skill) => {
    const frontmatter = [
      "---",
      `description: ${skill.description.trim().split("\n").join(" ")}`,
      "alwaysApply: false",
      "---",
    ].join("\n");

    files.push({
      path: `.cursor/rules/skill-${skill.name}.mdc`,
      content: `${frontmatter}\n\n${skill.prompt.trim()}`,
    });
  });

  // .cursorrules 는 생성하지 않음 (deprecated, Agent mode에서 무시됨)

  return files;
}
```

---

## CLI 레이어 (`packages/cli`)

### `src/index.ts`

```typescript
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: { name: "prompt-guide", description: "AI 툴 설정 통합 관리" },
  subCommands: {
    init: () => import("./commands/init").then((m) => m.initCommand),
    sync: () => import("./commands/sync").then((m) => m.syncCommand),
    diff: () => import("./commands/diff").then((m) => m.diffCommand),
    validate: () =>
      import("./commands/validate").then((m) => m.validateCommand),
    status: () => import("./commands/status").then((m) => m.statusCommand),
    add: defineCommand({
      meta: { description: "새 설정 항목 추가" },
      subCommands: {
        skill: () =>
          import("./commands/add/skill").then((m) => m.addSkillCommand),
        rule: () => import("./commands/add/rule").then((m) => m.addRuleCommand),
        agent: () =>
          import("./commands/add/agent").then((m) => m.addAgentCommand),
      },
    }),
  },
});

runMain(main);
```

### `src/commands/init.ts`

```typescript
import * as p from "@clack/prompts";
import { writeFile } from "node:fs/promises";
import yaml from "js-yaml";

export const initCommand = defineCommand({
  meta: { description: "프로젝트 초기화 (대화형)" },
  async run() {
    p.intro("prompt-guide");

    const answers = await p.group(
      {
        name: () =>
          p.text({
            message: "프로젝트 이름",
            placeholder: "my-app",
            validate: (v) => (v.length < 1 ? "필수 입력" : undefined),
          }),

        type: () =>
          p.select({
            message: "프로젝트 타입",
            options: [
              { value: "ios-swift", label: "iOS / Swift" },
              { value: "web-react", label: "Web / React" },
              { value: "web-vue", label: "Web / Vue" },
              { value: "python", label: "Python" },
              { value: "node", label: "Node.js" },
              { value: "custom", label: "Custom" },
            ],
          }),

        tools: () =>
          p.multiselect({
            message: "사용할 AI 툴 (스페이스바로 선택)",
            options: [
              {
                value: "claude_code",
                label: "Claude Code",
                hint: ".claude/",
                selected: true,
              },
              { value: "codex", label: "Codex CLI", hint: "AGENTS.md" },
              {
                value: "cursor",
                label: "Cursor",
                hint: ".cursor/rules/",
                selected: true,
              },
            ],
          }),

        tech_stack: () =>
          p.text({
            message: "기술 스택 (쉼표 구분)",
            placeholder: "SwiftUI, AlarmKit, LiveActivity",
          }),

        description: () =>
          p.text({
            message: "프로젝트 설명 (선택)",
            placeholder: "AlarmKit 기반 알람 앱",
          }),
      },
      {
        onCancel: () => {
          p.cancel("취소됨");
          process.exit(0);
        },
      },
    );

    const tools = answers.tools as string[];
    const config = {
      version: "1",
      project: {
        name: answers.name,
        type: answers.type,
        ...(answers.description ? { description: answers.description } : {}),
      },
      tools: {
        claude_code: tools.includes("claude_code"),
        codex: tools.includes("codex"),
        cursor: tools.includes("cursor"),
      },
      context: {
        tech_stack: String(answers.tech_stack)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        summary: "",
        path_rules: [],
        skills: [],
        agents: [],
        forbidden: [],
      },
    };

    await writeFile(
      "prompt-guide.yml",
      yaml.dump(config, { lineWidth: 80 }),
      "utf-8",
    );

    p.log.success("prompt-guide.yml 생성 완료");
    p.outro("`prompt-guide sync` 로 설정 파일을 생성하세요.");
  },
});
```

### `src/commands/sync.ts`

```typescript
import * as p from "@clack/prompts";
import { writeFile, mkdir, chmod } from "node:fs/promises";
import { dirname } from "node:path";
import { resolveConfig } from "@prompt-guide/core";
import { ClaudeAdapter } from "@prompt-guide/adapter-claude";
import { CodexAdapter } from "@prompt-guide/adapter-codex";
import { CursorAdapter } from "@prompt-guide/adapter-cursor";
import type { Adapter } from "@prompt-guide/adapters";

export const syncCommand = defineCommand({
  meta: { description: "모든 툴 설정 파일 생성/갱신" },
  args: {
    "dry-run": {
      type: "boolean",
      default: false,
      description: "실제 파일 쓰기 없이 미리보기",
    },
    tool: {
      type: "string",
      description: "claude | codex | cursor (특정 툴만)",
    },
  },
  async run({ args }) {
    const s = p.spinner();
    s.start("prompt-guide.yml 로딩 중");

    const configResult = await resolveConfig(process.cwd());
    if (configResult.isErr()) {
      s.stop("실패");
      p.log.error(
        configResult.error.type === "NOT_FOUND"
          ? "prompt-guide.yml 없음. `prompt-guide init` 먼저 실행하세요."
          : `검증 실패:\n${(configResult.error as any).issues?.join("\n")}`,
      );
      process.exit(1);
    }

    const config = configResult.value;
    const allAdapters: Adapter[] = [
      ...(config.tools.claude_code ? [new ClaudeAdapter()] : []),
      ...(config.tools.codex ? [new CodexAdapter()] : []),
      ...(config.tools.cursor ? [new CursorAdapter()] : []),
    ];

    const adapters = args.tool
      ? allAdapters.filter((a) => a.name === args.tool)
      : allAdapters;

    if (!adapters.length) {
      p.log.warn("활성화된 어댑터 없음. prompt-guide.yml의 tools 섹션 확인.");
      process.exit(0);
    }

    s.message(`[${adapters.map((a) => a.name).join(", ")}] 생성 중`);

    let totalCreated = 0;
    let totalUpdated = 0;

    for (const adapter of adapters) {
      const result = await adapter.generate(config);
      if (result.isErr()) {
        p.log.warn(`${adapter.name}: ${result.error.message}`);
        continue;
      }

      for (const file of result.value) {
        if (!args["dry-run"]) {
          await mkdir(dirname(file.path), { recursive: true });
          await writeFile(file.path, file.content, "utf-8");
          // .sh 파일은 실행 권한 부여
          if (file.path.endsWith(".sh")) await chmod(file.path, 0o755);
        }

        const label = args["dry-run"] ? "[dry-run] " : "";
        p.log.success(`${label}${file.path}`);
        totalCreated++;
      }
    }

    s.stop(`완료 — ${totalCreated}개 파일 생성/갱신`);
  },
});
```

### `src/commands/diff.ts`

```typescript
import * as p from "@clack/prompts";
import { resolveConfig } from "@prompt-guide/core";
import { ClaudeAdapter } from "@prompt-guide/adapter-claude";
import { CodexAdapter } from "@prompt-guide/adapter-codex";
import { CursorAdapter } from "@prompt-guide/adapter-cursor";

export const diffCommand = defineCommand({
  meta: { description: "변경될 파일 미리보기" },
  async run() {
    const configResult = await resolveConfig(process.cwd());
    if (configResult.isErr()) {
      p.log.error("설정 로드 실패");
      process.exit(1);
    }

    const config = configResult.value;
    const adapters = [
      ...(config.tools.claude_code ? [new ClaudeAdapter()] : []),
      ...(config.tools.codex ? [new CodexAdapter()] : []),
      ...(config.tools.cursor ? [new CursorAdapter()] : []),
    ];

    for (const adapter of adapters) {
      const diffs = await adapter.diff(config, process.cwd());
      const icons = {
        created: "✚",
        updated: "~",
        unchanged: "·",
        deleted: "✖",
      };
      diffs.forEach((d) => p.log.info(`${icons[d.status]} ${d.path}`));
    }
  },
});
```

### `src/commands/add/skill.ts`

```typescript
import * as p from "@clack/prompts";
import { readFile, writeFile } from "node:fs/promises";
import yaml from "js-yaml";

export const addSkillCommand = defineCommand({
  meta: { description: "새 skill 추가" },
  async run() {
    const answers = await p.group(
      {
        name: () =>
          p.text({
            message: "Skill 이름 (kebab-case)",
            placeholder: "generate-view",
          }),
        description: () =>
          p.text({
            message: "설명 (언제 자동 활성화되는지)",
            placeholder: "SwiftUI 뷰 생성",
          }),
        auto_invoke: () =>
          p.confirm({
            message: "파일 관련 작업 시 자동 활성화?",
            initialValue: false,
          }),
        prompt: () =>
          p.text({ message: "지침 내용", placeholder: "1. ... 2. ..." }),
      },
      {
        onCancel: () => process.exit(0),
      },
    );

    // prompt-guide.yml에 skill 추가
    const raw = await readFile("prompt-guide.yml", "utf-8");
    const config = yaml.load(raw) as any;
    config.context.skills = config.context.skills ?? [];
    config.context.skills.push({
      name: answers.name,
      description: answers.description,
      allowed_tools: [],
      auto_invoke: answers.auto_invoke,
      prompt: answers.prompt,
    });

    await writeFile(
      "prompt-guide.yml",
      yaml.dump(config, { lineWidth: 80 }),
      "utf-8",
    );
    p.log.success(
      `skill '${answers.name}' 추가됨. \`prompt-guide sync\` 로 반영하세요.`,
    );
  },
});
```

---

## 생성되는 파일 전체 목록

```
# Claude Code
CLAUDE.md
.claude/settings.json
.claude/.mcp.json
.claude/hooks/block-dangerous.sh
.claude/rules/swift-ui.md
.claude/rules/alarmkit.md
.claude/rules/tests.md
.claude/agents/reviewer.md
.claude/agents/tester.md
.claude/skills/generate-view/SKILL.md
.claude/skills/review-pr/SKILL.md
.claude/skills/generate-test/SKILL.md

# Codex
AGENTS.md
.codex-setup.md              ← config.toml 안내 (직접 수정 필요)

# Cursor
.cursor/rules/core.mdc       ← alwaysApply: true
.cursor/rules/swift-ui.mdc   ← globs: ["**/*.swift"]
.cursor/rules/alarmkit.mdc   ← globs: ["**/Alarm*.swift"]
.cursor/rules/tests.mdc      ← globs: ["**/*Tests.swift"]
.cursor/rules/skill-generate-view.mdc   ← agent-requested
.cursor/rules/skill-review-pr.mdc
.cursor/rules/skill-generate-test.mdc

# 생성하지 않는 것
.cursorrules                 ← deprecated, 생성 금지
```

---

## 루트 설정 파일

### `package.json`

```json
{
  "name": "prompt-guide",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "biome check .",
    "format": "biome format --write ."
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.0",
    "turbo": "^2.0.0",
    "typescript": "^5.6.0"
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - "packages/*"
  - "packages/adapters/*"
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "persistent": true, "cache": false },
    "test": { "dependsOn": ["^build"] },
    "lint": {}
  }
}
```

### `biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

---

## 구현 순서

1. `packages/schema` — Zod 스키마 정의, JSON Schema export (IDE 자동완성용)
2. `packages/core` — cosmiconfig 탐색, neverthrow Result 패턴
3. `packages/adapters/interface.ts` — 공유 Adapter 인터페이스
4. `packages/adapters/claude` — 6개 generator 구현 (claude-md, settings-json, rules, agents, skills, mcp-json)
5. `packages/adapters/codex` — agents-md, config-toml-guide 구현
6. `packages/adapters/cursor` — rules-mdc 구현 (.cursorrules 생성 금지)
7. `packages/cli` — citty + clack으로 7개 명령어 구현
8. `templates/` — 프로젝트 타입별 기본 prompt-guide.yml 작성
9. Vitest + memfs 테스트 — 생성 파일 snapshot 테스트
10. JSR + npm 배포, `npx prompt-guide init` 가능하게
