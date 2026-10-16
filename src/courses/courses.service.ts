import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/create-course.dto';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(Course)
        private readonly courseRepository: Repository<Course>,
    ) {}

    findAll(level?: string): Promise<Course[]> {
        return this.courseRepository.find({ where: level ? { level } : {} });
    }

    async findOne(id: number): Promise<Course> {
        const course = await this.courseRepository.findOneBy({ id });
        if (!course) {
            throw new NotFoundException(`El curso con id ${id} no existe`);
        }
        return course;
    }

    create(createCourseDto: CreateCourseDto): Promise<Course> {
        const course = this.courseRepository.create(createCourseDto);
        return this.courseRepository.save(course);
    }

    async update(id: number, input: UpdateCourseDto): Promise<Course> {
        const course = await this.findOne(id);
        Object.assign(course, input);
        return this.courseRepository.save(course);
    }

    async remove(id: number): Promise<Course> {
        const course = await this.findOne(id);
        await this.courseRepository.remove(course);
        return course;
    }
}



