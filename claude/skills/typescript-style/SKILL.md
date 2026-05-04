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
- Add abstractions (wrappers, interfaces, factories, helpers, option objects) only for a current need, never speculatively.
- Write the shortest clear implementation. Avoid verbose patterns, unnecessary temporaries, and boilerplate that adds length but not clarity.
- Prefer single-return functions. Use early returns only for guard clauses at the top.
- If a function needs many inputs, define a `<FunctionName>Options` type and pass a single `options` parameter.

### Visual Rhythm

Code must be visually tight, uniform, and easy to scan. Biome enforces an 80-character line width — write code that fits naturally, not code that gets force-wrapped.

- **No blank lines inside function bodies** unless separating two distinct logical blocks. One blank line maximum, never two.
- **No blank lines after opening braces or before closing braces.**
- **Keep every line short.** If a line approaches 80 characters, the expression is doing too much. Decompose it into named intermediate values so each line is a short, self-contained statement. Never break a single expression across lines.
- **Prefer dense expressions.** Use ternaries, short-circuits, nullish coalescing, and chained calls when they read naturally.
- **Group related statements tightly.** Unrelated logic belongs in a different method, not after a blank line.
- **One blank line between methods.** No more, no less.

Avoid:

```ts
public async processUserOrder(userId: string, orderId: string, options: ProcessOptions): Promise<OrderResult> {
  const user = await this.userRepository.findByIdOrThrow(userId, { includePreferences: true, includePaymentMethods: true });

  const order = await this.orderRepository.findByIdWithItems(orderId, { status: "pending", includeDiscounts: options.applyDiscounts });

  const result = await this.paymentService.charge(user.defaultPaymentMethod, order.totalWithDiscounts, { currency: order.currency, idempotencyKey: options.idempotencyKey });

  return result;
}
```

Prefer:

```ts
public async process(userId: string, orderId: string, options: ProcessOptions): Promise<OrderResult> {
  const include = { includePreferences: true, includePaymentMethods: true };
  const user = await this.users.findByIdOrThrow(userId, include);
  const pending = { status: "pending" as const, includeDiscounts: options.applyDiscounts };
  const order = await this.orders.findWithItems(orderId, pending);
  const { currency, idempotencyKey } = order;
  const charge = { currency, idempotencyKey };
  return this.payments.charge(user.defaultPaymentMethod, order.total, charge);
}
```

### Rule Strength

- These rules are requirements unless they conflict with an external contract (database columns, third-party payloads, public API shapes, generated types) or a stronger project skill.
- Keep external contract shapes at the boundary. Map them to idiomatic TypeScript before they enter application logic.
- If a rule is intentionally skipped, state the reason in the final response.

## Class-First Source Modules

One public class per `src/**/*.ts` implementation file, named after the file responsibility.

- Prefer instance methods. Use static only for stateless pure operations where constructing the class adds no value.
- Never place standalone functions in a file that has a class. All logic belongs to the class as methods.
- Barrel files (`index.ts`) may export small wiring functions. They must not contain implementation logic.

### Auxiliary Resource Files

Non-TypeScript content (SQL, templates, schemas) goes in a companion directory named after the source file:

```text
user.repository.ts
user.repository/
  find-by-id.sql
  find-active.sql
```

Import these from the class; never inline large non-TS blocks as template literals.

### Allowed Exceptions

Files that do not require a class: `*.types.ts`, `index.ts` barrels, `scripts/`, tests, and tiny config modules that only read environment values.

### File Cohesion

Split when a file mixes responsibilities or hides important behavior. Extract by stable responsibility (parsing, mapping, persistence, orchestration). Do not split merely to satisfy a size target.

## Section Markers

Organize every `src/**/*.ts` implementation file with `@section` markers. Only add sections that have content. Sections must appear in this order — never reorder:

```ts
/** @section <name> */
```

1. `imports:externals` 2. `imports:internals` 3. `consts` 4. `types` 5. `class` 6. `private:attributes` 7. `protected:attributes` 8. `public:properties` 9. `constructor` 10. `static:properties` 11. `factory` 12. `private:methods` 13. `protected:methods` 14. `public:methods` 15. `static:methods`

Files without a class still use applicable markers (`imports:*`, `types`, `consts`, `public:methods`).

### Example

```ts
/** @section imports:externals */

import type { Client } from "some-client";

/** @section imports:internals */

import type { Item } from "./item.types.js";

/** @section class */

/** Persists and retrieves items. */
export class ItemRepository {
  /** @section constructor */

  public constructor(private readonly client: Client) {}

  /** @section public:methods */

  /** Finds an item by its unique identifier. */
  public async findById(id: string): Promise<Item | null> {
    return null;
  }

  /** @section private:methods */

  private mapRow(row: ItemRow): Item {
    return row;
  }
}
```

## JSDoc

- Every exported class and every public/protected method must have a single-line JSDoc describing its purpose.
- Private methods, constructors, and self-explanatory one-liners do not need JSDoc.
- Use multi-line JSDoc only when parameters or return values need clarification.

## Boundary Naming

- camelCase for all TypeScript identifiers.
- Never use raw external names (e.g., `USR_id`) in application types. Alias at the boundary.
- Boundary-only types that mirror an external shape: suffix with `Raw`, `Payload`, or `External`.

See `db-naming` skill for SQL-side conventions.

## Logging

- CLI entrypoints may use `console.error` for progress and fatal errors.
- Application code: prefer a small local logger or injected logging function. Add a logging abstraction only when multiple files need consistent output.

## Tests

- Focused tests for behavior, boundaries, and regressions. No large suites that restate implementation details.
- Tests may use `node:test` directly; no wrapper classes needed.

## Pre-Completion Checklist

1. Review touched files for class-first and section-marker compliance. Call out any exceptions.
2. Run `npm run typecheck` when available.
3. Run focused tests for changed behavior.
4. Run the project formatter/linter.
5. If any check cannot run, say why.
