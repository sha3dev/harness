# harness

AI project initializer.

## Init

Initialize the current project:

```sh
npx @sha3/harness@latest init
```

Run the same command again to re-initialize an existing project. It refreshes the harness-managed files and scripts.

Managed agent files and MCP config are written under `.claude/`.

Preview changes without writing files:

```sh
npx @sha3/harness@latest init --dry-run
```

## Scripts

The initializer recreates every `package.json` script prefixed with `harness:`:

```json
{
  "harness:init": "npx @sha3/harness@latest init",
  "harness:open-chrome-canary": "node scripts/open-chrome-canary.mjs",
  "harness:check": "biome check --config-path=biome/biome.json .",
  "harness:publish": "node scripts/publish.mjs"
}
```
