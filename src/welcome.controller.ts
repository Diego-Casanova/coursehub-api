import {Controller, Get} from '@nestjs/common';
import {WelcomeService} from './welcome.service';

@Controller('welcome') 
export class WelcomeController {
    contructor(private readonly welcomeService: WelcomeService)

    @Get()
    getWelcome(): {message:string} {
        return this.welcomeService.getMessage();

    }
}