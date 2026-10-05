import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Student } from '../student/entitites/student.entity';
import { Course } from '../courses/entities/course.entity';

@Entity()
@Unique(['student', 'course'])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'RESTRICT' })
  student: Student;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'RESTRICT' })
  course: Course;
}