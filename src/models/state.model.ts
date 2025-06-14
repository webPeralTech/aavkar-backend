import mongoose, { Document, Schema } from 'mongoose';

export interface IState extends Document {
  name: string;
  isoCode: string;
  countryCode: string;
  latitude?: string;
  longitude?: string;
  createdAt: Date;
  updatedAt: Date;
}

const stateSchema = new Schema<IState>(
  {
    name: {
      type: String,
      required: [true, 'State name is required'],
      trim: true,
    },
    isoCode: {
      type: String,
      required: [true, 'ISO code is required'],
      uppercase: true,
      trim: true,
    },
    countryCode: {
      type: String,
      required: [true, 'Country code is required'],
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
stateSchema.index({ countryCode: 1, name: 1 });
stateSchema.index({ countryCode: 1, isoCode: 1 }, { unique: true });

export default mongoose.model<IState>('State', stateSchema); 