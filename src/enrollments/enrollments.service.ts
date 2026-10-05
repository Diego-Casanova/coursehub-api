import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoursesService } from '../courses/courses.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { FilterEnrollmentsDto } from './dto/filter-enrollments.dto';
import { StudentService } from '../student/student.service';

type Enrollment = { id: number; studentId: number; courseId: number; };

@Injectable()
export class EnrollmentsService {
  private readonly enrollments: Enrollment[] = [];
  private nextId = 1;

  constructor(
    private readonly studentService: StudentService,
    private readonly coursesService: CoursesService,
  ) {}

  findAll(filters: FilterEnrollmentsDto): Enrollment[] {
    return this.enrollments.filter(
      (enrollment) =>
        (filters.studentId === undefined ||
          enrollment.studentId === filters.studentId) &&
        (filters.courseId === undefined ||
          enrollment.courseId === filters.courseId),
    );
  }

  findByStudent(studentId: number): Enrollment[] {
    this.studentService.findOne(studentId);
    return this.findAll({ studentId });
  }

  findByCourse(courseId: number): Enrollment[] {
    const course = this.coursesService.findOne(courseId);
    if (!course) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }
    return this.findAll({ courseId });
  }

  create(dto: CreateEnrollmentDto): Enrollment {
    const student = this.studentService.findOne(dto.studentId);

    const course = this.coursesService.findOne(dto.courseId);
    if (!course) {
      throw new NotFoundException(`Course with id ${dto.courseId} not found`);
    }

    if (!student.isActive) {
      throw new ForbiddenException('El estudiante no está activo');
    }

    const alreadyEnrolled = this.enrollments.some(
      (enrollment) =>
        enrollment.studentId === dto.studentId &&
        enrollment.courseId === dto.courseId,
    );
    if (alreadyEnrolled) {
      throw new ConflictException(
        'El estudiante ya está matriculado en este curso',
      );
    }

    const enrollment = { id: this.nextId++, ...dto };
    this.enrollments.push(enrollment);
    return enrollment;
  }

  cancel(id: number): Enrollment {
    const index = this.enrollments.findIndex(
      (enrollment) => enrollment.id === id,
    );
    if (index === -1) {
      throw new NotFoundException(`Enrollment with id ${id} not found`);
    }

    const [cancelledEnrollment] = this.enrollments.splice(index, 1);
    return cancelledEnrollment;
  }
}