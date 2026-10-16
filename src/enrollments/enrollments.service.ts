import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CoursesService } from '../courses/courses.service';
import { StudentService } from '../student/student.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { FilterEnrollmentsDto } from './dto/filter-enrollments.dto';
import { Enrollments } from './entities/enrollments.entity';
import { Paginated } from '../common/interfaces/paginated';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollments)
    private readonly enrollmentRepository: Repository<Enrollments>,
    private readonly studentService: StudentService,
    private readonly coursesService: CoursesService,
  ) {}

  async findAll(
    filters: FilterEnrollmentsDto = new FilterEnrollmentsDto(),
  ): Promise<Paginated<Enrollments>> {
    const query = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.course', 'course')
      .distinct(true)
      .orderBy('enrollment.id', 'ASC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit);

    if (filters.studentId !== undefined) {
      query.andWhere('student.id = :studentId', { studentId: filters.studentId });
    }
    if (filters.courseId !== undefined) {
      query.andWhere('course.id = :courseId', { courseId: filters.courseId });
    }
    if (filters.activeOnly === true) {
      query.andWhere('student.isActive = :activeOnly', { activeOnly: true });
    }
    if (filters.search !== undefined) {
      const escapedSearch = filters.search.replace(/[\\%_]/g, '\\$&');
      query.andWhere(
        '(student.name ILIKE :search OR course.title ILIKE :search)',
        { search: `%${escapedSearch}%` },
      );
    }

    const [items, total] = await query.getManyAndCount();
    return {
      items,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / filters.limit),
      },
    };
  }

  async findByStudent(studentId: number): Promise<Paginated<Enrollments>> {
    await this.studentService.findOne(studentId); // lanza 404 si no existe
    return this.findAll({ ...new FilterEnrollmentsDto(), studentId });
  }

  async findByCourse(courseId: number): Promise<Paginated<Enrollments>> {
    await this.coursesService.findOne(courseId); // lanza 404 si no existe
    return this.findAll({ ...new FilterEnrollmentsDto(), courseId });
  }

  async findOne(id: number): Promise<Enrollments> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: { student: true, course: true },
    });
    if (!enrollment) {
      throw new NotFoundException(`La matrícula con id ${id} no existe`);
    }
    return enrollment;
  }

  async create(dto: CreateEnrollmentDto): Promise<Enrollments> {
    // 1 y 2. Existencia (404)
    const student = await this.studentService.findOne(dto.studentId);
    const course = await this.coursesService.findOne(dto.courseId);

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

  async cancel(id: number): Promise<Enrollments> {
    const enrollment = await this.findOne(id);

    const cancelled = { ...enrollment }; // remove() borra el id de la instancia
    await this.enrollmentRepository.remove(enrollment);
    return cancelled as Enrollments;
  }
}