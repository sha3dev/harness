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
- Put application composition and features under `src/app/`.
- Put independent reusable capabilities under `src/packages/`.
- Prefer a package over `src/shared/` for reusable behavior with ownership.
- Use `src/shared/` only for small, domain-neutral primitives used by multiple places.
- Keep root tooling configuration at the project root.

Default shape:

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

## Packages

- A package represents one real domain or technical capability.
- `index.ts` is the public API.
- Keep internals private to the package.
- Do not import package internals from outside the package.
- Keep external integrations and side effects behind the package API.
- Add role files only when the responsibility exists: `<name>.service.ts`, `<name>.repository.ts`, `<name>.controller.ts`, `<name>.schema.ts`, `<name>.mapper.ts`, `<name>.types.ts`.

## Naming

- Use English technical and domain terms.
- Use `kebab-case` for files and directories.
- Use singular feature and package names.
- Avoid vague names such as `manager`, `handler`, `helper`, `utils`, `common`, `data`, `obj`, `tmp`, `val`, and `thing`.

## Decision Check

Before adding structure or abstraction, ask:

- Does this solve a real requirement now?
- Does it clarify ownership or remove real duplication?
- Can this capability be tested or reasoned about independently?

If the answer is not clearly yes, keep the design simpler.
