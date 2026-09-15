import { ConflictException, NotFoundException } from '@nestjs/common';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let service: StudentService;

  beforeEach(() => {
    service = new StudentService();
  });

  it('filters students by all supplied fields', () => {
    expect(service.findAll({ career: 'Computer Science', semester: 5, isActive: true })).toHaveLength(1);
  });

  it('rejects duplicate emails on create and update', () => {
    expect(() => service.create({
      name: 'New Student', email: 'john.doe@example.com', age: 19,
      career: 'Engineering', semester: 1, isActive: true,
    })).toThrow(ConflictException);
    expect(() => service.update(1, { email: 'jane.smith@example.com' })).toThrow(ConflictException);
  });

  it('throws when the student does not exist', () => {
    expect(() => service.findOne(99)).toThrow(NotFoundException);
    expect(() => service.update(99, { name: 'Missing' })).toThrow(NotFoundException);
    expect(() => service.remove(99)).toThrow(NotFoundException);
  });

  it('does not delete inactive students and changes only status', () => {
    expect(() => service.remove(3)).toThrow(ConflictException);
    expect(service.updateStatus(1, false)).toMatchObject({ id: 1, isActive: false });
  });
});