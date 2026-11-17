import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  app.enableCors({
    origin: /^https?:\/\/(localhost|127\.0\.0\.1):(3000|3001)$/,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const configuredPort = Number(process.env.PORT ?? 3000);
  const ports =
    configuredPort === 3000 || configuredPort === 3001
      ? [configuredPort, configuredPort === 3000 ? 3001 : 3000]
      : [configuredPort];

  for (const port of ports) {
    try {
      await app.listen(port);
      if (port !== configuredPort) {
        logger.warn(
          `Port ${configuredPort} is unavailable; using port ${port} instead`,
        );
      }
      return;
    } catch (error: unknown) {
      const isLastPort = port === ports[ports.length - 1];
      if (isLastPort || !isAddressInUseError(error)) {
        throw error;
      }
    }
  }
}

function isAddressInUseError(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'EADDRINUSE'
  );
}

bootstrap();
