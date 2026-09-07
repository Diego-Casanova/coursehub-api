import { Injectable } from '@nestjs/common';
import { WelcomeService } from './welcome.service';

@Injectable()
export class WelcomeService {
    getMessage(): {message: string} {
        return {message: 'Bienvenido a CourseHub API'};
    } 

}
