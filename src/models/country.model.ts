import mongoose, { Document, Schema } from 'mongoose';

export interface ICountry extends Document {
  name: string;
  isoCode: string;
  flag: string;
  phonecode: string;
  currency: string;
  latitude: string;
  longitude: string;
  createdAt: Date;
  updatedAt: Date;
}

const countrySchema = new Schema<ICountry>(
  {
    name: {
      type: String,
      required: [true, 'Country name is required'],
      trim: true,
      unique: true,
    },
    isoCode: {
      type: String,
      required: [true, 'ISO code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    flag: {
      type: String,
      trim: true,
    },
    phonecode: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
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

// Create indexes for better performance
// countrySchema.index({ name: 1 }); // Removed: already has unique: true
// countrySchema.index({ isoCode: 1 }); // Removed: already has unique: true

export default mongoose.model<ICountry>('Country', countrySchema); 