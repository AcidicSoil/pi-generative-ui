# Suggested commands

## General
- `ls`
- `find . -maxdepth 3 -type f`
- `grep -R "pattern" .`
- `git status`
- `git diff`

## Project setup / install
- `npm install`
- `pi install git:github.com/Michaelliv/pi-generative-ui` (from README, for installing the extension through pi)

## Inspecting the package
- `cat package.json`
- `cat README.md`

## Notes
- No npm scripts for test, lint, or format are currently declared in `package.json`.
- No dedicated automated test command is documented in the repo as currently checked in.
- Because the package is OS-sensitive and depends on Glimpse behavior, manual runtime verification is likely required for platform-porting changes.