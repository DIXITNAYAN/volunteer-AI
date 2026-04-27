#!/bin/bash
# Run: bash push.sh YOUR_GITHUB_TOKEN
TOKEN=$1
if [ -z "$TOKEN" ]; then
  echo "Usage: bash push.sh YOUR_GITHUB_TOKEN"
  exit 1
fi
set -e
git config user.email "nayan@volunteer-ai.com"
git config user.name "DIXITNAYAN"
git remote remove origin 2>/dev/null || true
git remote add origin https://${TOKEN}@github.com/DIXITNAYAN/volunteer-AI.git
git add .
git commit -m "Smart Volunteer Allocation System - full build" || echo "Nothing new to commit"
git branch -M main
git push -u origin main
git remote set-url origin https://github.com/DIXITNAYAN/volunteer-AI.git
echo "Done! Code pushed to GitHub."
