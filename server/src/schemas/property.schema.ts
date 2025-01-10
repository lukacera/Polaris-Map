import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'properties'
})

export class Property {
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  })
  geometry: {
    type: string;
    coordinates: number[];
  };

  // Properties
  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ 
    required: true, 
    type: String,
    enum: ['Apartment', 'House']
  })
  type: string;

  @Prop({ required: true, type: Number })
  size: number;

  @Prop({ required: true, type: Number, min: 1 })
  rooms: number;

  @Prop({ required: true, type: Number })
  yearBuilt: number;

  @Prop({ 
    required: true, 
    type: String,
    enum: ['Buy', 'Rent']
  })
  status: string;

  @Prop({ 
    type: Number, 
    required: true,
    index: true 
  })
  pricePerSquareMeter: number;

  @Prop({
    type: Number,
    default: 100,
    min: 0,
    max: 100
  })
  dataReliability: number;

  @Prop({ 
    type: Number, 
    default: 0
  })
  numberOfReviews?: number;
}

export type PropertyDocument = Property & Document;
export const PropertySchema = SchemaFactory.createForClass(Property);
