#!/usr/bin/env bash
# Publishes the Montana Movers site to GitHub Pages:
#   https://montanamoversmt.com/ (custom domain; repo thomasg42/montana-movers)
# Run from Thomas's own Terminal only, and only when he says publish.
#
# The June 2026 demo is currently served from the repo root with a fake 555
# number and invented reviews. This script replaces it (no archive tag, per Thomas)
# FIRST, then publishes main:/docs.
set -euo pipefail

SRC="$HOME/Documents/FGA-Brain/FGA-AIOS/clients/montana-movers/website"
REPO="thomasg42/montana-movers"
WORK="$HOME/Documents/montana-movers-site"
URL="https://montanamoversmt.com/"

cd "$SRC"
echo "1/6 Building..."
node build.mjs
echo "2/6 Testing (stops here if anything fails)..."
node --test tests/site.test.mjs > /tmp/montana-movers-tests.txt 2>&1 || { tail -40 /tmp/montana-movers-tests.txt; echo "Tests failed. Nothing was published."; exit 1; }
grep -E "^# (pass|fail)" /tmp/montana-movers-tests.txt || true

echo "3/6 GitHub repo..."
gh auth status >/dev/null 2>&1 || { echo "GitHub CLI is not logged in. Run: gh auth login   then run this script again."; exit 1; }
if gh repo view "$REPO" >/dev/null 2>&1; then
  echo "   Repo exists: https://github.com/$REPO"
else
  echo "   Repo $REPO is missing. Stop. Thomas creates it or we keep the existing demo repo."
  exit 1
fi
if [ ! -d "$WORK/.git" ]; then
  gh repo clone "$REPO" "$WORK" -- -q
fi
gh auth setup-git >/dev/null 2>&1 || true

echo "4/6 Syncing the repo (the June demo is replaced, not kept)..."
cd "$WORK"
git fetch origin --quiet
git checkout -q -B main
git pull --ff-only origin main >/dev/null 2>&1 || true

echo "5/6 Pushing the new site (review/ stays local)..."
rsync -a --delete --exclude .git --exclude node_modules --exclude .DS_Store --exclude .claude --exclude review "$SRC/" "$WORK/"
cd "$WORK"
git add -A
if git diff --cached --quiet && git rev-parse -q --verify HEAD >/dev/null; then
  echo "   No changes since the last deploy."
else
  git commit -q -m "Deploy $(date +%Y-%m-%d\ %H:%M)"
fi
git push -u origin main

echo "6/6 GitHub Pages source -> main:/docs..."
if gh api "repos/$REPO/pages" >/dev/null 2>&1; then
  gh api -X PUT "repos/$REPO/pages" -f "source[branch]=main" -f "source[path]=/docs" >/dev/null
  echo "   Pages source set to main:/docs."
else
  gh api -X POST "repos/$REPO/pages" -f "source[branch]=main" -f "source[path]=/docs" >/dev/null
  echo "   Pages turned on at main:/docs."
fi

code=000
for _ in $(seq 1 30); do
  code=$(curl -sL -o /dev/null -w "%{http_code}" "$URL" || true)
  [ "$code" = "200" ] && break
  sleep 10
done
if [ "$code" = "200" ]; then
  echo "LIVE (preview, hidden from Google until launched: true): $URL"
  echo "Add this URL to FGA-AIOS/command-center/registry.json in the same piece of work (bubble montana-movers, note: noindex preview, replaces June 2026 demo)."
else
  echo "Pushed, but Pages answered HTTP $code after 5 minutes. Check https://github.com/$REPO/settings/pages"
fi
