#!/bin/bash
set -e
source .env.push
git config user.email "nayan@volunteer-ai.com"
git config user.name "DIXITNAYAN"
git remote remove origin 2>/dev/null || true
git remote add origin https://${GITHUB_TOKEN}@github.com/DIXITNAYAN/volunteer-AI.git
git add .
git commit -m "Smart Volunteer Allocation System - full build" || echo "Nothing new to commit"
git branch -M main
git push -u origin main --force
git remote set-url origin https://github.com/DIXITNAYAN/volunteer-AI.git
echo "Done! Code pushed to GitHub."
