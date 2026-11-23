import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { HttpErrorFilter } from './common/filters/http-error.filter';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const logger = new Logger('Bootstrap');
  const config = app.get(ConfigService);
  const allowedOrigins = config
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim());
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));
  app.useGlobalFilters(new HttpErrorFilter());
  app.useGlobalInterceptors(new TimingInterceptor());
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
