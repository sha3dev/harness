---
name: architecture
description: Compact architecture rules for simple, modular TypeScript projects.
origin: harness
---

# Architecture

Use this skill when creating structure, adding features, splitting packages, or reviewing boundaries.

## Rules

- Choose the smallest structure that solves the current requirement.
- No layers, wrappers, factories, interfaces, or extension points for hypothetical needs.
- Simple code should still have obvious ownership.

## Project Layout

```text
src/
  index.ts
  app/           — composition and features
    config.ts
    <feature>/
  packages/      — independent reusable capabilities
    <package>/
      index.ts
      config.ts
      test/
```

- `src/shared/` — only for small, domain-neutral primitives used by multiple places. Prefer a package when the code has clear ownership.
- Root — tooling configuration files.

## Packages

- One real domain or technical capability per package.
- `index.ts` is the sole public API. Never import package internals from outside.
- External integrations and side effects stay behind the package API.
- Role files only when the responsibility exists: `<name>.service.ts`, `<name>.repository.ts`, `<name>.controller.ts`, `<name>.schema.ts`, `<name>.mapper.ts`, `<name>.types.ts`.

## Naming

- `kebab-case` for files and directories.
- Singular feature and package names.
- English technical and domain terms.
- Avoid: `manager`, `handler`, `helper`, `utils`, `common`, `data`, `obj`, `tmp`, `val`, `thing`.

## Decision Check

Before adding structure or abstraction:

1. Does this solve a real requirement now?
2. Does it clarify ownership or remove real duplication?
3. Can it be tested or reasoned about independently?

If not clearly yes, keep it simpler.
