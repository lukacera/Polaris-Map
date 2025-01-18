import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { GoogleUser } from 'src/types/GoogleUser';

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
    console.log("generating JWT")
    return this.jwtService.sign(payload);
  }

  async signIn(googleUser: googleStrategyUser) {
    if (!googleUser) {
      throw new BadRequestException('Unauthenticated');
    }

    console.log(googleUser)
    const userExists = await this.findUserByEmail(googleUser.email);

    if (!userExists) {
      return this.registerUser(googleUser);
    }

    await this.userModel.findByIdAndUpdate(userExists._id, {
      lastLogin: new Date()
    });

    console.log("All good!")
    return this.generateJwt({
      sub: userExists._id,
      email: userExists.email,
    });
  }

  async registerUser(googleUser: googleStrategyUser) {
    console.log("Registering user!!")
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