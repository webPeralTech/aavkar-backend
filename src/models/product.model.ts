import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  type: 'product' | 'service';
  unit?: string;
  code?: string;
  photoUrl?: string;
  baseCost?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot be more than 100 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['product', 'service'],
        message: 'Type must be either product or service'
      },
      default: 'service',
      required: [true, 'Product type is required'],
    },
    unit: {
      type: String,
      trim: true,
      maxlength: [20, 'Unit cannot be more than 20 characters'],
    },
    code: {
      type: String,
      trim: true,
      maxlength: [50, 'Code cannot be more than 50 characters'],
    },
    photoUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Optional field
          // Basic URL validation
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Photo URL must be a valid URL'
      },
    },
    baseCost: {
      type: Number,
      min: [0, 'Base cost cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
productSchema.index({ name: 1 });
productSchema.index({ code: 1 });
productSchema.index({ type: 1 });
productSchema.index({ isActive: 1 });

// Compound index for common queries
productSchema.index({ type: 1, isActive: 1 });

export default mongoose.model<IProduct>('Product', productSchema); 