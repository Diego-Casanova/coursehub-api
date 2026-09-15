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
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UpdateStudentStatusDto } from './dto/update-student-status.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { ParseStudentIdPipe } from './pipes/parse-student-id.pipe';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  findAll(@Query() query: StudentQueryDto) {
    return this.studentService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseStudentIdPipe) id: number) {
    return this.studentService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateStudentDto) {
    return this.studentService.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseStudentIdPipe) id: number, @Body() body: UpdateStudentDto) {
    return this.studentService.update(id, body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseStudentIdPipe) id: number, @Body() body: UpdateStudentStatusDto) {
    return this.studentService.updateStatus(id, body.isActive);
  }

  @Delete(':id')
  remove(@Param('id', ParseStudentIdPipe) id: number) {
    return this.studentService.remove(id);
  }
}