import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Property, PropertyDocument } from '../schemas/property.schema';
import { User, UserDocument } from '../schemas/user.schema';

interface Vote {
  userId: mongoose.Schema.Types.ObjectId;
  voteType: 'higher' | 'lower' | 'equal';
}

@Injectable()
export class VoteService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
  ) {}

  // Get user's vote for specific property
  async getUserVote(userId: mongoose.Types.ObjectId, propertyId: mongoose.Types.ObjectId): Promise<Vote> {
    const property = await this.propertyModel.findById(propertyId);
    if (!property) {
      throw new HttpException('property not found', HttpStatus.NOT_FOUND);
    }

    return property.votes.find(
      vote => vote.userId.toString() === userId.toString()
    );
  }

  // Add new vote
  async addVote(userId: mongoose.Types.ObjectId, propertyId: mongoose.Types.ObjectId, voteType: 'higher' | 'lower') {
    
    const session = await this.userModel.db.startSession();
    try {
      session.startTransaction();

      // Check if property exists
      const property = await this.propertyModel.findById(propertyId);
      if (!property) {
        throw new HttpException('Property not found', HttpStatus.NOT_FOUND);
      }
      const existingVote = property.votes.find(
        vote => vote.userId.toString() === userId.toString()
      );

      if (existingVote) {
        throw new HttpException(
          'User already voted for this property',
          HttpStatus.BAD_REQUEST
        );
      }

      // Add vote to user
      await this.userModel.updateOne(
        { _id: userId },
        { 
          $push: { 
            votes: {
              propertyId: new Types.ObjectId(propertyId),
              voteType
            }
          }
        },
        { session }
      );

      // Update property metrics
      const newNumberOfReviews = property.numberOfReviews + 1;
      const newDataReliability = this.calculateNewReliability(property, voteType);

      await this.propertyModel.updateOne(
        { _id: propertyId },
        { 
          $set: {
            numberOfReviews: newNumberOfReviews,
            dataReliability: newDataReliability
          }
        },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Remove vote
  async removeVote(userId: mongoose.Types.ObjectId, propertyId: mongoose.Types.ObjectId) {
    console.log('Starting removeVote function');
    const session = await this.userModel.db.startSession();
    
    try {
      session.startTransaction();
      console.log('Transaction started');

      // Find user and their vote
      const property = await this.propertyModel.findById(propertyId);
      if (!property) {
        console.log('User not found');
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      console.log('Property found found:', property);

      const voteToRemove = property.votes.find(
        vote => vote.userId.toString() === propertyId.toString()
      );

      if (!voteToRemove) {
        console.log('Vote not found');
        throw new HttpException('Vote not found', HttpStatus.NOT_FOUND);
      }
      console.log('Vote to remove found:', voteToRemove);

      const newNumberOfReviews = property.numberOfReviews - 1;
      const newDataReliability = this.calculateNewReliability(
        property, 
        voteToRemove.voteType,
        true // indicates vote removal
      );
      console.log('New number of reviews:', newNumberOfReviews);
      console.log('New data reliability:', newDataReliability);

      await this.propertyModel.updateOne(
        { _id: propertyId },
        { 
          $set: {
            numberOfReviews: newNumberOfReviews,
            dataReliability: newDataReliability
          },
          $pull: { 
            votes: { 
              userId: new Types.ObjectId(userId) 
            } 
          } 
        },
        { session }
      );
      console.log('Property updated');

      await session.commitTransaction();
      console.log('Transaction committed');
    } catch (error) {
      await session.abortTransaction();
      console.log('Transaction aborted due to error:', error);
      throw error;
    } finally {
      session.endSession();
      console.log('Session ended');
    }
  }

  // Helper function to calculate new reliability score
  private calculateNewReliability(
    property: Property, 
    voteType: 'higher' | 'lower' | 'equal', 
    isRemoval: boolean = false
  ): number {
    const currentReliability = property.dataReliability;
    const totalVotes = property.numberOfReviews;
    
    // Base impact values
    const baseImpact = voteType === 'higher' ? -2 : 2;
    
    // Reverse impact if removing vote
    const impact = isRemoval ? -baseImpact : baseImpact;
    
    // Vote weight decreases as total votes increase
    const weight = 1 / (totalVotes + 1);
    
    const newReliability = currentReliability + (impact * weight);
    
    // Ensure value stays within 0-100 range
    return Math.max(0, Math.min(100, newReliability));
  }
}