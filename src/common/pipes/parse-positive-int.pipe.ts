import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException({
        statusCode: 400,
        message: ['El id debe ser un entero positivo'],
        error: 'Bad Request',
      });
    }
    return id;
  }
}
