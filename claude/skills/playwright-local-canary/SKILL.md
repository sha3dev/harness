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
         "args": [
           "@playwright/mcp@latest",
           "--cdp-endpoint=http://127.0.0.1:9222",
           "--ignore-https-errors",
           "--grant-permissions=geolocation",
           "--init-script=scripts/playwright-spain-init.js"
         ]
       }
     }
   }
   ```

3. Use Playwright MCP tools once `http://127.0.0.1:9222/json/version` is reachable.
4. The browser is launched with Spanish locale defaults. The MCP init script also exposes Spanish browser signals to pages:

   - `navigator.language`: `es-ES`
   - `navigator.languages`: `es-ES, es, en`
   - `Intl.DateTimeFormat` default timezone: `Europe/Madrid`
   - `navigator.geolocation`: Madrid, Spain

## Notes

- Uses an isolated automation profile in the project root by default: `.chrome-canary-automation/`.
- This avoids reusing the personal Chrome Canary profile, which can leave the process running without exposing remote debugging on `127.0.0.1:9222`.
- If Chrome Canary is already open without remote debugging, close it and relaunch with the script.
- The MCP is configured with `--ignore-https-errors` so navigation can continue through certificate hostname mismatches such as `net::ERR_CERT_COMMON_NAME_INVALID`.
- The launch script writes profile language preferences and starts Chrome with `--lang=es-ES`, `--accept-lang=es-ES,es,en`, and `TZ=Europe/Madrid`.
- Environment overrides: `CHROME_CANARY_USER_DATA_DIR`, `CHROME_CANARY_PROFILE_DIRECTORY`, `CHROME_CANARY_EXECUTABLE_PATH`, `CHROME_CANARY_REMOTE_DEBUGGING_PORT`, `CHROME_CANARY_LANGUAGE`, `CHROME_CANARY_ACCEPT_LANGUAGES`, `CHROME_CANARY_TIME_ZONE`.
- Sites can still choose language by IP address, account settings, cookies, or server-side country detection. This setup only controls browser-visible signals.
- Keep MCP bound to `127.0.0.1` — the debugging endpoint exposes the full browser session.
