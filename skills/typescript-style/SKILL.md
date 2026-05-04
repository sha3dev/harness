---
name: typescript-style
description: Define concise TypeScript code style conventions for strict
  typing, pragmatic simplicity, and class organization.
origin: harness
---

# TypeScript Style Conventions

This skill defines the core code style rules for TypeScript projects. It keeps
code strict, readable, and simple without adding speculative architecture.

## When to Use

- Writing or reviewing TypeScript source code and tests.
- Deciding whether to extract helpers, abstractions, or shared types.
- Organizing classes, methods, imports, and internal code sections.
- Validating TypeScript implementation style before review.

## Core Rules

- **Strict TypeScript Only**: Use `.ts` files in `src/` and `test/`; avoid JavaScript source files there.
- **Simple by Default**: Choose the smallest correct implementation that solves the current requirement.
- **No Speculative Abstractions**: Add wrappers, factories, interfaces, helpers, or option objects only for a real current need.
- **Classes for Domain Logic**: Business/domain logic in `src/` should be implemented with classes by default.
- **One Public Class per File**: Feature files expose exactly one public class unless the file is `*.types.ts`.

## TypeScript Rules

- Avoid `any` unless there is no viable alternative.
- Prefer explicit return types for exported functions.
- Use type-only imports when possible.
- Throw plain `Error` by default; use custom error types only when control flow depends on them.
- If a function needs many inputs, define a named `<FunctionName>Options` type and pass a single `options` parameter.
- Always use braces in control flow.
- Keep helper logic inside the class as private or static methods when a file exposes a public class.
- Split oversized classes into smaller cohesive classes with clear roles.
- `src/config.ts` must default-export `config` and be imported as `import config from ".../config.ts"`.

## Class File Sections

Class-oriented files use 3-line JSDoc section markers in this format:

```ts
/**
 * @section <block-name>
 */
```

Use only sections that have content, in this order:

1. `imports:externals`
2. `imports:internals`
3. `consts`
4. `types`
5. `class`
6. `private:attributes`
7. `protected:attributes`
8. `public:properties`
9. `constructor`
10. `static:properties`
11. `factory`
12. `private:methods`
13. `protected:methods`
14. `public:methods`
15. `static:methods`

The `class` section must appear immediately before the exported class declaration.

## Standards Admission

- New rules in `resources/ai/rule-catalog.json` require a normative source in `standards/*`.
- Every new rule must declare ownership, positive and negative fixtures, and a non-overlap decision for generic tooling.

## Anti-Patterns to Avoid

- Adding abstractions for possible future scenarios.
- Using module-scope helper functions in files centered on a public class.
- Creating JavaScript source files in `src/` or `test/`.
