#!/usr/bin/env bash
# Local-only 12s scrub clip with beat markers. Saved under review/test-clip/.
# Never copied into docs/ unless someone passes --test-clip to build.mjs.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
python3 "$HERE/tools/make-test-clip.py"
ls -lh "$HERE/review/test-clip"
