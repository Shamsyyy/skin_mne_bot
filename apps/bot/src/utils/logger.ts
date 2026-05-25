const SECRET_PATTERNS = [/bot\d+:/i, /sk-[a-zA-Z0-9]+/, /service_role/i, /eyJ[a-zA-Z0-9_-]+\./];

export function redact(message: string): string {
  let result = message;
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.log(redact(msg), meta ? redact(JSON.stringify(meta)) : '');
  },
  error: (msg: string, err?: unknown) => {
    const detail = err instanceof Error ? err.message : String(err ?? '');
    console.error(redact(msg), redact(detail));
  },
};
