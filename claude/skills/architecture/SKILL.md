---
name: architecture
description: Compact architecture rules for simple, modular TypeScript projects.
origin: harness
---

# Architecture

Use this skill when creating structure, adding features, splitting packages, or reviewing boundaries.

## Rules

- Choose the smallest structure that solves the current requirement.
- Do not add layers, wrappers, factories, interfaces, or extension points for hypothetical future needs.
- Keep responsibilities clear; simple code should still have obvious ownership.

## Project Layout

```text
src/
  index.ts
  app/
    config.ts
    <feature>/
  packages/
    <package>/
      index.ts
      config.ts
      test/
```

- `src/app/` — application composition and features.
- `src/packages/` — independent reusable capabilities.
- `src/shared/` — only for small, domain-neutral primitives used by multiple places. Prefer a package when the code has clear ownership.
- Root — tooling configuration files.

## Packages

- A package represents one real domain or technical capability.
- `index.ts` is the sole public API. Keep internals private; never import package internals from outside.
- Keep external integrations and side effects behind the package API.
- Add role files only when the responsibility exists: `<name>.service.ts`, `<name>.repository.ts`, `<name>.controller.ts`, `<name>.schema.ts`, `<name>.mapper.ts`, `<name>.types.ts`.

## Naming

- `kebab-case` for files and directories.
- Singular feature and package names.
- English technical and domain terms.
- Avoid vague names: `manager`, `handler`, `helper`, `utils`, `common`, `data`, `obj`, `tmp`, `val`, `thing`.

## Decision Check

Before adding structure or abstraction:

1. Does this solve a real requirement now?
2. Does it clarify ownership or remove real duplication?
3. Can this capability be tested or reasoned about independently?

If the answer is not clearly yes, keep the design simpler.
