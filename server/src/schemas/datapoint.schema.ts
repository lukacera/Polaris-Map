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
    enum: ['Condo', 'House']
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
    enum: ['A', 'B', 'C', 'D', 'E', 'F']
  })
  energyClass: string;

  @Prop({ 
    required: true, 
    type: String,
    enum: ['Na prodaju', 'Izdavanje']
  })
  status: string;

  @Prop({ 
    type: Number, 
    required: true,
    index: true 
  })
  pricePerSquareMeter: number;
}

export type PropertyDocument = Property & Document;
export const PropertySchema = SchemaFactory.createForClass(Property);

// Dodavanje indeksa
PropertySchema.index({ geometry: '2dsphere' });
PropertySchema.index({ price: 1 });
PropertySchema.index({ type: 1 });
PropertySchema.index({ status: 1 });
PropertySchema.index({ size: 1 });
