---
name: typescript-style
description: Strict TypeScript style rules for class-first, sectioned source and tests.
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
- Prefer compact statements: move complex subexpressions into clearly named intermediate values so the main operation stays easy to scan.
- If a function needs many inputs, define a named `<FunctionName>Options` type and pass a single `options` parameter.

### Rule Strength

- Treat these rules as requirements for new or edited TypeScript unless they conflict with an external contract or with a stronger project skill.
- External contracts include database column names, third-party payloads, public API shapes, and generated types.
- Keep external contract shapes at the boundary. Map them into idiomatic TypeScript names before they enter application logic.
- If a rule is intentionally skipped, mention the reason in the final response.

## Class-First Source Modules

All `src/**/*.ts` implementation files must expose behavior through a public class named after the file responsibility. One public class per file.

- Prefer instance methods by default. Use static methods only for stateless pure operations where constructing the class would add no value.
- Keep module-scope helper functions private, small, and below the class. Do not export helpers directly; expose behavior through the public class.
- Barrel or composition files (`index.ts`) may export small functions only to wire classes together. They must not contain implementation logic.

### Allowed Exceptions

These file types do not require a class: type-only files (`*.types.ts`), barrel files (`index.ts`), CLI scripts under `scripts/`, tests, and tiny config modules whose only job is reading environment values.

### File Cohesion

Split files when they mix responsibilities, hide important behavior, or make the public class difficult to review. Extract by stable responsibility (parsing, mapping, persistence, orchestration, external integration). Avoid splitting merely to satisfy a size target.

## Section Markers

Every `src/**/*.ts` implementation file must be organized with JSDoc `@section` markers. Add a marker only for sections that have content; do not add empty sections.

Format:

```ts
/**
 * @section <name>
 */
```

Sections in order:

1. `imports:externals`
2. `imports:internals`
3. `consts`
4. `types`
5. `class` — immediately before the exported class declaration
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

Files without a class (allowed exceptions) still use applicable markers such as `imports:*`, `types`, `consts`, and `public:methods`.

### Example

```ts
/**
 * @section imports:externals
 */

import type { Client } from "some-client";

/**
 * @section imports:internals
 */

import type { Item } from "./item.types.js";

/**
 * @section class
 */

export class ItemRepository {
  /**
   * @section constructor
   */

  public constructor(private readonly client: Client) {}

  /**
   * @section public:methods
   */

  public async findById(id: string): Promise<Item | null> {
    return null;
  }

  /**
   * @section private:methods
   */

  private mapRow(row: ItemRow): Item {
    return row;
  }
}
```

## Boundary Naming

- Use camelCase for all TypeScript identifiers (properties, variables, methods).
- Never define application types with raw external names (e.g., `USR_id`). Alias external names to camelCase at the boundary (SQL aliases, mapper functions).
- If a boundary-only type must mirror an external shape, suffix it with `Raw`, `Payload`, or `External`.

See `db-naming` skill for SQL-side conventions.

## Logging

- CLI entrypoints may use `console.error` for progress and fatal errors.
- Application code should prefer a small local logger or injected logging function.
- Do not add a logging abstraction only for one or two messages; add it when multiple files need consistent output.

## Tests

- Add focused tests for behavior, boundaries, and regressions.
- Do not add large test suites that only restate implementation details.
- Tests may use `node:test` functions directly; they do not need wrapper classes.

## Pre-Completion Checklist

Before finishing TypeScript work:

1. Review every touched source file for class-first and section-marker compliance. Any file without a public class must be an allowed exception — call it out in the final response.
2. Run `npm run typecheck` when available.
3. Run focused tests for changed behavior when available.
4. Run the project formatter/linter command when available.
5. If any check cannot run, say why in the final response.
