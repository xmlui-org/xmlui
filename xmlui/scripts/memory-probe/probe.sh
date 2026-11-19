#!/bin/bash
# Measure XMLUI's renderer memory as a synthetic app grows. See README.md.
#
#   BUNDLE=/path/to/xmlui-standalone.umd.js xmlui/scripts/memory-probe/probe.sh [variant ...]
#
# A variant is ROWS:COMPILE[:MODE], MODE being unmounted, tabsK-named or tabsK-absent,
# e.g. 0:on 400:off 400:on:unmounted 0:on:tabs17-named 0:on:tabs17-absent.
# Defaults: 0:on 0:off 400:on 400:off. Env: RUNS (3), SETTLE (180 s),
# EVERY (30 s), PORT (8731), OUT (a temp folder), HEADLESS (unset = headed).

set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
BUNDLE="${BUNDLE:-$HERE/../../dist/standalone/xmlui-standalone.umd.js}"
RUNS="${RUNS:-3}"
SETTLE="${SETTLE:-180}"
EVERY="${EVERY:-30}"
PORT="${PORT:-8731}"
OUT="${OUT:-$(mktemp -d -t xmlui-memory-probe)}"
VARIANTS=("$@")
[ ${#VARIANTS[@]} -eq 0 ] && VARIANTS=(0:on 0:off 400:on 400:off)

[ -f "$BUNDLE" ] || { echo "no bundle at $BUNDLE (set BUNDLE)" >&2; exit 2; }
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "port $PORT is in use (set PORT)" >&2; exit 2
fi

echo "bundle: $BUNDLE ($(shasum -a 256 "$BUNDLE" | cut -c1-16)…)"
echo "out: $OUT  runs: $RUNS  settle: ${SETTLE}s"

for v in "${VARIANTS[@]}"; do
  IFS=: read -r rows compile mode <<<"$v"
  name="r${rows}-${compile}${mode:+-$mode}"
  extra=()
  case "$mode" in
    "") ;;
    unmounted) extra=(--unmounted) ;;
    tabs*-named|tabs*-absent)
      k="${mode#tabs}"; k="${k%-*}"
      extra=(--tabs "$k" --tabs-mode "${mode##*-}") ;;
    *) echo "unknown mode '$mode' in variant $v" >&2; exit 2 ;;
  esac
  node "$HERE/gen-app.mjs" "$OUT/apps/$name" --rows "$rows" --compile "$compile" \
    ${extra[@]+"${extra[@]}"} --bundle "$BUNDLE"
done

python3 -I -m http.server "$PORT" --bind 127.0.0.1 --directory "$OUT/apps" >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
sleep 1

: >"$OUT/results.jsonl"
for v in "${VARIANTS[@]}"; do
  IFS=: read -r rows compile mode <<<"$v"
  name="r${rows}-${compile}${mode:+-$mode}"
  for run in $(seq 1 "$RUNS"); do
    echo "$(date +%H:%M:%S) $name run $run"
    node "$HERE/measure.cjs" "http://127.0.0.1:$PORT/$name/" "$name#$run" \
      --settle "$SETTLE" --every "$EVERY" ${HEADLESS:+--headless} | tee -a "$OUT/results.jsonl"
  done
done

node -e '
const rows = require("fs").readFileSync(process.argv[1], "utf8").trim().split("\n").map(JSON.parse);
const by = {};
for (const r of rows) (by[r.label.split("#")[0]] ??= []).push(r);
console.log("\nvariant              median MB (runs)          rendered  DOM nodes");
for (const [k, rs] of Object.entries(by)) {
  const m = rs.map((r) => r.medianMB).sort((a, b) => a - b);
  console.log(k.padEnd(20), String(m[Math.floor(m.length / 2)]).padStart(5), ("(" + m.join(", ") + ")").padEnd(20),
    String(rs.every((r) => r.rendered)).padEnd(9), rs[0].domNodes);
}
' "$OUT/results.jsonl"
echo "results: $OUT/results.jsonl"
