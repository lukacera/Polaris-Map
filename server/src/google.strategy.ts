import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google-redirect',
      scope: ['email', 'profile'],
      passReqToCallback: true
    });
  }

  // !! IMPORTANT
  // When passReqToCallback is used in the super obje
  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
): Promise<any> {
    console.log('Access Token:', accessToken)
    console.log('Refresh Token:', refreshToken)
    console.log('Profile from Google:', profile);
    
    const { name, emails, photos } = profile;
    
    return {
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        picture: photos[0].value,
        accessToken,
        refreshToken
    };
  }
}
