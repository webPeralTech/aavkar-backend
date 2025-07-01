import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  // firstName: string;
  // lastName: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  gst_no?: string;
  // address?: {
  //   street?: string;
  //   city?: string;
  //   state?: string;
  //   zipCode?: string;
  //   country?: string;
  // };
  notes?: string;
  city?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    // firstName: {
    //   type: String,
    //   required: [true, 'First name is required'],
    //   trim: true,
    //   maxlength: [50, 'First name cannot be more than 50 characters'],
    // },
    // lastName: {
    //   type: String,
    //   required: [true, 'Last name is required'],
    //   trim: true,
    //   maxlength: [50, 'Last name cannot be more than 50 characters'],
    // },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot be more than 100 characters'],
    },
    gst_no: {
      type: String,
      trim: true,
      maxlength: [15, 'GST number cannot be more than 15 characters'],
    },
    address: {
      type : String,
      trim: true,
    },
    city: {
      type : String,
      trim: true,
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot be more than 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
customerSchema.index({ email: 1 });
customerSchema.index({ company: 1 });

export default mongoose.model<ICustomer>('Customer', customerSchema);
