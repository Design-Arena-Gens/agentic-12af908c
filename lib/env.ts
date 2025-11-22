const requiredVars = [
  "TEEMDROP_WEBHOOK_SECRET",
  "PAGEPILOTE_API_KEY",
  "PAGEPILOTE_BASE_URL"
] as const;

type RequiredEnv = (typeof requiredVars)[number];

const cache = new Map<string, string>();

export function getEnv(name: RequiredEnv): string {
  if (cache.has(name)) {
    return cache.get(name)!;
  }

  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable "${name}"`);
  }
  cache.set(name, value);
  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  if (cache.has(name)) {
    return cache.get(name);
  }
  const value = process.env[name];
  if (value) {
    cache.set(name, value);
  }
  return value;
}
