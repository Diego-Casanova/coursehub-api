import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WelcomeService } from './welcome.service'
import { WelcomeController } from './welcome.controller'
import { CoursesModule } from './courses/courses.module';
import { StudentModule } from './student/student.module';

@Module({
  imports: [CoursesModule, StudentModule],
  controllers: [AppController, WelcomeController],
  providers: [AppService, WelcomeService],
})
export class AppModule {}
