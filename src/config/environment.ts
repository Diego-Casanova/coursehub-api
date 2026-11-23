const JWT_EXPIRATION_PATTERN = /^\d+(s|m|h|d)$/;

export function validateEnvironment(config: Record<string, unknown>) {
  const secret = config.JWT_SECRET;
  const expiresIn = config.JWT_EXPIRES_IN;
  const corsOrigins = config.CORS_ORIGINS;

  if (typeof secret !== 'string' || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and contain at least 32 characters');
  }
  if (
    typeof expiresIn !== 'string' ||
    !JWT_EXPIRATION_PATTERN.test(expiresIn)
  ) {
    throw new Error('JWT_EXPIRES_IN must be a duration such as 15m, 1h, or 7d');
  }
  if (typeof corsOrigins !== 'string' || corsOrigins.trim().length === 0) {
    throw new Error('CORS_ORIGINS must list the allowed browser origins');
  }
  const origins = corsOrigins.split(',').map((origin) => origin.trim());
  for (const origin of origins) {
    try {
      const parsed = new URL(origin);
      if (
        !['http:', 'https:'].includes(parsed.protocol) ||
        parsed.origin !== origin ||
        parsed.username ||
        parsed.password
      ) {
        throw new Error();
      }
    } catch {
      throw new Error(`Invalid CORS origin: ${origin}`);
    }
  }

  return config;
}
