import {
	Body,
	BadRequestException,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Query,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { FilterEnrollmentsDto } from './dto/filter-enrollments.dto';
import { EnrollmentsService } from './enrollments.service';

@Controller()
export class EnrollmentsController {
	constructor(private readonly enrollmentsService: EnrollmentsService) {}

	@Get('enrollments')
	@HttpCode(HttpStatus.OK)
	findAll(@Query() filters: FilterEnrollmentsDto) {
		return this.enrollmentsService.findAll(filters);
	}

	@Get('students/:studentId/enrollments')
	@HttpCode(HttpStatus.OK)
	findByStudent(
		@Param(
			'studentId',
			new ParseIntPipe({
				errorHttpStatusCode: HttpStatus.BAD_REQUEST,
				exceptionFactory: () =>
					new BadRequestException('El id debe ser un número entero'),
			}),
		)
		studentId: number,
	) {
		return this.enrollmentsService.findByStudent(studentId);
	}

	@Get('courses/:courseId/enrollments')
	@HttpCode(HttpStatus.OK)
	findByCourse(
		@Param(
			'courseId',
			new ParseIntPipe({
				errorHttpStatusCode: HttpStatus.BAD_REQUEST,
				exceptionFactory: () =>
					new BadRequestException('El id debe ser un número entero'),
			}),
		)
		courseId: number,
	) {
		return this.enrollmentsService.findByCourse(courseId);
	}

	@Post('enrollments')
	@HttpCode(HttpStatus.CREATED)
	create(@Body() dto: CreateEnrollmentDto) {
		return this.enrollmentsService.create(dto);
	}

	@Delete('enrollments/:id')
	@HttpCode(HttpStatus.OK)
	cancel(
		@Param(
			'id',
			new ParseIntPipe({
				errorHttpStatusCode: HttpStatus.BAD_REQUEST,
				exceptionFactory: () =>
					new BadRequestException('El id debe ser un número entero'),
			}),
		)
		id: number,
	) {
		return this.enrollmentsService.cancel(id);
	}
}