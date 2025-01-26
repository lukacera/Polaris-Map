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

      console.log(existingVote)
      if (existingVote) {
        throw new HttpException(
          'User already voted for this property',
          HttpStatus.BAD_REQUEST
        );
      }

      // Update property metrics
      const newNumberOfReviews = property.numberOfReviews + 1;
      const newDataReliability = this.calculateNewReliability(property, voteType);

      // Check if property should be deleted based on reliability
      if ((property.dataReliability <= 2) && (voteType === 'higher' || voteType === 'lower')) {
        // Delete the property
        await this.propertyModel.deleteOne({ _id: propertyId }, { session });
        await session.commitTransaction();
        return; // Exit early since property is deleted
      }

      // If not deleting, update the property metrics
      await this.propertyModel.updateOne(
        { _id: propertyId },
        { 
          $push: { 
            votes: {
              userId: new Types.ObjectId(userId),
              voteType
            }
          },
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
      const voteToRemove = property.votes.find(
        vote => vote.userId.toString() === userId.toString()
      );

      if (!voteToRemove) {
        throw new HttpException('Vote not found', HttpStatus.NOT_FOUND);
      }
      const newNumberOfReviews = property.numberOfReviews - 1;
      const newDataReliability = this.calculateNewReliability(
        property, 
        voteToRemove.voteType,
        true // indicates vote removal
      );

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
    
    // Base impact values
    const baseImpact = voteType === 'equal' ? 0 : 2;
    
    // Reverse impact if removing vote
    const impact = isRemoval ? -baseImpact : baseImpact;
    
    return currentReliability + impact
  }
}