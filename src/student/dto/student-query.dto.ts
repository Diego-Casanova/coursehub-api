import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class StudentQueryDto {
  @IsOptional() @IsString()
  career?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10)
  semester?: number;
  @IsOptional()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsBoolean()
  isActive?: boolean;
}