import { Controller, Get, Param,  Query } from '@nestjs/common';
import { CoursesService } from './courses.service';


//El service hace toda la logica, controller solo crea los endpoints y hace peticiones GET y POST llamando a service
@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService){}

    @Get()
    findAll(@Query('level') level?: string){
        return this.coursesService.findAll(level);
    }

    @Get(':id')
    findOne(@Param('id') id: string){
    return this.coursesService.findOne(Number(id));
}
}

