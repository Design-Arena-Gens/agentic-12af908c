export async function retry<T>(
  fn: () => Promise<T>,
  {
    retries = 3,
    minTimeout = 500,
    factor = 2
  }: { retries?: number; minTimeout?: number; factor?: number } = {}
): Promise<T> {
  let attempt = 0;
  let delay = minTimeout;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= factor;
      attempt += 1;
    }
  }

  throw lastError;
}
