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
