import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IInvoiceItem extends Document {
  invoiceId: mongoose.Types.ObjectId;
  psId: mongoose.Types.ObjectId; // Product/Service ID
  psDescription: string;
  qty: number;
  rate: number;
  discount: number;
  total: number;
  steps: 'Draft' | 'Design' | 'Printing' | 'Pending' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  allocation: string;
  userAllocation: string;
  estimatedDeliveryTime?: Date;
  baseCost: number;
  printingOperation?: string;
  printingReport?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoiceItemModel extends Model<IInvoiceItem> {
  getItemStatsByInvoice(invoiceId: string): Promise<any[]>;
  getStatusWiseStats(): Promise<any[]>;
  getItemsByPriority(priority: string): Promise<IInvoiceItem[]>;
}

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: [true, 'Invoice ID is required'],
      index: true,
    },
    psId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product/Service ID is required'],
      index: true,
    },
    psDescription: {
      type: String,
      required: [true, 'Product/Service description is required'],
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    qty: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than 0'],
      validate: {
        validator: function(v: number) {
          return /^\d+(\.\d{1,3})?$/.test(v.toString());
        },
        message: 'Quantity can have at most 3 decimal places'
      },
    },
    rate: {
      type: Number,
      required: [true, 'Rate is required'],
      min: [0, 'Rate cannot be negative'],
      validate: {
        validator: function(v: number) {
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Rate can have at most 2 decimal places'
      },
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      validate: {
        validator: function(v: number) {
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Discount can have at most 2 decimal places'
      },
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
      validate: {
        validator: function(v: number) {
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Total can have at most 2 decimal places'
      },
    },
    steps: {
      type: String,
      enum: {
        values: ['Draft', 'Design', 'Printing', 'Pending', 'Completed'],
        message: 'Steps must be one of: Draft, Design, Printing, Pending, Completed'
      },
      default: 'Draft',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be one of: Low, Medium, High'
      },
      default: 'Medium',
      index: true,
    },
    allocation: {
      type: String,
      required: [true, 'Allocation is required'],
      trim: true,
      maxlength: [100, 'Allocation cannot be more than 100 characters'],
    },
    userAllocation: {
      type: String,
      required: [true, 'User allocation is required'],
      trim: true,
      maxlength: [100, 'User allocation cannot be more than 100 characters'],
    },
    estimatedDeliveryTime: {
      type: Date,
      validate: {
        validator: function(v: Date) {
          return !v || v >= new Date();
        },
        message: 'Estimated delivery time cannot be in the past'
      },
    },
    baseCost: {
      type: Number,
      required: [true, 'Base cost is required'],
      min: [0, 'Base cost cannot be negative'],
      validate: {
        validator: function(v: number) {
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Base cost can have at most 2 decimal places'
      },
    },
    printingOperation: {
      type: String,
      trim: true,
      maxlength: [200, 'Printing operation cannot be more than 200 characters'],
    },
    printingReport: {
      type: String,
      trim: true,
      maxlength: [1000, 'Printing report cannot be more than 1000 characters'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for better query performance
invoiceItemSchema.index({ invoiceId: 1, steps: 1 });
invoiceItemSchema.index({ steps: 1, priority: 1 });
invoiceItemSchema.index({ estimatedDeliveryTime: 1 });
invoiceItemSchema.index({ allocation: 1, steps: 1 });
invoiceItemSchema.index({ userAllocation: 1, steps: 1 });

// Pre-save middleware to calculate total and round amounts
invoiceItemSchema.pre('save', function(next) {
  // Calculate total: (qty * rate) - discount
  const subtotal = this.qty * this.rate;
  this.total = Math.max(0, subtotal - this.discount);
  
  // Round amounts to appropriate decimal places
  this.qty = Math.round(this.qty * 1000) / 1000; // 3 decimal places for quantity
  this.rate = Math.round(this.rate * 100) / 100;
  this.discount = Math.round(this.discount * 100) / 100;
  this.total = Math.round(this.total * 100) / 100;
  this.baseCost = Math.round(this.baseCost * 100) / 100;

  next();
});

// Virtual for profit calculation
invoiceItemSchema.virtual('profit').get(function() {
  const totalBaseCost = this.qty * this.baseCost;
  return Math.round((this.total - totalBaseCost) * 100) / 100;
});

// Virtual for formatted amounts
invoiceItemSchema.virtual('formattedTotal').get(function() {
  return `₹${this.total.toFixed(2)}`;
});

invoiceItemSchema.virtual('formattedRate').get(function() {
  return `₹${this.rate.toFixed(2)}`;
});

invoiceItemSchema.virtual('formattedDiscount').get(function() {
  return `₹${this.discount.toFixed(2)}`;
});

// Static method to get item statistics by invoice
invoiceItemSchema.statics.getItemStatsByInvoice = function(invoiceId: string) {
  return this.aggregate([
    { $match: { invoiceId: new mongoose.Types.ObjectId(invoiceId), isDeleted: false } },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$qty' },
        totalAmount: { $sum: '$total' },
        totalDiscount: { $sum: '$discount' },
        totalBaseCost: { $sum: { $multiply: ['$qty', '$baseCost'] } }
      }
    }
  ]);
};

// Static method to get status-wise item statistics
invoiceItemSchema.statics.getStatusWiseStats = function() {
  return this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$steps',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get items by priority
invoiceItemSchema.statics.getItemsByPriority = function(priority: string) {
  return this.find({ 
    priority, 
    isDeleted: false,
    steps: { $nin: ['Completed'] }
  })
  .populate('invoiceId', 'invoiceId customerId invoiceDate')
  .populate('psId', 'ps_name ps_type')
  .sort({ estimatedDeliveryTime: 1, createdAt: 1 });
};

// Ensure virtuals are included in JSON output
invoiceItemSchema.set('toJSON', { virtuals: true });
invoiceItemSchema.set('toObject', { virtuals: true });

export default mongoose.model<IInvoiceItem, IInvoiceItemModel>('InvoiceItem', invoiceItemSchema); 