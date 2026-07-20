# antigravity-ralph-loop-test

Google **Antigravity**의 헤드리스 CLI(`agy`)로 **Ralph Loop**를 돌려보는 테스트 레포입니다.
목표 산출물은 `PRD.md`에 정의된 **의존성 없는 정적 랜딩 페이지**(순수 HTML/CSS/JS, 빌드 스텝 없음).

---

## Ralph Loop이 뭔가요?

LLM의 두 가지 근본 문제를 파일 기반으로 해결하는 자율 코딩 기법입니다.

1. **컨텍스트 창 한계** — 작업 도중 중요한 맥락을 잊어버림
2. **지속적인 감독 필요** — 오래 자율로 일하지 못함

해결책: **메모리를 파일로 외부화**하고, **매 반복마다 새 세션(fresh context)** 으로 에이전트를 반복 실행합니다.

```
1. PRD.md 에서 태스크를 읽는다
2. progress.txt 로 진행 상황을 확인한다
3. 딱 1개 태스크만 완료한다
4. progress 를 append 한다 (절대 삭제 금지)
5. 커밋한다
6. 전부 끝나거나 최대 반복 횟수에 도달할 때까지 반복
```

핵심은 매 반복이 **죽었다 새로 뜨는 세션**이라는 점입니다. 대화 메모리가 아니라
디스크의 `PRD.md` + `progress.txt`에서 상태를 매번 다시 읽어오기 때문에 컨텍스트가 새어나가지 않습니다.

> ⚠️ `agy`의 대화형 세션이나 `--continue` / `--conversation`은 컨텍스트를 이어붙이므로
> **Ralph Loop이 아닙니다** (오히려 anti-Ralph). 반드시 아래 `ralph.sh`(= 반복적 `agy -p` 호출)로 돌리세요.

---

## 파일 구성

| 파일 | 역할 |
|------|------|
| `PRD.md` | **단일 진실 공급원(Source of Truth).** 11개 태스크 + 에이전트 운영 규칙 + 디자인 방향. 에이전트가 매 반복 이 파일을 다시 읽습니다. |
| `progress.txt` | append-only 진행 로그. 완료 태스크마다 한 줄씩 추가되고, 전부 끝나면 `ALL TASKS COMPLETE`가 기록됩니다. |
| `ralph.sh` | 루프 러너. `agy -p`를 매 반복 새 세션으로 호출하며, **실패 감지 + 정체(stall) 감지**로 안전하게 멈춥니다. |

---

## 요구 사항

- macOS + [Antigravity](https://antigravity.google) 설치 (헤드리스 CLI `agy` 포함)
- `agy`가 PATH에 있어야 함 (기본 위치: `~/.local/bin/agy`)
- git 레포 (커밋이 발생하므로)

`agy` 동작 확인:
```bash
agy models          # 사용 가능한 모델 목록
agy -p "reply OK"   # 헤드리스 단발 실행 테스트
```

---

## 실행 방법

```bash
cd ~/Documents/github/antigravity-ralph-loop-test
bash ralph.sh
```

루프가 태스크 1번부터 하나씩 완료 → `[x]` 체크 → `progress.txt` append → 커밋 →
`ALL TASKS COMPLETE`가 나오면 자동 종료합니다.

**중간에 멈추기:** `Ctrl+C`

### 옵션 (환경변수)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `RALPH_MODEL` | `Claude Sonnet 4.6 (Thinking)` | 사용할 모델 |
| `RALPH_MAX_ITERS` | `15` | 최대 반복 횟수 (안전 상한) |
| `RALPH_MAX_STALLS` | `2` | 연속 무진전/에러 몇 번이면 중단할지 |

```bash
RALPH_MODEL="Gemini 3.1 Pro (High)" RALPH_MAX_ITERS=20 bash ralph.sh
```

> 이 PRD는 "generic 템플릿 금지 / editorial-Swiss / oklch 토큰 / 접근성" 같은
> **디자인 품질**을 요구합니다. `Gemini 3.5 Flash`류는 결과가 밋밋할 수 있으니
> `Claude Sonnet 4.6 (Thinking)` 또는 `Gemini 3.1 Pro (High)`를 권장합니다.

---

## `ralph.sh`의 안전장치

기본형 랄프 루프는 "완료 문자열이 안 나옴" 하나만 보고 나머지는 전부 성공으로 취급하는
해피패스입니다. 이 러너는 매 반복마다 다음을 판정합니다.

- **실패 감지** — `agy`의 종료 코드를 확인합니다. 크래시/타임아웃/레이트리밋이면
  그 반복을 "무진전"으로 분류합니다 (조용히 성공으로 넘기지 않음).
- **정체(stall) 감지** — 반복 전후로 완료된 태스크 수(`PRD.md`의 `[x]` 개수)와 git HEAD를
  스냅샷 비교합니다. 태스크가 실제로 하나도 완료되지 않았으면 정체로 봅니다.
- **연속 정체 시 중단** — 무진전/에러가 `RALPH_MAX_STALLS`번 연속되면 즉시 중단합니다.
  같은 태스크에 막혀 `MAX_ITERS`를 전부 태우는 상황을 방지합니다.
- **실패 시 백오프** — 정체/에러 뒤에는 대기 시간을 늘려 레이트리밋 회복을 돕습니다.

---

## ⚠️ 주의

`ralph.sh`는 `--dangerously-skip-permissions`를 사용합니다 (자율 실행이라 매번
권한을 물으면 루프가 멈추기 때문). **이 테스트 레포에서는 괜찮지만**, 실제 프로젝트에
쓸 때는 이 플래그의 위험(임의 도구 실행 무제한 승인)을 반드시 고려하세요.
가능하면 `--sandbox` + 별도 git worktree(문제 시 `git reset --hard`로 복구)에서 돌리는 것을 권장합니다.

---

## 라이선스

[MIT](LICENSE)
