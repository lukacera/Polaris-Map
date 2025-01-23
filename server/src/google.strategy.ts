import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { GoogleUser } from './types/GoogleUser';

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
    profile: GoogleUser,
): Promise<any> {
    const { name, emails, photos, id, displayName } = profile;
    
    return {
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        displayName: displayName,
        picture: photos[0].value,
        accessToken,
        googleId: id
    };
  }
}
