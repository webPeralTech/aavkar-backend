import mongoose, { Document, Schema } from 'mongoose';

export interface ICity extends Document {
  name: string;
  countryCode: string;
  stateCode: string;
  latitude?: string;
  longitude?: string;
  createdAt: Date;
  updatedAt: Date;
}

const citySchema = new Schema<ICity>(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
    },
    countryCode: {
      type: String,
      required: [true, 'Country code is required'],
      uppercase: true,
      trim: true,
    },
    stateCode: {
      type: String,
      required: [true, 'State code is required'],
      uppercase: true,
      trim: true,
    },
    latitude: {
      type: String,
      trim: true,
    },
    longitude: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for better performance
citySchema.index({ countryCode: 1, stateCode: 1, name: 1 });
citySchema.index({ countryCode: 1, stateCode: 1 });

export default mongoose.model<ICity>('City', citySchema); 