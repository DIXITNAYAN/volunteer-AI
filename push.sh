#!/bin/bash
git remote remove origin 2>/dev/null
git remote add origin https://github.com/DIXITNAYAN/volunteer-AI.git
git add .
git commit -m "Smart Volunteer Allocation System - full build"
git branch -M main
git push -u origin main
