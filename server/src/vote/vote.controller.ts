import { Controller, Post, Delete, Param, UseGuards, Req, Body, Get, BadRequestException } from '@nestjs/common';
import { VoteService } from './vote.service';
import { AuthGuard } from '@nestjs/passport';
import mongoose from 'mongoose';

interface Vote {
  propertyId: mongoose.Schema.Types.ObjectId;
  voteType: 'higher' | 'lower' | 'equal';
}

@Controller('vote')
@UseGuards(AuthGuard('jwt'))
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  // Helper method to validate ObjectId
  private validateObjectId(id: string, paramName: string): mongoose.Types.ObjectId {
    // First check if the string is a valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        `Invalid ${paramName} format. Must be a valid MongoDB ObjectId.`
      );
    }
    // If valid, convert string to ObjectId and return
    return new mongoose.Types.ObjectId(id);
  }

  @Get(':propertyId')
  async getUserVote(@Req() req: any, @Param('propertyId') propertyId: string): Promise<Vote> {
    // Validate both user ID and property ID
    const validUserId = this.validateObjectId(req.user._id, 'user ID');
    const validPropertyId = this.validateObjectId(propertyId, 'property ID');

    return this.voteService.getUserVote(
      validUserId,
      validPropertyId
    );
  }

  @Post(':propertyId')
  async addVote(
    @Req() req: any,
    @Param('propertyId') propertyId: string,
    @Body('voteType') voteType: 'higher' | 'lower'
  ) {

    // Validate IDs before processing
    const validUserId = this.validateObjectId(req.user.id, 'user ID');
    const validPropertyId = this.validateObjectId(propertyId, 'property ID');
    console.log("vote type is " + voteType)

    // Additional validation for voteType
    if (!voteType || !['higher', 'lower', 'equal'].includes(voteType)) {
      throw new BadRequestException(
        'voteType must be either "higher", "equal" or "lower"'
      );
    }

    return this.voteService.addVote(
      validUserId,
      validPropertyId,
      voteType
    );
  }

  @Delete(':propertyId')
  async removeVote(
    @Req() req: any,
    @Param('propertyId') propertyId: string
  ) {
    // Validate IDs before processing
    const validUserId = this.validateObjectId(req.user._id, 'user ID');
    const validPropertyId = this.validateObjectId(propertyId, 'property ID');

    return this.voteService.removeVote(
      validUserId,
      validPropertyId
    );
  }
}