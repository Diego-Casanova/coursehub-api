import { Injectable } from '@nestjs/common';

//Esto crea una entidad "Course"
type Course = {
    id: number;
    title: string;
    level: string;
};

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

    
}


