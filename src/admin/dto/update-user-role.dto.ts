import { IsEnum } from 'class-validator';
import { UserRole } from '../../auth/roles/user-role.enum';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
