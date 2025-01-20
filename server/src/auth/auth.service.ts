import { Injectable, BadRequestException, InternalServerErrorException, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Response } from 'express';

type googleStrategyUser = {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
  googleId: string,
  displayName: string
};

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  generateJwt(payload) {
    try {
      const token = this.jwtService.sign(payload);
      return token;
    } catch (error) {
      console.error("JWT generation error:", error);
      throw error;
    }
  }

  verify(payload) {
    try {
      const token = this.jwtService.verify(payload);
      return token;
    } catch (error) {
      console.error("JWT generation error:", error);
      throw error;
    }
  }

  async logout(@Res() response: Response) {
    try {
      // Clear the HTTP-only cookie
      return response.clearCookie('token')
    } catch (error) {
      console.error('Logout error:', error);
      throw new InternalServerErrorException('Error during logout');
    }
  }
    
  async signIn(googleUser: googleStrategyUser) {
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
      image: userExists.profilePicture
    });
  }

  async registerUser(googleUser: googleStrategyUser) {
    try {
      const newUser = new this.userModel({
        googleId: googleUser.googleId,
        email: googleUser.email,
        displayName: googleUser.displayName,
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
        image: savedUser.profilePicture
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