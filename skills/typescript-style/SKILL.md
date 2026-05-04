---
name: typescript-style
description: Concise TypeScript style rules for strict, simple code.
origin: harness
---

# TypeScript Style

Use this skill when writing or reviewing TypeScript source and tests.

## Rules

- Use TypeScript for source and tests when the project supports it.
- Avoid `any` unless there is no practical alternative.
- Prefer explicit return types for exported functions.
- Use type-only imports when possible.
- Always use braces in control flow.
- Throw plain `Error` by default; add custom error classes only when control flow depends on the error type.
- Add wrappers, interfaces, factories, helpers, and option objects only for a current need.
- Keep implementations direct until duplication or ownership pressure makes extraction useful.
- Prefer classes for domain and application logic.
- Prefer one public class per file when using classes.
- Keep class files organized with short JSDoc `@section` markers when the file is large enough to need visual structure.
- Keep module-scope helper functions small and local; move them only when multiple files need them.

## Options

If a function needs many inputs, define a named `<FunctionName>Options` type and pass a single `options` parameter.

## Class Sections

When using section markers, use this format:

```ts
/**
 * @section <name>
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

The `class` section appears immediately before the exported class declaration.

## Tests

- Add focused tests for behavior, boundaries, and regressions.
- Do not add large test suites that only restate implementation details.
