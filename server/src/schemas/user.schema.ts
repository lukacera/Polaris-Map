import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

interface Property {
  propertyId: mongoose.Schema.Types.ObjectId;
}

interface Preferences {
  currency: 'EUR' | 'USD' | 'GBP';
  measurementSystem: 'metric' | 'imperial';
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  googleId: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  displayName: string;

  @Prop()
  profilePicture: string;

  @Prop([{
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  }])
  properties: Property[];

  @Prop({ type: Date, default: Date.now })
  lastLogin: Date;

  @Prop({ 
    type: String, 
    enum: ['active', 'suspended', 'banned'], 
    default: 'active' 
  })
  status: string;

  @Prop({
    type: {
      currency: { 
        type: String, 
        enum: ['EUR', 'USD', 'GBP'], 
        default: 'EUR' 
      },
      measurementSystem: { 
        type: String, 
        enum: ['metric', 'imperial'], 
        default: 'metric' 
      }
    }
  })
  preferences: Preferences;

}

export const UserSchema = SchemaFactory.createForClass(User);