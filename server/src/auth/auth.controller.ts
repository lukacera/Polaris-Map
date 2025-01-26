import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from 'src/google-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async auth() {}

  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const token = await this.authService.signIn(req.user as any);

    console.log('Token:', token);
    console.log("pathname:", req.path);
    res.cookie('token', token, {
      maxAge: 2592000000, // 30 days
      sameSite: process.env.NODE_ENV.toLowerCase() === 'production' ? 'none' : 'strict',
      secure: process.env.NODE_ENV.toLowerCase() === 'production',
      httpOnly: true,
    });
    

    return res.redirect(process.env.CLIENT_URL);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    try {
      await this.authService.logout(res);
      
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error during logout',
      });
    }
  }

  @Get('verify-token')
  async verifyToken(@Req() request: Request, @Res() res: Response) {
    const token = request.cookies['token'];
    if (!token) {
      await this.authService.logout(res);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Token is missing'
      });
    }
  
    try {
      const decoded = this.authService.verify(token);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Token is valid',
        user: decoded
      });
    } catch (error) {
      await this.authService.logout(res);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token'
      });
    }
  }

}
