import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IInvoice extends Document {
  invoiceId: string;
  customerId: mongoose.Types.ObjectId;
  invoiceDate: Date;
  totalAmount: number; // Grand Total
  paidAmount: number;
  dueAmount: number;
  invoiceStatus: 'Paid' | 'Unpaid' | 'Partially Paid';
  totalDiscount: number;
  roundOff: number;
  profitCalculated: number; // From base cost
  baseCost: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvoiceModel extends Model<IInvoice> {
  generateInvoiceId(): Promise<string>;
  getInvoiceStats(startDate?: Date, endDate?: Date): Promise<any[]>;
  getStatusStats(): Promise<any[]>;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceId: {
      type: String,
      required: [true, 'Invoice ID is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Invoice ID cannot be more than 50 characters'],
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    invoiceDate: {
      type: Date,
      required: [true, 'Invoice date is required'],
      index: true,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
      validate: {
        validator: function(v: number) {
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Total amount can have at most 2 decimal places'
      },
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
      validate: {
        validator: function(v: number) {
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Paid amount can have at most 2 decimal places'
      },
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: [0, 'Due amount cannot be negative'],
      validate: {
        validator: function(v: number) {
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Due amount can have at most 2 decimal places'
      },
    },
    invoiceStatus: {
      type: String,
      enum: {
        values: ['Paid', 'Unpaid', 'Partially Paid'],
        message: 'Invoice status must be one of: Paid, Unpaid, Partially Paid'
      },
      default: 'Unpaid',
      index: true,
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Total discount cannot be negative'],
      validate: {
        validator: function(v: number) {
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Total discount can have at most 2 decimal places'
      },
    },
    roundOff: {
      type: Number,
      default: 0,
      validate: {
        validator: function(v: number) {
          return /^-?\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Round off can have at most 2 decimal places'
      },
    },
    profitCalculated: {
      type: Number,
      default: 0,
      validate: {
        validator: function(v: number) {
          return /^-?\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Profit calculated can have at most 2 decimal places'
      },
    },
    baseCost: {
      type: Number,
      default: 0,
      min: [0, 'Base cost cannot be negative'],
      validate: {
        validator: function(v: number) {
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Base cost can have at most 2 decimal places'
      },
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
invoiceSchema.index({ customerId: 1, invoiceDate: -1 });
invoiceSchema.index({ invoiceStatus: 1, invoiceDate: -1 });
invoiceSchema.index({ invoiceDate: -1, totalAmount: -1 });
invoiceSchema.index({ dueAmount: -1 }); // For overdue invoices

// Pre-save middleware to calculate due amount and auto-update status
invoiceSchema.pre('save', function(next) {
  // Calculate due amount
  this.dueAmount = Math.max(0, this.totalAmount - this.paidAmount);
  
  // Auto-update invoice status based on payment
  if (this.paidAmount === 0) {
    this.invoiceStatus = 'Unpaid';
  } else if (this.paidAmount >= this.totalAmount) {
    this.invoiceStatus = 'Paid';
    this.dueAmount = 0;
  } else if (this.paidAmount > 0 && this.paidAmount < this.totalAmount) {
    this.invoiceStatus = 'Partially Paid';
  }

  // Round amounts to 2 decimal places
  this.totalAmount = Math.round(this.totalAmount * 100) / 100;
  this.paidAmount = Math.round(this.paidAmount * 100) / 100;
  this.dueAmount = Math.round(this.dueAmount * 100) / 100;
  this.totalDiscount = Math.round(this.totalDiscount * 100) / 100;
  this.roundOff = Math.round(this.roundOff * 100) / 100;
  this.profitCalculated = Math.round(this.profitCalculated * 100) / 100;
  this.baseCost = Math.round(this.baseCost * 100) / 100;

  next();
});

// Virtual for formatted amounts
invoiceSchema.virtual('formattedTotalAmount').get(function() {
  return `₹${this.totalAmount.toFixed(2)}`;
});

invoiceSchema.virtual('formattedDueAmount').get(function() {
  return `₹${this.dueAmount.toFixed(2)}`;
});

invoiceSchema.virtual('formattedPaidAmount').get(function() {
  return `₹${this.paidAmount.toFixed(2)}`;
});

// Virtual for payment percentage
invoiceSchema.virtual('paymentPercentage').get(function() {
  if (this.totalAmount === 0) return 0;
  return Math.round((this.paidAmount / this.totalAmount) * 100);
});

// Static method to generate next invoice ID
invoiceSchema.statics.generateInvoiceId = async function() {
  const lastInvoice = await this.findOne({ isDeleted: false }, {}, { sort: { 'createdAt': -1 } });
  
  if (!lastInvoice) {
    return 'INV-001';
  }

  const lastId = lastInvoice.invoiceId;
  const lastNumber = parseInt(lastId.split('-')[1]);
  const nextNumber = lastNumber + 1;
  
  return `INV-${nextNumber.toString().padStart(3, '0')}`;
};

// Static method to get invoice statistics
invoiceSchema.statics.getInvoiceStats = function(startDate?: Date, endDate?: Date) {
  const matchStage: any = { isDeleted: false };
  if (startDate || endDate) {
    matchStage.invoiceDate = {};
    if (startDate) matchStage.invoiceDate.$gte = startDate;
    if (endDate) matchStage.invoiceDate.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalPaid: { $sum: '$paidAmount' },
        totalDue: { $sum: '$dueAmount' },
        totalProfit: { $sum: '$profitCalculated' },
        averageInvoiceAmount: { $avg: '$totalAmount' },
      }
    }
  ]);
};

// Static method to get status-wise statistics
invoiceSchema.statics.getStatusStats = function() {
  return this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$invoiceStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalDue: { $sum: '$dueAmount' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Ensure virtuals are included in JSON output
invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

export default mongoose.model<IInvoice, IInvoiceModel>('Invoice', invoiceSchema); 