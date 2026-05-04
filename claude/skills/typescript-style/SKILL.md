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
- Use classes for all implementation logic in `src/**/*.ts`.
- Prefer one public class per source file. Do not leave exported standalone functions in `src/**/*.ts` unless the file is an allowed exception.
- Allowed exceptions: type-only files (`*.types.ts`), barrel files (`index.ts` that only re-export or perform minimal composition), CLI scripts under `scripts/`, tests, and tiny config modules whose only job is reading environment values.
- Keep every `src/**/*.ts` file with implementation code organized with short JSDoc `@section` markers for every section that has content.
- Keep module-scope helper functions private, small, and below the class. Do not export helpers directly from implementation files; expose behavior through the public class.
- Keep files focused enough to scan as a single responsibility. When a file grows beyond that, split it along real ownership boundaries into role files or package-internal collaborators instead of grouping unrelated code or adding speculative layers.

## Rule Strength

- Treat these rules as requirements for new or edited TypeScript unless they conflict with an external contract or with a stronger project skill.
- External contracts include database column names, third-party payloads, public API shapes, and generated types.
- Keep external contract shapes at the boundary. Map them into idiomatic TypeScript names before they enter application logic.
- If a rule is intentionally skipped, mention the reason in the final response.

## Class-First Source Modules

When editing a `src/**/*.ts` implementation file, expose behavior through a public class named after the file responsibility.

Prefer instance methods by default. Use static methods only for stateless pure operations where constructing the class would add no value and the public API is clearer as `ClassName.method(...)`.

Barrel or composition files may export small functions only when their purpose is to wire classes together. They must not contain implementation logic.

## File Cohesion

Large files should be broken up when they mix responsibilities, hide important behavior, or make the public class difficult to review. Extract by stable responsibility such as parsing, mapping, persistence, orchestration, external integration, or shared private capability. Keep the public API intentional and avoid splitting merely to satisfy a size target.

## Options

If a function needs many inputs, define a named `<FunctionName>Options` type and pass a single `options` parameter.

## Class Sections

Use section markers in every `src/**/*.ts` implementation file. Add a section marker for each section that has content.

Do not add empty sections. If a file has only imports and one class, it still gets `imports:*`, `class`, and any class-member sections that apply.

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

If a file is an allowed exception and has no class, still use applicable section markers such as `imports:*`, `types`, `consts`, and `public:methods` for exported functions.

Example:

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

- Use camelCase for TypeScript properties, variables, methods, and local row aliases.
- Do not define application types with raw database column names such as `USR_id` or `ORD_status`.
- Alias SQL columns to camelCase in the query.
- Only use raw external names in SQL strings, parser selectors, or narrow boundary-only types when aliasing is not practical.
- If a boundary-only type must mirror an external shape, suffix it with `Raw`, `Payload`, or `External`.

Prefer:

```ts
type UserRow = {
  userId: string;
  displayName: string;
};

const result = await client.query<UserRow>(`
  SELECT
    "USR_id" AS "userId",
    "USR_display_name" AS "displayName"
  FROM user_account
`);
```

Avoid:

```ts
type UserRow = {
  USR_id: string;
  USR_display_name: string;
};
```

## Logging

- CLI entrypoints may use `console.error` for progress and fatal errors.
- Application and package code should prefer a small local logger or injected logging function when logging is needed.
- Do not add a logging abstraction only to satisfy lint for one or two messages; use it when multiple files or long-running processes need consistent output.

## Tests

- Add focused tests for behavior, boundaries, and regressions.
- Do not add large test suites that only restate implementation details.
- Tests may use `node:test` functions directly; they do not need wrapper classes.

## Audit Check

Before finishing a TypeScript refactor, review every touched source file for the class-first and section-marker rules. Any implementation file without a public class, or with exported standalone behavior, must be refactored or called out as an allowed exception in the final response.

## Completion Check

Before finishing TypeScript work:

- Run `npm run typecheck` when available.
- Run focused tests for changed behavior when available.
- Run the project formatter/linter command when available.
- If any check cannot run, say why in the final response.
