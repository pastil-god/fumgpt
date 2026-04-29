import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export type LogLevel = "info" | "warn" | "error";

export type LogRecord = {
  timestamp: string;
  level: LogLevel;
  event: string;
  message: string;
  requestId?: string;
  route?: string;
  method?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  durationMs?: number;
  data?: Record<string, unknown>;
  error?: Record<string, unknown>;
};

const ensuredDirectories = new Set<string>();

function getLogFilePath() {
  const configuredPath = (process.env.STORE_LOG_FILE_PATH || "").trim();
  return configuredPath || null;
}

function serializeUnknown(value: unknown, depth = 0): unknown {
  if (value == null) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: process.env.NODE_ENV === "production" ? undefined : value.stack
    };
  }

  if (Array.isArray(value)) {
    return depth >= 2 ? `[array:${value.length}]` : value.slice(0, 20).map((item) => serializeUnknown(item, depth + 1));
  }

  if (typeof value === "object") {
    if (depth >= 2) {
      return "[object]";
    }

    const entries = Object.entries(value as Record<string, unknown>).slice(0, 24);

    return Object.fromEntries(entries.map(([key, entryValue]) => [key, serializeUnknown(entryValue, depth + 1)]));
  }

  return String(value);
}

function buildConsoleLine(record: LogRecord) {
  const context = {
    requestId: record.requestId,
    route: record.route,
    method: record.method,
    userId: record.userId,
    entityType: record.entityType,
    entityId: record.entityId,
    durationMs: record.durationMs,
    data: record.data,
    error: record.error
  };
  const compactContext = Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined && value !== null)
  );

  return `${record.timestamp} ${record.level.toUpperCase()} ${record.event} ${record.message}${
    Object.keys(compactContext).length > 0 ? ` ${JSON.stringify(compactContext)}` : ""
  }`;
}

async function writeLogFile(record: LogRecord) {
  const logFilePath = getLogFilePath();

  if (!logFilePath) {
    return;
  }

  const directoryPath = dirname(logFilePath);

  if (!ensuredDirectories.has(directoryPath)) {
    await mkdir(directoryPath, { recursive: true });
    ensuredDirectories.add(directoryPath);
  }

  await appendFile(logFilePath, `${JSON.stringify(record)}\n`, "utf8");
}

export async function logServerEvent(input: {
  level?: LogLevel;
  event: string;
  message: string;
  requestId?: string;
  route?: string;
  method?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  durationMs?: number;
  data?: Record<string, unknown>;
  error?: unknown;
}) {
  const record = {
    timestamp: new Date().toISOString(),
    level: input.level || "info",
    event: input.event,
    message: input.message,
    requestId: input.requestId,
    route: input.route,
    method: input.method,
    userId: input.userId,
    entityType: input.entityType,
    entityId: input.entityId,
    durationMs: input.durationMs,
    data: input.data ? (serializeUnknown(input.data) as Record<string, unknown>) : undefined,
    error: input.error ? (serializeUnknown(input.error) as Record<string, unknown>) : undefined
  } satisfies LogRecord;
  const consoleLine = buildConsoleLine(record);

  if (record.level === "error") {
    console.error(consoleLine);
  } else if (record.level === "warn") {
    console.warn(consoleLine);
  } else {
    console.info(consoleLine);
  }

  try {
    await writeLogFile(record);
  } catch (error) {
    console.error(
      `${new Date().toISOString()} ERROR observability.log_file_write_failed Failed to append storefront log file ${JSON.stringify(
        serializeUnknown(error)
      )}`
    );
  }
}

export function getLoggingStatus() {
  const logFilePath = getLogFilePath();

  return {
    mode: logFilePath ? "console+file" : "console",
    filePath: logFilePath
  };
}
