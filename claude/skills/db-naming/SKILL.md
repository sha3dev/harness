---
name: db-naming
description: Consistent database naming conventions for SQL schemas, migrations, constraints, indexes, and foreign keys.
origin: harness
---

# Database Naming Conventions

Use this skill when designing tables, writing migrations, or reviewing SQL schemas.

## Core Rules

- **snake_case everywhere**: tables, columns, constraints, and indexes.
- **Singular table names**: `agent`, not `agents`.
- **3-letter uppercase column prefixes**: every column begins with a prefix derived from its table name (e.g., `agent` -> `AGN`).
- **Foreign keys use the referenced table's prefix**, not the current table's. A reference to `agent` in `task` uses `AGN_id`, not `TSK_agent_id`.
- **No mixed casing**: never combine `camelCase`, `PascalCase`, and `snake_case` in the same schema.

## Column Naming

Format: `<PREFIX>_<column_name>`

Common patterns:

| Pattern | Example |
| :------ | :------ |
| Primary key | `TSK_id` |
| Created timestamp | `TSK_created_at` |
| Updated timestamp | `TSK_updated_at` |
| Soft delete | `TSK_deleted_at` |
| Simple FK | `PRJ_id` (references `project`) |
| Descriptive FK | `depends_on_TSK_id` (self-reference) |

## Constraint and Index Names

- Index: `idx_<table>_<column>`
- Unique constraint: `uq_<table>_<column>`
- Foreign key constraint: `fk_<table>_<column>`

## Prefix Registry

Track all prefixes in a project-level registry to prevent collisions. Choose the first 3 meaningful letters of the table name. If that creates a collision, pick a distinct variation and record it.

Example registry:

| Table | Prefix | Table | Prefix |
| :---- | :----- | :---- | :----- |
| agent | AGN | project | PRJ |
| task | TSK | skill | SKL |
| conversation | CNV | configuration | CFG |

## Examples

### Standard Table

```sql
CREATE TABLE task (
    TSK_id SERIAL PRIMARY KEY,
    PRJ_id INTEGER NOT NULL REFERENCES project(PRJ_id),
    AGN_id INTEGER REFERENCES agent(AGN_id),
    TSK_title VARCHAR(500) NOT NULL,
    TSK_status VARCHAR(50) DEFAULT 'pending',
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

## Migration Practices

- Wrap migrations in transaction blocks (`BEGIN` / `COMMIT`).
- Add `COMMENT ON TABLE` and `COMMENT ON COLUMN` where useful.
- Test migrations against realistic data before rollout.
