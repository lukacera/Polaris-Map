import {
    Controller,
    Get,
    HttpStatus,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from 'src/google-oauth.guard';
  
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get('google')
    @UseGuards(GoogleOAuthGuard)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async auth() {}

    @Get('google/callback')
    @UseGuards(GoogleOAuthGuard)
    async googleAuthCallback(@Req() req, @Res() res: Response) {
        const token = await this.authService.signIn(req.user);

        res.cookie('access_token', token, {
            maxAge: 2592000000,
            sameSite: true,
            secure: false,
        });

        return res.status(HttpStatus.OK)    
    }
}
  