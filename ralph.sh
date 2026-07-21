#!/usr/bin/env bash
# Ralph Loop runner for Antigravity (agy CLI)
# Each iteration = a FRESH agy session that re-reads PRD.md + progress.txt from disk,
# does exactly ONE task, marks it [x], appends progress, and commits.
#
# Hardened control loop:
#   - FAILURE detection : inspects agy's exit code; a crash/timeout/rate-limit is
#                         treated as a non-progress iteration, not a silent success.
#   - STALL detection   : snapshots checked-off task count (and git HEAD) before/after
#                         each iteration. If no task got completed, it's a stall.
#                         Aborts after RALPH_MAX_STALLS consecutive non-progress iters,
#                         instead of burning the whole MAX_ITERS budget on a stuck task.
set -uo pipefail
# Absolute path to this repo — agy does NOT inherit the shell cwd as its workspace,
# so we pass it explicitly via --add-dir AND bake it into the prompt.
REPO="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO"

MODEL="${RALPH_MODEL:-Gemini 3.1 Pro (High)}"
MAX_ITERS="${RALPH_MAX_ITERS:-15}"
MAX_STALLS="${RALPH_MAX_STALLS:-2}"   # consecutive no-progress/error iters before abort
PRD="PRD.md"
PROGRESS="progress.txt"

# Count only real checkbox task lines ("- [x] ..."), not literal `[x]` inside prose.
count_done() { grep -cE '^- \[x\]' "$PRD" 2>/dev/null || true; }

# First (double-quoted) chunk injects the absolute path; second (single-quoted) chunk
# keeps the literal double-quotes in the rules intact.
PROMPT="The project directory is: $REPO
All file reads, file writes, and git commits MUST happen inside that exact directory.
cd into it first, then read ./PRD.md and ./progress.txt there.
"'You are running ONE iteration of a Ralph Loop.
Follow the "Agent Operating Rules (Ralph Loop)" section of PRD.md EXACTLY:
- Do the single lowest-numbered unchecked "[ ]" task only.
- Verify it against its "Done when" criteria.
- Mark that task "[x]" in PRD.md.
- Append one line to progress.txt: "TASK <n> DONE — <one-line summary>" (never delete lines).
- Commit ONLY this task with message "feat: task <n> — <summary>".
- Do NOT start a second task. Stop after one.
- If every task is already "[x]", append "ALL TASKS COMPLETE" to progress.txt and stop.'

stalls=0
for i in $(seq 1 "$MAX_ITERS"); do
  echo "───────────────────────────── Ralph iteration $i / $MAX_ITERS  (model: $MODEL)"

  before_head="$(git rev-parse HEAD 2>/dev/null || echo none)"
  before_done="$(count_done)"; before_done="${before_done:-0}"

  agy -p "$PROMPT" \
      --model "$MODEL" \
      --add-dir "$REPO" \
      --mode accept-edits \
      --dangerously-skip-permissions \
      --print-timeout 15m 2>&1
  rc=$?

  after_head="$(git rev-parse HEAD 2>/dev/null || echo none)"
  after_done="$(count_done)"; after_done="${after_done:-0}"

  # --- completion: sentinel wins regardless of everything else ---
  if grep -q "ALL TASKS COMPLETE" "$PROGRESS" 2>/dev/null; then
    echo "✅ All tasks complete — stopping after $i iteration(s)."
    exit 0
  fi

  # --- classify this iteration: errored / advanced / stalled ---
  if [ "$rc" -ne 0 ]; then
    stalls=$((stalls + 1))
    echo "❌ agy exited non-zero (rc=$rc). Non-progress iteration ($stalls/$MAX_STALLS)."
  elif [ "$after_done" -gt "$before_done" ]; then
    [ "$after_head" != "$before_head" ] \
      && echo "✔ progress: tasks $before_done → $after_done, new commit $after_head." \
      || echo "✔ tasks $before_done → $after_done, but NO new commit (check commit hygiene)."
    stalls=0
  else
    stalls=$((stalls + 1))
    echo "⚠ no task completed this iteration (done stayed at $after_done). Stall ($stalls/$MAX_STALLS)."
  fi

  # --- abort if stuck ---
  if [ "$stalls" -ge "$MAX_STALLS" ]; then
    echo "🛑 Aborting after $stalls consecutive non-progress/error iterations."
    echo "   Inspect:  git -C \"$PWD\" log --oneline -5 ;  git status ;  tail progress.txt"
    exit 1
  fi

  # backoff: brief on progress, longer after a failure/stall (helps with rate limits)
  if [ "$stalls" -gt 0 ]; then sleep 15; else sleep 2; fi
done

echo "⚠️  Reached MAX_ITERS=$MAX_ITERS without ALL TASKS COMPLETE. Re-run to continue."
exit 1
