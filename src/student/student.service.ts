import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

//Esto crea una entidad "Student"
type Student = {
    id: number;
    name: string;
    email: string;
    age: number;
    career: string;
    semester: number;
    isActive: boolean;
};

type CreateStudentInput = CreateStudentDto;
type UpdateStudentInput = UpdateStudentDto;

@Injectable()
export class StudentService {
    private nextId = 4;
    private readonly students: Student[] = [
        { id: 1, name: 'John Doe', email: 'john.doe@example.com', age: 20, career: 'Computer Science', semester: 5, isActive: true },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', age: 22, career: 'Mathematics', semester: 3, isActive: true },
        { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com', age: 21, career: 'Physics', semester: 4, isActive: false },
    ];

    findAll(filters: StudentQueryDto = {}): Student[] {
        return this.students.filter((student) =>
            (filters.career === undefined || student.career === filters.career) &&
            (filters.semester === undefined || student.semester === filters.semester) &&
            (filters.isActive === undefined || student.isActive === filters.isActive),
        );
    }

    findOne(id: number): Student {
        const student = this.students.find((item) => item.id === id);
        if (!student) {
            throw new NotFoundException(`Student with id ${id} not found`);
        }
        return student;
    }

    create(createStudentInput: CreateStudentInput): Student {
        if (this.students.some((student) => student.email === createStudentInput.email)) {
            throw new ConflictException('Email is already registered');
        }
        const student = { id: this.nextId++, ...createStudentInput };
        this.students.push(student);
        return student;
    }

    update(id: number, input: UpdateStudentInput): Student {
        const student = this.findOne(id);
        if (input.email && this.students.some((item) => item.id !== id && item.email === input.email)) {
            throw new ConflictException('Email is already registered');
        }
        Object.assign(student, input);
        return student;
    }

    updateStatus(id: number, isActive: boolean): Student {
        const student = this.findOne(id);
        student.isActive = isActive;
        return student;
    }

    remove(id: number): Student {
        const index = this.students.findIndex((student) => student.id === id);
        if (index === -1) {
            throw new NotFoundException(`Student with id ${id} not found`);
        }
        if (!this.students[index].isActive) {
            throw new ConflictException('Inactive students cannot be deleted');
        }
        const [removedStudent] = this.students.splice(index, 1);
        return removedStudent;

    }
}