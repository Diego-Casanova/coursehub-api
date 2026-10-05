import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WelcomeService } from './welcome.service'
import { WelcomeController } from './welcome.controller'
import { CoursesModule } from './courses/courses.module';
import { StudentModule } from './student/student.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';

@Module({
  imports: [CoursesModule, StudentModule, EnrollmentsModule],
  controllers: [AppController, WelcomeController],
  providers: [AppService, WelcomeService],
})
export class AppModule {}
