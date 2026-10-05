import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { StudentModule } from '../student/student.module';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

@Module({
  imports: [StudentModule, CoursesModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}