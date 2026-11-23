import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { FilterEnrollmentsDto } from './dto/filter-enrollments.dto';
import { EnrollmentsService } from './enrollments.service';
import { ParsePositiveIntPipe } from '../common/pipes/parse-positive-int.pipe';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRole } from '../auth/roles/user-role.enum';

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
			ParsePositiveIntPipe,
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
			ParsePositiveIntPipe,
		)
		courseId: number,
	) {
		return this.enrollmentsService.findByCourse(courseId);
	}

	@Get('enrollments/:id')
	@HttpCode(HttpStatus.OK)
	findOne(
		@Param(
			'id',
			ParsePositiveIntPipe,
		)
		id: number,
	) {
		return this.enrollmentsService.findOne(id);
	}

	@Post('enrollments')
	@HttpCode(HttpStatus.CREATED)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	create(@Body() dto: CreateEnrollmentDto) {
		return this.enrollmentsService.create(dto);
	}

	@Delete('enrollments/:id')
	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	cancel(
		@Param(
			'id',
			ParsePositiveIntPipe,
		)
		id: number,
	) {
		return this.enrollmentsService.cancel(id);
	}
}
