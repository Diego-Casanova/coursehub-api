const JWT_EXPIRATION_PATTERN = /^\d+(s|m|h|d)$/;

export function validateEnvironment(config: Record<string, unknown>) {
  const secret = config.JWT_SECRET;
  const expiresIn = config.JWT_EXPIRES_IN;

  if (typeof secret !== 'string' || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and contain at least 32 characters');
  }
  if (
    typeof expiresIn !== 'string' ||
    !JWT_EXPIRATION_PATTERN.test(expiresIn)
  ) {
    throw new Error('JWT_EXPIRES_IN must be a duration such as 15m, 1h, or 7d');
  }

  return config;
}
