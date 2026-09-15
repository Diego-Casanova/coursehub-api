import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseStudentIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('Student id must be a positive integer');
    }
    return id;
  }
}