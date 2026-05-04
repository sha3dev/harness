# Playwright Local Canary

Use this skill when a task requires Playwright browser automation and the user wants the agent to reuse the local Chrome Canary session instead of launching an isolated Playwright browser.

## Workflow

1. Start Chrome Canary from the project root before using Playwright:

   ```sh
   npm run harness:open-chrome-canary
   ```

2. Use the existing Playwright MCP server configured in `.claude/config.json`.

   The relevant MCP configuration is:

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

3. Use the Playwright MCP tools normally after the browser is reachable at `http://127.0.0.1:9222/json/version`.

## Notes

- The launcher uses the real Chrome Canary user data directory on macOS by default: `~/Library/Application Support/Google/Chrome Canary`.
- If Chrome Canary is already open without remote debugging, close it and run `npm run harness:open-chrome-canary` first.
- Override `CHROME_CANARY_USER_DATA_DIR`, `CHROME_CANARY_PROFILE_DIRECTORY`, `CHROME_CANARY_EXECUTABLE_PATH`, or `CHROME_CANARY_REMOTE_DEBUGGING_PORT` when a project needs a different local setup.
- Keep the MCP bound to `127.0.0.1`; the debugging endpoint exposes the browser session.
