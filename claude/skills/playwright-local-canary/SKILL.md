---
name: playwright-local-canary
description: Reuse the local Chrome Canary session for Playwright browser automation instead of launching an isolated browser.
origin: harness
---

# Playwright Local Canary

Use this skill when Playwright browser automation should reuse the local Chrome Canary session.

## Workflow

1. Launch Chrome Canary with remote debugging:

   ```sh
   npm run harness:open-chrome-canary
   ```

2. The Playwright MCP server is configured in `.claude/config.json`:

   ```json
   {
     "mcpServers": {
       "playwright": {
         "command": "npx",
         "args": ["@playwright/mcp@latest", "--cdp-endpoint=http://127.0.0.1:9222"]
       }
     }
   }
   ```

3. Use Playwright MCP tools once `http://127.0.0.1:9222/json/version` is reachable.

## Notes

- Uses the real Chrome Canary user data directory on macOS: `~/Library/Application Support/Google/Chrome Canary`.
- If Chrome Canary is already open without remote debugging, close it and relaunch with the script.
- Environment overrides: `CHROME_CANARY_USER_DATA_DIR`, `CHROME_CANARY_PROFILE_DIRECTORY`, `CHROME_CANARY_EXECUTABLE_PATH`, `CHROME_CANARY_REMOTE_DEBUGGING_PORT`.
- Keep MCP bound to `127.0.0.1` — the debugging endpoint exposes the full browser session.
