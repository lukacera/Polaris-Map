import { Controller, Post, Delete, Param, UseGuards, Req, Body, Get } from '@nestjs/common';
import { VoteService } from './vote.service';
import { AuthGuard } from '@nestjs/passport';
import mongoose from 'mongoose';

interface Vote {
  propertyId: mongoose.Schema.Types.ObjectId;
  voteType: 'higher' | 'lower';
}

@Controller('vote')
@UseGuards(AuthGuard('jwt'))
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  // Get user's vote for a property
  @Get(':propertyId')
  async getUserVote(@Req() req: any, @Param('propertyId') propertyId: string): Promise<Vote> {
    return this.voteService.getUserVote(req.user._id, propertyId);
  }

  // Add new vote
  @Post(':propertyId')
  async addVote(
    @Req() req: any,
    @Param('propertyId') propertyId: string,
    @Body('voteType') voteType: 'higher' | 'lower'
  ) {
    return this.voteService.addVote(req.user._id, propertyId, voteType);
  }

  // Remove vote
  @Delete(':propertyId')
  async removeVote(
    @Req() req: any,
    @Param('propertyId') propertyId: string
  ) {
    return this.voteService.removeVote(req.user._id, propertyId);
  }
}