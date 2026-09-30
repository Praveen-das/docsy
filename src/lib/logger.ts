type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  data?: Record<string, unknown>;
}

const COLORS = {
  reset: "\x1b[0m",
  info: "\x1b[36m",  // Cyan
  warn: "\x1b[33m",  // Yellow
  error: "\x1b[31m", // Red
  debug: "\x1b[35m", // Magenta
} as const;

/**
 * Structured logger for lifecycle events.
 * Outputs formatted logs with level colors to stdout/stderr.
 */
function log(level: LogLevel, event: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...(data && { data }),
  };

  const color = COLORS[level];
  const output = `${color}${JSON.stringify(entry)}${COLORS.reset}`;

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.debug(output);
      }
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  info: (event: string, data?: Record<string, unknown>) =>
    log("info", event, data),
  warn: (event: string, data?: Record<string, unknown>) =>
    log("warn", event, data),
  error: (event: string, data?: Record<string, unknown>) =>
    log("error", event, data),
  debug: (event: string, data?: Record<string, unknown>) =>
    log("debug", event, data),
};
