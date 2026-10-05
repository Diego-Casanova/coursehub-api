import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateEnrollmentDto {
  @Type(() => Number)
  @IsNotEmpty({ message: 'studentId es obligatorio' })
  @IsInt({ message: 'studentId debe ser un número entero' })
  @IsPositive({ message: 'studentId debe ser un número positivo' })
  studentId: number;

  @Type(() => Number)
  @IsNotEmpty({ message: 'courseId es obligatorio' })
  @IsInt({ message: 'courseId debe ser un número entero' })
  @IsPositive({ message: 'courseId debe ser un número positivo' })
  courseId: number;
}
