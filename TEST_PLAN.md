# Multi-Model Ralph Loop Test Plan

## 목적

동일한 PRD를 여러 LLM 모델에서 실행하여 ralph-loop의 모델별 성능을 비교 평가한다.

## 대상 모델

| # | 모델 | agy `--model` 값 | 우선순위 |
|---|------|-------------------|----------|
| 1 | Claude Sonnet 4.6 (Thinking) | `Claude Sonnet 4.6 (Thinking)` | **완료** (baseline) |
| 2 | Gemini 3.5 Flash (High) | `Gemini 3.5 Flash (High)` | 다음 |
| 3 | Gemini 3.1 Pro (High) | `Gemini 3.1 Pro (High)` | 이후 |

필요 시 추가 가능: `Gemini 3.5 Flash (Low)`, `Gemini 3.1 Pro (Low)`, `GPT-OSS 120B (Medium)`

## 실행 방법

### 1. 브랜치 분리

모델별로 독립 브랜치를 만들어 실행한다. PRD와 ralph.sh는 공유하되, 결과물은 분리.

```bash
# baseline 커밋 (PRD + ralph.sh + scaffold만 있는 시점)으로 돌아가서 분기
BASE_COMMIT=$(git log --oneline --all | grep 'Ralph loop PRD' | head -1 | cut -d' ' -f1)

# Gemini 3.5 Flash 브랜치
git checkout -b run/gemini-3.5-flash "$BASE_COMMIT"
# progress.txt 초기화
git checkout HEAD -- progress.txt
git commit --allow-empty -m "chore: start Gemini 3.5 Flash run"

# Gemini 3.1 Pro 브랜치
git checkout -b run/gemini-3.1-pro "$BASE_COMMIT"
git checkout HEAD -- progress.txt
git commit --allow-empty -m "chore: start Gemini 3.1 Pro run"
```

### 2. 실행

```bash
# Gemini 3.5 Flash
git checkout run/gemini-3.5-flash
RALPH_MODEL="Gemini 3.5 Flash (High)" bash ralph.sh

# Gemini 3.1 Pro
git checkout run/gemini-3.1-pro
RALPH_MODEL="Gemini 3.1 Pro (High)" bash ralph.sh
```

`ralph.sh`는 `RALPH_MODEL` 환경변수를 읽으므로 코드 수정 없이 모델만 바꿔서 실행 가능.

### 3. 결과 브랜치 구조

```
main (또는 기본 브랜치)
├── run/claude-sonnet-4.6   ← baseline (현재 실행 완료)
├── run/gemini-3.5-flash    ← 예정
└── run/gemini-3.1-pro      ← 예정
```

## 평가 기준

### 정량 지표

| 지표 | 측정 방법 |
|------|-----------|
| 완료율 | 11개 태스크 중 `[x]` 완료 수 |
| 총 iteration 수 | ralph.sh 로그에서 iteration count |
| stall 횟수 | ralph.sh 로그의 `⚠` / `❌` 카운트 |
| 총 소요 시간 | 시작~종료 wall clock |
| 커밋 수 | `git log --oneline \| wc -l` (태스크당 1커밋이 이상적) |

### 정성 지표

| 지표 | 확인 방법 |
|------|-----------|
| 디자인 품질 | index.html 브라우저 열어서 시각적 비교 |
| PRD 준수도 | 디자인 디렉션 (Editorial/Swiss) 반영 여부 |
| 코드 품질 | 시맨틱 HTML, 토큰 사용, 애니메이션 규칙 준수 |
| 반응형 | 320/375/768/1024/1440 브레이크포인트 확인 |
| 접근성 | 키보드 내비, 포커스 링, 컬러 대비 |
| 커밋 위생 | 태스크별 1커밋, 메시지 포맷 준수 |

### 비교 매트릭스 (실행 후 작성)

| 항목 | Sonnet 4.6 | Gemini 3.5 Flash | Gemini 3.1 Pro |
|------|------------|------------------|----------------|
| 완료율 | /11 | /11 | /11 |
| iterations | | | |
| stalls | | | |
| 소요 시간 | | | |
| 디자인 점수 (1-5) | | | |
| 코드 품질 (1-5) | | | |
| 반응형 (1-5) | | | |
| 접근성 (1-5) | | | |

## 주의사항

- 각 모델 실행은 **clean state**에서 시작 (PRD 태스크 전부 `[ ]`, progress.txt 초기 상태)
- `--dangerously-skip-permissions`로 실행하므로 로컬 전용
- 모델별 rate limit이 다를 수 있음 — stall 시 `ralph.sh`가 자동 backoff (15초)
- Gemini 모델은 agy의 tool use 지원 여부에 따라 동작이 다를 수 있음 — 첫 실행 시 모니터링 필수
