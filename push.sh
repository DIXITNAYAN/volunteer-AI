#!/bin/bash
# Run this script to push updates to GitHub
# Usage: bash push.sh
set -e
git add .
git commit -m "Update: Smart Volunteer Allocation System" || echo "Nothing new to commit"
git push origin main
echo "Done! Code pushed to GitHub."
