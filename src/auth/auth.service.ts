import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CredentialsDto } from './dto/credentials.dto';

export type SafeUser = Pick<User, 'id' | 'email' | 'createdAt'>;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(credentials: CredentialsDto): Promise<SafeUser> {
    const email = this.normalizeEmail(credentials.email);
    const existing = await this.userRepository.findOneBy({ email });
    if (existing) throw new ConflictException('El correo ya está registrado');

    const user = this.userRepository.create({
      email,
      passwordHash: await bcrypt.hash(credentials.password, 10),
    });
    try {
      const created = await this.userRepository.save(user);
      return this.toSafeUser(created);
    } catch (error) {
      if (error instanceof QueryFailedError && this.isUniqueViolation(error)) {
        throw new ConflictException('El correo ya está registrado');
      }
      throw error;
    }
  }

  async login(credentials: CredentialsDto): Promise<SafeUser> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', {
        email: this.normalizeEmail(credentials.email),
      })
      .getOne();

    if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    return this.toSafeUser(user);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toSafeUser(user: User): SafeUser {
    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }

  private isUniqueViolation(error: QueryFailedError): boolean {
    const driverError = error.driverError as { code?: string };
    return driverError?.code === '23505';
  }
}
