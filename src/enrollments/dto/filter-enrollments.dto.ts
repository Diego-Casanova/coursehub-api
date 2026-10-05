import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class FilterEnrollmentsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'studentId debe ser un número entero' })
  studentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'courseId debe ser un número entero' })
  courseId?: number;
}
