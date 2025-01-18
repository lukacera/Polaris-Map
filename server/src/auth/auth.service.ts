import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  generateJwt(payload) {
    return this.jwtService.sign(payload);
  }

  async signIn(googleUser) {
    if (!googleUser) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.findUserByEmail(googleUser.email);

    if (!userExists) {
      return this.registerUser(googleUser);
    }

    await this.userModel.findByIdAndUpdate(userExists._id, {
      lastLogin: new Date()
    });

    return this.generateJwt({
      sub: userExists._id,
      email: userExists.email,
    });
  }

  async registerUser(googleUser: any) {
    try {
      const newUser = new this.userModel({
        googleId: googleUser.googleId,
        email: googleUser.email,
        displayName: googleUser.firstName + ' ' + googleUser.lastName,
        profilePicture: googleUser.picture,
        preferences: {
          currency: 'EUR',
          measurementSystem: 'metric'
        },
        properties: [],
        votes: [],
        status: 'active'
      });

      const savedUser = await newUser.save();

      return this.generateJwt({
        sub: savedUser._id,
        email: savedUser.email,
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw new InternalServerErrorException();
    }
  }

  async findUserByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findUserByGoogleId(googleId: string) {
    return this.userModel.findOne({ googleId }).exec();
  }
}