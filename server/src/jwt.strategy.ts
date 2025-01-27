import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, User } from './schemas/user.schema';

export type JwtPayload = {
  id: string;
  email: string;
  image: string
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {
    const extractJwtFromCookie = (req) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies['token'];
      }
      return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: extractJwtFromCookie,
      passReqToCallback: true
    });
  }

  async validate(req: any, payload: JwtPayload) {
    const user = await this.userModel.findById(payload.id).exec();
    
    if (!user) {
      throw new UnauthorizedException('Please log in to continue');
    }

    await this.userModel.findByIdAndUpdate(user._id, {
      lastLogin: new Date()
    });

    return {
      id: payload.id,
      email: payload.email,
      image: payload.image
    };
  }
}