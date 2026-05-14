type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getEffectiveLevel(): LogLevel {
  if (typeof process !== "undefined" && process.env?.LOG_LEVEL) {
    const lvl = process.env.LOG_LEVEL as LogLevel;
    if (LOG_LEVELS[lvl] !== undefined) return lvl;
  }
  const viteLogLevel = (import.meta as ImportMeta & { env?: { VITE_LOG_LEVEL?: string } }).env
    ?.VITE_LOG_LEVEL;
  if (viteLogLevel !== undefined) {
    const lvl = viteLogLevel as LogLevel;
    if (LOG_LEVELS[lvl] !== undefined) return lvl;
  }
  return "info";
}

const CURRENT_LEVEL = getEffectiveLevel();

function fmt(level: LogLevel, ...args: unknown[]): string {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;
  const body = args
    .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
    .join(" ");
  return `${prefix} ${body}`;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL];
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog("debug")) console.debug(fmt("debug", ...args));
  },
  info: (...args: unknown[]) => {
    if (shouldLog("info")) console.info(fmt("info", ...args));
  },
  warn: (...args: unknown[]) => {
    if (shouldLog("warn")) console.warn(fmt("warn", ...args));
  },
  error: (...args: unknown[]) => {
    if (shouldLog("error")) console.error(fmt("error", ...args));
  },
};
