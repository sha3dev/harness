---
name: architecture
description: Define compact architecture rules for simple, modular projects with
  clear app, feature, and package boundaries.
origin: harness
---

# Architecture Principles

This skill defines the architecture baseline for projects we create or modify.
Architecture must stay simple, modular, and proportional to the current problem.

## When to Use

- Creating or reviewing project structure.
- Adding features, packages, services, repositories, controllers, schemas, or mappers.
- Deciding whether to add abstractions, files, layers, or shared code.
- Refactoring code with unclear boundaries or scattered responsibilities.

## Core Rules

- **Simplicity Is Mandatory**: Choose the smallest correct structure that works.
- **No Speculative Design**: Do not add layers, wrappers, factories, interfaces, or extension points for hypothetical future needs.
- **Boundaries Still Matter**: Simplicity must not collapse distinct responsibilities into unclear code.
- **Independent Capabilities Become Packages**: A cohesive capability that can work independently should live as a named internal package.
- **Less Indirection Wins**: If two designs are correct, choose the less abstract and less indirect one.

## Layout

- Keep root tooling configuration at the project root.
- Use `src/index.ts` as the source entrypoint when applicable.
- Separate application code from internal packages.
- Put application composition, wiring, and features under `src/app/`.
- Put independent packages under `src/packages/`; never place them beside app features.
- Use singular, domain-specific folder names.
- Use `src/shared/` only when multiple app features or packages actually need the same code.
- Keep application configuration centralized in `src/app/config.ts` when needed.

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

Prefer many small, cohesive packages over scattered logic. A package should
represent one real domain or technical capability, own its internals, and expose
a small public API.

Default package shape:

```text
src/packages/<package>/
  index.ts
  config.ts
  test/
```

Add role files only when they have a real responsibility:

- `<package>.service.ts`
- `<package>.repository.ts`
- `<package>.controller.ts`
- `<package>.schema.ts`
- `<package>.mapper.ts`
- `<package>.types.ts`
- `<package>.constants.ts`

Rules:

- `index.ts` is the public API.
- `config.ts` owns package-specific configuration and defaults.
- `test/` contains the smallest useful test set for the package.
- Test only essential behavior, boundaries, and regressions; avoid test volume that does not improve confidence.
- Do not import internal files from outside the package.
- Keep external integrations and side effects behind the package API.
- Keep package-specific types inside the package.
- Move code to `src/shared/` only after multiple packages or features actually need it.
- Avoid deep nesting; if nesting grows, split independent capabilities into separate packages.

## Naming

- Use English technical and domain terms.
- Use `kebab-case` for files and directories.
- Use singular feature and package names.
- Use explicit role-based file names such as `<feature>.service.ts`, `<feature>.repository.ts`, and `<feature>.schema.ts`.
- Avoid vague names such as `data`, `obj`, `tmp`, `val`, `thing`, `manager`, `handler`, `helper`, `utils`, and `common`.

## Decision Check

Before adding structure or abstraction, ask:

- Does this solve a real requirement now?
- Does it clarify ownership or remove real duplication?
- Can this capability be used, tested, or reasoned about independently?
- Will the result be easier to understand?

If the answer is not clearly yes, do not add it.

## Anti-Patterns

- Creating architecture before there is a problem that needs it.
- Scattering one cohesive capability across unrelated files.
- Creating interfaces with only one implementation.
- Creating factories without multiple real construction paths.
- Making simple code generic too early.
- Splitting files only to make files smaller when the responsibility is the same.
