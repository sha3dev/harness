---
name: db-naming
description: Define consistent database naming conventions for SQL schemas,
  migrations, constraints, indexes, and foreign keys using snake_case, singular
  table names, and 3-letter uppercase column prefixes.
origin: harness
---

# Database Naming Conventions

This skill defines a consistent naming system for relational database schemas,
migrations, and DDL. It standardizes table names, column names, prefixes,
foreign keys, and constraints so schema changes remain predictable and easy to
review.

## When to Use

- Designing new SQL tables, columns, indexes, or constraints.
- Writing or reviewing database migrations.
- Refactoring an existing schema toward a consistent naming convention.
- Validating foreign key and join table naming before implementation.

## Core Rules

- **snake_case Everywhere**: Use `snake_case` for tables, columns, constraints, and indexes.
- **Singular Table Names**: Use `agent`, not `agents`.
- **3-Letter Column Prefixes**: Every column begins with an uppercase 3-letter prefix derived from its table.
- **Referenced Prefix for FKs**: Foreign keys use the referenced table prefix, not the current table prefix.
- **Predictable Constraint Names**: Indexes, unique constraints, and FKs follow fixed patterns.

## Naming Format

Use singular, descriptive table names in `snake_case`.

- Correct: `agent`, `task_dependency`, `project`
- Incorrect: `agents`, `TaskDependency`, `projectItems`

Columns use this format:

```text
<PREFIX>_<column_name>
```

Prefixes are 3-letter uppercase identifiers derived from the table name.

- `agent` -> `AGN`
- `project` -> `PRJ`
- `task` -> `TSK`

If a collision occurs, choose a distinct variation and document it in the
registry.

Common column patterns:

- Primary key: `<PREFIX>_id`
- Created timestamp: `<PREFIX>_created_at`
- Updated timestamp: `<PREFIX>_updated_at`
- Soft delete timestamp: `<PREFIX>_deleted_at`

Foreign key patterns:

Use the prefix of the referenced table, never the current table.

- Simple FK: `<REFERENCED_PREFIX>_id`
- Descriptive FK: `<descriptive>_<REFERENCED_PREFIX>_id`

Examples:

- `PRJ_id` in `task`
- `AGN_id` in `task`
- `depends_on_TSK_id` in `task_dependency`

## Constraint and Index Patterns

Apply these fixed names:

- Index: `idx_<table>_<column>`
- Unique constraint: `uq_<table>_<column>`
- Foreign key constraint: `fk_<table>_<column>`

## Prefix Registry

| Table | Prefix | Table | Prefix |
| :---- | :----- | :---- | :----- |
| agent | AGN | message | MSG |
| project | PRJ | queue | QUE |
| task | TSK | member | MBR |
| soul | SOL | agent_skill | ASK |
| skill | SKL | task_dependency | TDP |
| conversation | CNV | notification | NTF |
| configuration | CFG | credential | CRD |

New prefixes should follow the first 3 meaningful letters where possible. If
that creates a collision, choose a distinct variation and record it here.

## Examples

### Standard Table

```sql
CREATE TABLE task (
    TSK_id SERIAL PRIMARY KEY,
    PRJ_id INTEGER NOT NULL REFERENCES project(PRJ_id),
    AGN_id INTEGER REFERENCES agent(AGN_id),
    TSK_title VARCHAR(500) NOT NULL,
    TSK_description TEXT,
    TSK_status VARCHAR(50) DEFAULT 'pending',
    TSK_sort INTEGER DEFAULT 0,
    TSK_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TSK_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Join Table

```sql
CREATE TABLE agent_skill (
    ASK_id SERIAL PRIMARY KEY,
    AGN_id INTEGER NOT NULL REFERENCES agent(AGN_id),
    SKL_id INTEGER NOT NULL REFERENCES skill(SKL_id),
    ASK_level INTEGER DEFAULT 1,
    ASK_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(AGN_id, SKL_id)
);
```

### Self-Referencing Relationship

```sql
CREATE TABLE task_dependency (
    TDP_id SERIAL PRIMARY KEY,
    TSK_id INTEGER NOT NULL REFERENCES task(TSK_id) ON DELETE CASCADE,
    depends_on_TSK_id INTEGER NOT NULL REFERENCES task(TSK_id) ON DELETE CASCADE,
    TDP_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(TSK_id, depends_on_TSK_id)
);
```

## Anti-Patterns to Avoid

- Using plural table names such as `agents` or `tasks`.
- Prefixing foreign keys with the current table prefix instead of the referenced one.
- Mixing `camelCase`, `PascalCase`, and `snake_case` in the same schema.
- Creating undocumented custom prefixes when a collision occurs.

## Migration Best Practices

- Use transaction blocks such as `BEGIN` and `COMMIT`.
- Add `COMMENT ON TABLE` and `COMMENT ON COLUMN` where useful.
- Test migrations against realistic production-like data before rollout.
