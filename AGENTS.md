# Agent Instructions

Use the files in `skills/` as the project baseline. Read only the skills relevant to the current task.

- Use `skills/architecture/SKILL.md` for structure, boundaries, packages, and refactors.
- Use `skills/typescript-style/SKILL.md` for TypeScript source and tests.
- Use `skills/db-naming/SKILL.md` for SQL schemas, migrations, indexes, and constraints.
- Use `skills/playwright-local-canary/SKILL.md` when browser automation should reuse local Chrome Canary.

Prefer the smallest correct change. Do not add speculative abstractions, unrelated refactors, or new tools unless the task needs them now.

Useful commands:

```sh
npm run harness:check
npm run harness:open-chrome-canary
npm run harness:publish
```
