import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import {CreateCourseDto} from './dto/create-course.dto'

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(@Query('level') level?: string) {
    return this.coursesService.findAll(level);
  }

  @Get(':id') //ese : es para que en la URL no se revuelva todo y sea confuso, el nombre real es 'id'
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: CreateCourseDto) {
    return this.coursesService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, //update espera dos intrucciones, la primera es el objeto especifico que quieres modificar
    @Body() body: { title?: string; level?: string }, //y el segundo despues de la coma son los parámetros que se quieren modificar de el objeto especificado
  ) {
    return this.coursesService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(Number(id));
  }
}