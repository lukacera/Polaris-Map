import mongoose from "mongoose";

const userSchema = {
    googleId: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String, 
      required: true,
      unique: true
    },
    displayName: String,
    profilePicture: String,
  
    // Podaci vezani za nekretnine
    properties: [{
      propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
  
    votes: [{
      propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
      },
      voteType: {
        type: String,
        enum: ['higher', 'lower']
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
  
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active'
    },
  
    preferences: {
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
  }