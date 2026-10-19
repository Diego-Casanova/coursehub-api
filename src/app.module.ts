import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WelcomeService } from './welcome.service';
import { WelcomeController } from './welcome.controller';
import { CoursesModule } from './courses/courses.module';
import { StudentModule } from './student/student.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        // TypeORM synchronize is intentionally limited to local development.
        synchronize: config.get<string>('NODE_ENV', 'development') !== 'production',
      }),
    }),
    CoursesModule,
    StudentModule,
    EnrollmentsModule,
    AuthModule,
  ],
  controllers: [AppController, WelcomeController],
  providers: [AppService, WelcomeService],
})
export class AppModule {}
