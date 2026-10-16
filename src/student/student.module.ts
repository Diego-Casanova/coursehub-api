import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Students } from './entitites/student.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Students])],
	controllers: [StudentController],
	providers: [StudentService],
	exports: [StudentService],
})
export class StudentModule {}