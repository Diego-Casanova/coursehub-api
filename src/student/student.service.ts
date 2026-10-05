import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entitites/student.entity';

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
    ) {}

    async findAll(filters: StudentQueryDto = {}): Promise<Student[]> {
        const where: Partial<Pick<Student, 'career' | 'semester' | 'isActive'>> = {};

        if (filters.career !== undefined) where.career = filters.career;
        if (filters.semester !== undefined) where.semester = filters.semester;
        if (filters.isActive !== undefined) where.isActive = filters.isActive;

        return this.studentRepository.find({ where });
    }

    async findOne(id: number): Promise<Student> {
        const student = await this.studentRepository.findOneBy({ id });
        if (!student) {
            throw new NotFoundException(`Student with id ${id} not found`);
        }
        return student;
    }

    async create(input: CreateStudentDto): Promise<Student> {
        await this.ensureEmailIsAvailable(input.email);

        const student = this.studentRepository.create(input);
        return this.save(student);
    }

    async update(id: number, input: UpdateStudentDto): Promise<Student> {
        const student = await this.findOne(id);

        if (input.email && input.email !== student.email) {
            await this.ensureEmailIsAvailable(input.email, id);
        }

        Object.assign(student, input);
        return this.save(student);
    }

    async updateStatus(id: number, isActive: boolean): Promise<Student> {
        const student = await this.findOne(id);
        student.isActive = isActive;
        return this.studentRepository.save(student);
    }

    async remove(id: number): Promise<Student> {
        const student = await this.findOne(id);

        if (!student.isActive) {
            throw new ConflictException('Inactive students cannot be deleted');
        }

        // remove() devuelve la entidad pero le quita el id, así que lo conservamos
        const removed = { ...student };
        await this.studentRepository.remove(student);
        return removed;
    }

    // --- Helpers privados ---

    private async ensureEmailIsAvailable(email: string, excludeId?: number): Promise<void> {
        const existing = await this.studentRepository.findOneBy({ email });
        if (existing && existing.id !== excludeId) {
            throw new ConflictException(`The email ${email} is already registered`);
        }
    }

    // Respaldo ante condiciones de carrera: si la BD rechaza por UNIQUE, también devolvemos 409
    private async save(student: Student): Promise<Student> {
        try {
            return await this.studentRepository.save(student);
        } catch (error) {
            if (error instanceof QueryFailedError && this.isUniqueViolation(error)) {
                throw new ConflictException('The email is already registered');
            }
            throw error;
        }
    }

    private isUniqueViolation(error: QueryFailedError): boolean {
        const driverError = error.driverError as { code?: string | number; errno?: number };
        return (
            driverError?.code === '23505' ||          // PostgreSQL
            driverError?.code === 'ER_DUP_ENTRY' ||   // MySQL / MariaDB
            driverError?.code === 'SQLITE_CONSTRAINT' || // SQLite
            driverError?.errno === 1062               // MySQL (código numérico)
        );
    }
}