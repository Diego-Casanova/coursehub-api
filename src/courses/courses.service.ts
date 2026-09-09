import { Injectable } from '@nestjs/common';
import { title } from 'process';

//Esto crea una entidad "Course"
type Course = {
    id: number;
    title: string;
    level: string;
};

type CreateCourseInput = Omit<Course, 'id'>;
type UpdateCourseInput = Partial<CreateCourseInput>;

//Esto inserta instancias JSON para la entidad que creamos arriba, imaginalo como una tabla de base de datos
@Injectable()
export class CoursesService { //Siempre va ese export para que pueda llamarse desde otro lado
    private readonly courses: Course[] = [
        {id: 1, title: 'NestJS Fundamentals', level: 'beginner'},
        {id: 2, title: 'REST APIs with NestJS', level: 'beginner'},
        {id: 3, title: 'NestJS Architecture', level: 'intermediate'}

    ];

    findAll(level?: string): Course[]{
        if(!level){
            return this.courses;
        }
        return this.courses.filter((course) => course.level === level);
    }

    findOne(id: number): Course | undefined {
    return this.courses.find((course) => course.id === id);
    }

    create(input: CreateCourseInput): Course{
        const course: Course = {
            id: Math.max(0, ...this.courses.map((item) => item.id)) + 1,
            title: input.title,
            level: input.level,
        };

        this.courses.push(course);
        return course;
    };

    update(id: number, input: UpdateCourseInput): Course | undefined {
        const course = this.findOne(id);

        if(!course) {
            return undefined
        }

        Object.assign(course, input);
        return course;
    }

    remove(id: number): Course | undefined{
    const index = this.courses.findIndex((course) => course.id === id);
    
    if (index === -1){
        return undefined;
    }

    const [removedCourse] = this.courses.splice(index, 1);
    return removedCourse;
}


}




