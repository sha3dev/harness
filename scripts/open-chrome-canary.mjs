import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const executablePath =
	process.env.CHROME_CANARY_EXECUTABLE_PATH ??
	process.env.CHROME_EXECUTABLE_PATH ??
	"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary";
const remoteDebuggingPort =
	process.env.CHROME_CANARY_REMOTE_DEBUGGING_PORT ??
	process.env.CRAWLER_CONNECT_BROWSER_PORT ??
	"9222";
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const defaultUserDataDir = path.join(
	projectDirectory,
	".chrome-canary-automation",
);
const userDataDir =
	process.env.CHROME_CANARY_USER_DATA_DIR ?? defaultUserDataDir;
const profileDirectory =
	process.env.CHROME_CANARY_PROFILE_DIRECTORY ?? "Default";
const acceptLanguages =
	process.env.CHROME_CANARY_ACCEPT_LANGUAGES ?? "es-ES,es,en";
const browserLanguage = process.env.CHROME_CANARY_LANGUAGE ?? "es-ES";
const browserTimeZone =
	process.env.CHROME_CANARY_TIME_ZONE ?? "Europe/Madrid";
const browserUrl = `http://127.0.0.1:${remoteDebuggingPort}`;
const endpointProbeTimeoutMs = 1_000;
const endpointLaunchTimeoutMs = 10_000;
const endpointRetryDelayMs = 250;

async function main() {
	if (await isEndpointReady(browserUrl)) {
		logReady("already running");
		return;
	}

	mkdirSync(userDataDir, { recursive: true });
	prepareSpanishProfilePreferences();
	const child = spawn(
		executablePath,
		[
			`--user-data-dir=${userDataDir}`,
			`--profile-directory=${profileDirectory}`,
			`--lang=${browserLanguage}`,
			`--accept-lang=${acceptLanguages}`,
			`--remote-debugging-port=${remoteDebuggingPort}`,
			"--remote-debugging-address=127.0.0.1",
			"--remote-allow-origins=*",
		],
		{
			detached: true,
			env: {
				...process.env,
				LANG: process.env.LANG ?? "es_ES.UTF-8",
				LC_ALL: process.env.LC_ALL ?? "es_ES.UTF-8",
				TZ: browserTimeZone,
			},
			stdio: "ignore",
		},
	);

	child.unref();

	await waitForEndpoint(browserUrl);
	logReady("launched");
}

function prepareSpanishProfilePreferences() {
	const profilePath = path.join(userDataDir, profileDirectory);
	const preferencesPath = path.join(profilePath, "Preferences");
	mkdirSync(profilePath, { recursive: true });

	const preferences = readJsonFile(preferencesPath);
	preferences.intl = { ...preferences.intl };
	Object.assign(
		preferences.intl,
		Object.fromEntries([
			["accept_languages", acceptLanguages],
			["selected_languages", acceptLanguages],
		]),
	);
	preferences.translate = { ...preferences.translate };
	Object.assign(
		preferences.translate,
		Object.fromEntries([["blocked_languages", []]]),
	);

	writeFileSync(preferencesPath, `${JSON.stringify(preferences, null, 2)}\n`);
}

function readJsonFile(filePath) {
	if (!existsSync(filePath)) {
		return {};
	}

	return JSON.parse(readFileSync(filePath, "utf8"));
}

async function isEndpointReady(url) {
	try {
		const response = await fetch(new URL("/json/version", url), {
			signal: AbortSignal.timeout(endpointProbeTimeoutMs),
		});
		return response.ok;
	} catch {
		return false;
	}
}

async function waitForEndpoint(url) {
	const deadline = Date.now() + endpointLaunchTimeoutMs;

	while (Date.now() < deadline) {
		if (await isEndpointReady(url)) {
			return;
		}
		await new Promise((resolve) => setTimeout(resolve, endpointRetryDelayMs));
	}

	throw new Error(
		`Chrome Canary did not expose DevTools at ${url}. If Canary is already open, close it and run this script before opening it normally.`,
	);
}

function logReady(state) {
	console.error(`[open:chrome-canary] ${state}: ${executablePath}`);
	console.error(`[open:chrome-canary] user data dir: ${userDataDir}`);
	console.error(`[open:chrome-canary] profile: ${profileDirectory}`);
	console.error(`[open:chrome-canary] language: ${browserLanguage}`);
	console.error(`[open:chrome-canary] accept languages: ${acceptLanguages}`);
	console.error(`[open:chrome-canary] timezone: ${browserTimeZone}`);
	console.error(`[open:chrome-canary] devtools: ${browserUrl}`);
}

main().catch((error) => {
	console.error(
		`[open:chrome-canary] ${error instanceof Error ? error.message : String(error)}`,
	);
	process.exit(1);
});
