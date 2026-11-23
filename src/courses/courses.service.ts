import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/create-course.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { Courses } from './entities/course.entity';
import { Paginated } from '../common/interfaces/paginated';
import { AuthenticatedUser } from '../auth/jwt/jwt-payload.interface';
import { UserRole } from '../auth/roles/user-role.enum';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(Courses)
        private readonly courseRepository: Repository<Courses>,
    ) {}

    async findAll(query: CourseQueryDto = new CourseQueryDto()): Promise<Paginated<Courses>> {
        const { page, limit, sortBy, order } = query;
        const [items, total] = await this.courseRepository.findAndCount({
            where: query.level ? { level: query.level } : {},
            order: this.getOrder(sortBy, order),
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            items,
            meta: { total, page, limit, totalPages: total === 0 ? 0 : Math.ceil(total / limit) },
        };
    }

    private getOrder(
        sortBy: CourseQueryDto['sortBy'],
        order: CourseQueryDto['order'],
    ): FindOptionsOrder<Courses> {
        if (sortBy === 'id') return { id: order };
        return { [sortBy]: order, id: order };
    }

    async findOne(id: number): Promise<Courses> {
        const course = await this.courseRepository.findOneBy({ id });
        if (!course) {
            throw new NotFoundException(`El curso con id ${id} no existe`);
        }
        return course;
    }

    create(createCourseDto: CreateCourseDto, actor: AuthenticatedUser): Promise<Courses> {
        const course = this.courseRepository.create({
            ...createCourseDto,
            createdByUserId: actor.role === UserRole.TEACHER ? actor.id : null,
            owner: actor.role === UserRole.TEACHER ? ({ id: actor.id } as User) : null,
        });
        return this.courseRepository.save(course);
    }

    async update(id: number, input: UpdateCourseDto, actor: AuthenticatedUser): Promise<Courses> {
        const course = await this.findOne(id);
        this.assertCanManage(course, actor);
        Object.assign(course, input);
        return this.courseRepository.save(course);
    }

    async remove(id: number): Promise<Courses> {
        const course = await this.findOne(id);
        await this.courseRepository.remove(course);
        return course;
    }

    private assertCanManage(course: Courses, actor: AuthenticatedUser): void {
        if (actor.role !== UserRole.ADMIN && course.createdByUserId !== actor.id) {
            throw new ForbiddenException('You cannot modify this course');
        }
    }
}


