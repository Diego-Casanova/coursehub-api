import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../auth/roles/user-role.enum';

@Injectable()
export class AdminService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  findUsers() {
    return this.users.find({
      select: { id: true, email: true, role: true, createdAt: true },
      order: { id: 'ASC' },
    });
  }

  async updateUserRole(id: number, role: UserRole) {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException(`La cuenta ${id} no existe`);

    if (user.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
      const adminCount = await this.users.countBy({ role: UserRole.ADMIN });
      if (adminCount <= 1) {
        throw new ConflictException('No se puede quitar el último administrador');
      }
    }

    user.role = role;
    const updated = await this.users.save(user);
    return {
      id: updated.id,
      email: updated.email,
      role: updated.role,
      createdAt: updated.createdAt,
    };
  }
}
