import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class FilterEnrollmentsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'studentId debe ser un número entero' })
  @IsPositive({ message: 'studentId debe ser positivo' })
  studentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'courseId debe ser un número entero' })
  @IsPositive({ message: 'courseId debe ser positivo' })
  courseId?: number;
}
