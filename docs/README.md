# Prompt Guide — 문서 목차

이 디렉터리에는 **설치·설정·규칙**을 설명하는 문서가 있습니다.  
YAML 설정은 `ai/ai.config.yml`, 실제 주입용 규칙 문장은 `prompts/*.yml`에 있으며, 여기서는 **사람이 읽기 위한 요약**과 **CLI·기능별 설명**을 제공합니다.

---

## 문서 목록

| 문서 | 대상 | 내용 |
|------|------|------|
| **[CLI.md](CLI.md)** | 사용자·개발자 | CLI 실행 방법, `init` / `doctor` 명령과 옵션, 예시, 에러·종료 코드. |
| **[what-install.md](what-install.md)** | 사용자·포크 관리자 | 어떤 기능(CLI·설정·프리셋·플랫폼)이 **무엇을 추가하는지**, **나중에 뭘 바꾸면 되는지** 정리. |
| **[request-guide.md](request-guide.md)** | 개발자 | **요청 리스트 작성법**: 프리셋별 요청 요령, guide.template 필드, 스펙·티켓 작성, 예시. |
| **[system.core.md](system.core.md)** | 개발자·리뷰어 | 기본 규칙 요약(역할·코드 품질·보안·에러·문서·협업). 원문은 `prompts/system.core.yml`. |
| **[review.md](review.md)** | 리뷰어 | 코드 리뷰 시 검사 범위·체크리스트·출력 형식·결론 규칙. 원문은 `prompts/review.yml`. |
| **[rules-by-platform.md](rules-by-platform.md)** | 플랫폼별 개발자 | iOS·Android·Flutter·Web·Server별 추가 규칙 요약. 원문은 `prompts/rules.by-platform.yml`. |

---

## 읽는 순서 추천

1. **처음 설치·설정할 때**  
   [CLI.md](CLI.md) → [what-install.md](what-install.md) (1·2·6·7절)

2. **AI에게 작업 요청할 때**  
   [request-guide.md](request-guide.md) (요청 작성 원칙, 프리셋별 요령, 템플릿·스펙 예시)

3. **일상 개발·리뷰할 때**  
   [system.core.md](system.core.md), [review.md](review.md), [rules-by-platform.md](rules-by-platform.md)

4. **설정을 바꾸거나 프리셋·플랫폼을 추가할 때**  
   [what-install.md](what-install.md) (2·3·4·5·6절)

---

## 원문 YAML과의 대응

| Markdown 문서 | YAML 원문 | 도구에서 사용하는 키 |
|---------------|-----------|------------------------|
| system.core.md | prompts/system.core.yml | `prompt` |
| review.md | prompts/review.yml | `prompt` |
| rules-by-platform.md | prompts/rules.by-platform.yml | `platforms.<이름>.prompt` |

도구는 위 YAML의 해당 키 값을 읽어 시스템 역할·프롬프트로 주입합니다.  
Markdown 문서는 **동일 내용을 사람이 읽기 쉽게 요약**한 것입니다.
