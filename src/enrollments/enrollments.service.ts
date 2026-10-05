import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, QueryFailedError, Repository } from 'typeorm';
import { CoursesService } from '../courses/courses.service';
import { StudentService } from '../student/student.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { FilterEnrollmentsDto } from './dto/filter-enrollments.dto';
import { Enrollment } from './entities/enrollments.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly studentService: StudentService,
    private readonly coursesService: CoursesService,
  ) {}

  async findAll(filters: FilterEnrollmentsDto = {}): Promise<Enrollment[]> {
    const where: FindOptionsWhere<Enrollment> = {};
    if (filters.studentId !== undefined) where.student = { id: filters.studentId };
    if (filters.courseId !== undefined) where.course = { id: filters.courseId };

    return this.enrollmentRepository.find({
      where,
      relations: { student: true, course: true },
      order: { id: 'ASC' },
    });
  }

  async findByStudent(studentId: number): Promise<Enrollment[]> {
    await this.studentService.findOne(studentId); // lanza 404 si no existe
    return this.findAll({ studentId });
  }

  async findByCourse(courseId: number): Promise<Enrollment[]> {
    await this.coursesService.findOne(courseId); // lanza 404 si no existe
    return this.findAll({ courseId });
  }

  async create(dto: CreateEnrollmentDto): Promise<Enrollment> {
    // 1 y 2. Existencia (404)
    const student = await this.studentService.findOne(dto.studentId);
    const course = await this.coursesService.findOne(dto.courseId);
    if (!course) {
      throw new NotFoundException(`Course with id ${dto.courseId} not found`);
    }

    // 3. Estudiante activo (400)
    if (!student.isActive) {
      throw new BadRequestException('El estudiante no está activo');
    }

    // 4. Duplicado (409)
    const alreadyEnrolled = await this.enrollmentRepository.existsBy({
      student: { id: student.id },
      course: { id: course.id },
    });
    if (alreadyEnrolled) {
      throw new ConflictException('El estudiante ya está matriculado en este curso');
    }

    try {
      const enrollment = this.enrollmentRepository.create({ student, course });
      return await this.enrollmentRepository.save(enrollment);
    } catch (error) {
      // Respaldo ante condición de carrera: la restricción UNIQUE de la BD
      if (error instanceof QueryFailedError && (error.driverError as { code?: string })?.code === '23505') {
        throw new ConflictException('El estudiante ya está matriculado en este curso');
      }
      throw error;
    }
  }

  async cancel(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: { student: true, course: true },
    });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with id ${id} not found`);
    }

    const cancelled = { ...enrollment }; // remove() borra el id de la instancia
    await this.enrollmentRepository.remove(enrollment);
    return cancelled as Enrollment;
  }
}