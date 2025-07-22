import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  ps_name: string;
  ps_type: 'product' | 'service';
  ps_unit?: string;
  ps_tax?: number;
  ps_hsn_code?: string;
  ps_code?: string;
  printing_operator_code?: string;
  ps_photo?: string;
  ps_base_cost?: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    ps_name: {
      type: String,
      required: [true, 'Product/Service name is required'],
      trim: true,
      maxlength: [100, 'Product/Service name cannot be more than 100 characters'],
      index: true,
    },
    ps_type: {
      type: String,
      enum: {
        values: ['product', 'service'],
        message: 'Type must be either product or service'
      },
      default: 'service',
      required: [true, 'Product/Service type is required'],
      index: true,
    },
    ps_unit: {
      type: String,
      trim: true,
      maxlength: [20, 'Unit cannot be more than 20 characters'],
    },
    ps_tax: {
      type: Number,
      enum: {
        values: [0, 5, 12, 18, 28],
        message: 'Tax must be one of: 0, 5, 12, 18, 28'
      },
      default: 0,
    },
    ps_hsn_code: {
      type: String,
      trim: true,
      maxlength: [50, 'HSN/Service code cannot be more than 50 characters'],
      index: true, // Allow duplicates but index for faster search
    },
    ps_code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allows null/undefined values but ensures uniqueness when present
      maxlength: [50, 'Product code cannot be more than 50 characters'],
      validate: {
        validator: function(v: string) {
          return !v || v.length > 0; // If provided, must not be empty string
        },
        message: 'Product code cannot be empty'
      },
    },
    printing_operator_code: {
      type: String,
      trim: true,
      maxlength: [50, 'Printing operator code cannot be more than 50 characters'],
    },
    ps_photo: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Optional field
          // Basic URL validation or local file path
          return /^(https?:\/\/.+|\/uploads\/.+)/.test(v);
        },
        message: 'Photo must be a valid URL or file path'
      },
    },
    ps_base_cost: {
      type: Number,
      min: [0, 'Base cost cannot be negative'],
      validate: {
        validator: function(v: number) {
          return v === undefined || v === null || v >= 0;
    },
        message: 'Base cost must be a positive number'
    },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    // Ensure proper indexing for common queries
  }
);

// Create compound indexes for better query performance
productSchema.index({ ps_type: 1, ps_name: 1 });
productSchema.index({ ps_type: 1, ps_tax: 1 });

// Pre-save middleware to ensure ps_code uniqueness only when provided
productSchema.pre('save', async function(next) {
  if (this.ps_code === '') {
    this.ps_code = undefined;
  }
  next();
});

// Virtual for full product identification
productSchema.virtual('fullIdentifier').get(function() {
  return this.ps_code ? `${this.ps_name} (${this.ps_code})` : this.ps_name;
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model<IProduct>('Product', productSchema); 