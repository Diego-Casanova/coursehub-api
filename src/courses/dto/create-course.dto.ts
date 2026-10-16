import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto{
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsIn(['beginner', 'intermediate', 'advanced'])
    level: string
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  level?: string;
}