import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Students } from '../../student/entitites/student.entity';
import { Courses } from '../../courses/entities/course.entity';

@Entity()
@Unique(['student', 'course'])
export class Enrollments {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Students, { nullable: false, onDelete: 'RESTRICT' })
  student: Students;

  @ManyToOne(() => Courses, { nullable: false, onDelete: 'RESTRICT' })
  course: Courses;
}