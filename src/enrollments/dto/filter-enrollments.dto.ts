import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class FilterEnrollmentsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

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

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'activeOnly debe ser true o false' })
  activeOnly?: boolean;
}
