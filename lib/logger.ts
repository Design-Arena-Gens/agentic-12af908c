export function logInfo(message: string, payload?: unknown) {
  console.log(`[INFO] ${message}`, payload ?? "");
}

export function logWarn(message: string, payload?: unknown) {
  console.warn(`[WARN] ${message}`, payload ?? "");
}

export function logError(message: string, payload?: unknown) {
  console.error(`[ERROR] ${message}`, payload ?? "");
}
