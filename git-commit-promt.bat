@echo off

clear
git status
git log --oneline -5
echo Automating Git commit...
node git-commit-prompt.js
git log --oneline -10