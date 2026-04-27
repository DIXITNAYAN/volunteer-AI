#!/bin/bash
set -e
git config user.email "nayan@volunteer-ai.com"
git config user.name "DIXITNAYAN"
git remote remove origin 2>/dev/null || true
git remote add origin https://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@github.com/DIXITNAYAN/volunteer-AI.git
git add .
git commit -m "Smart Volunteer Allocation System - full build" || echo "Nothing new to commit"
git branch -M main
git push -u origin main
echo "Done! Code pushed to GitHub."
