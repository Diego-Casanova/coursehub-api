import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CourseQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['beginner', 'intermediate', 'advanced'], {
    message: 'level no es válido',
  })
  level?: string;
 
  @IsOptional()
  @IsIn(['id', 'title', 'level'], {
    message: 'sortBy debe ser id, title o level',
  })
  sortBy: 'id' | 'title' | 'level' = 'id';

  @IsOptional()
  @IsIn(['ASC', 'DESC'], { message: 'order debe ser ASC o DESC' })
  order: 'ASC' | 'DESC' = 'ASC';
}
