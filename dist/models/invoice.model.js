"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Invoice item sub-schema
const invoiceItemSchema = new mongoose_1.Schema({
    product: {
        id: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product ID is required'],
        },
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: [0, 'Price cannot be negative'],
        },
        baseCost: {
            type: Number,
            required: [true, 'Product base cost is required'],
            min: [0, 'Base cost cannot be negative'],
        },
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high'],
            message: 'Priority must be one of: low, medium, high'
        },
        default: 'low',
    },
    deliveryDate: {
        type: Date,
        required: [true, 'Delivery date is required'],
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0.01, 'Quantity must be greater than 0'],
    },
    rate: {
        type: Number,
        required: [true, 'Rate is required'],
        min: [0, 'Rate cannot be negative'],
    },
    baseCost: {
        type: Number,
        required: [true, 'Base cost is required'],
        min: [0, 'Base cost cannot be negative'],
    },
    discountType: {
        type: String,
        enum: {
            values: ['percentage', 'fixed'],
            message: 'Discount type must be either percentage or fixed'
        },
        default: 'percentage',
    },
    discountValue: {
        type: Number,
        default: 0,
        min: [0, 'Discount value cannot be negative'],
    },
    total: {
        type: Number,
        required: [true, 'Total is required'],
        min: [0, 'Total cannot be negative'],
    },
    workInstruction: {
        type: String,
        trim: true,
        maxlength: [500, 'Work instruction cannot be more than 500 characters'],
    },
    printingInstructions: {
        type: String,
        trim: true,
        maxlength: [500, 'Printing instructions cannot be more than 500 characters'],
    },
});
const invoiceSchema = new mongoose_1.Schema({
    invoiceNumber: {
        type: String,
        required: [true, 'Invoice number is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Invoice number cannot be more than 50 characters'],
        index: true,
    },
    issuedDate: {
        type: Date,
        required: [true, 'Issued date is required'],
        index: true,
    },
    customer: {
        id: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer ID is required'],
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Customer phone is required'],
            trim: true,
        },
    },
    from: {
        name: {
            type: String,
            required: [true, 'From name is required'],
            trim: true,
        },
        address: {
            type: String,
            required: [true, 'From address is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'From phone is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'From email is required'],
            trim: true,
            lowercase: true,
        },
    },
    items: [invoiceItemSchema],
    summary: {
        subtotal: {
            type: Number,
            required: [true, 'Subtotal is required'],
            min: [0, 'Subtotal cannot be negative'],
        },
        totalDiscount: {
            type: Number,
            default: 0,
            min: [0, 'Total discount cannot be negative'],
        },
        grandTotal: {
            type: Number,
            required: [true, 'Grand total is required'],
            min: [0, 'Grand total cannot be negative'],
        },
        roundOffTotal: {
            type: Boolean,
            default: false,
        },
    },
    bottomNote: {
        type: String,
        trim: true,
        maxlength: [1000, 'Bottom note cannot be more than 1000 characters'],
    },
    acceptTerms: {
        type: Boolean,
        // required: [true, 'Accept terms is required'],
    },
    status: {
        type: String,
        enum: {
            values: ['draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
            message: 'Status must be one of: draft, pending, confirmed, in_progress, completed, cancelled'
        },
        default: 'draft',
        index: true,
    },
    // Legacy fields for backward compatibility
    paidAmount: {
        type: Number,
        default: 0,
        min: [0, 'Paid amount cannot be negative'],
    },
    dueAmount: {
        type: Number,
        default: 0,
        min: [0, 'Due amount cannot be negative'],
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Create compound indexes for better query performance
invoiceSchema.index({ 'customer.id': 1, issuedDate: -1 });
invoiceSchema.index({ status: 1, issuedDate: -1 });
invoiceSchema.index({ issuedDate: -1, 'summary.grandTotal': -1 });
invoiceSchema.index({ 'items.priority': 1, 'items.deliveryDate': 1 });
invoiceSchema.index({ dueAmount: -1 }); // For overdue invoices (legacy)
// Pre-save middleware to calculate totals and validate data
invoiceSchema.pre('save', function (next) {
    // Calculate summary totals from items
    let subtotal = 0;
    let totalDiscount = 0;
    this.items.forEach(item => {
        const itemSubtotal = item.quantity * item.rate;
        subtotal += itemSubtotal;
        if (item.discountType === 'percentage') {
            const discountAmount = (itemSubtotal * item.discountValue) / 100;
            totalDiscount += discountAmount;
            item.total = itemSubtotal - discountAmount;
        }
        else {
            totalDiscount += item.discountValue;
            item.total = itemSubtotal - item.discountValue;
        }
        // Ensure total is not negative
        item.total = Math.max(0, item.total);
        // Round to 2 decimal places
        item.total = Math.round(item.total * 100) / 100;
    });
    // Update summary
    this.summary.subtotal = Math.round(subtotal * 100) / 100;
    this.summary.totalDiscount = Math.round(totalDiscount * 100) / 100;
    this.summary.grandTotal = Math.round((subtotal - totalDiscount) * 100) / 100;
    // Handle round off
    if (this.summary.roundOffTotal) {
        this.summary.grandTotal = Math.round(this.summary.grandTotal);
    }
    // Calculate legacy due amount if paidAmount exists
    if (this.paidAmount !== undefined) {
        this.dueAmount = Math.max(0, this.summary.grandTotal - this.paidAmount);
        this.dueAmount = Math.round(this.dueAmount * 100) / 100;
        this.paidAmount = Math.round(this.paidAmount * 100) / 100;
    }
    next();
});
// Virtual for formatted amounts
invoiceSchema.virtual('formattedGrandTotal').get(function () {
    return `₹${this.summary.grandTotal.toFixed(2)}`;
});
invoiceSchema.virtual('formattedSubtotal').get(function () {
    return `₹${this.summary.subtotal.toFixed(2)}`;
});
invoiceSchema.virtual('formattedTotalDiscount').get(function () {
    return `₹${this.summary.totalDiscount.toFixed(2)}`;
});
invoiceSchema.virtual('formattedDueAmount').get(function () {
    if (this.dueAmount !== undefined) {
        return `₹${this.dueAmount.toFixed(2)}`;
    }
    return `₹${this.summary.grandTotal.toFixed(2)}`;
});
invoiceSchema.virtual('formattedPaidAmount').get(function () {
    if (this.paidAmount !== undefined) {
        return `₹${this.paidAmount.toFixed(2)}`;
    }
    return '₹0.00';
});
// Virtual for payment percentage
invoiceSchema.virtual('paymentPercentage').get(function () {
    if (this.summary.grandTotal === 0)
        return 0;
    const paid = this.paidAmount || 0;
    return Math.round((paid / this.summary.grandTotal) * 100);
});
// Virtual for total profit calculation
invoiceSchema.virtual('totalProfit').get(function () {
    let totalProfit = 0;
    this.items.forEach(item => {
        const itemBaseCost = item.quantity * item.baseCost;
        totalProfit += item.total - itemBaseCost;
    });
    return Math.round(totalProfit * 100) / 100;
});
// Static method to generate next invoice number
// Add static method to generate invoice ID
invoiceSchema.statics.generateInvoiceId = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const currentYear = new Date().getFullYear();
        const prefix = `INV-${currentYear}-`;
        // Find the last invoice with the current year prefix
        const lastInvoice = yield this.findOne({ invoiceId: { $regex: `^${prefix}` } }, {}, { sort: { invoiceId: -1 } });
        let nextNumber = 1;
        if (lastInvoice && lastInvoice.invoiceId) {
            const lastNumber = parseInt(lastInvoice.invoiceId.split('-').pop() || '0');
            nextNumber = lastNumber + 1;
        }
        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    });
};
// Static method to get invoice statistics
invoiceSchema.statics.getInvoiceStats = function (startDate, endDate) {
    const matchStage = { isDeleted: false };
    if (startDate || endDate) {
        matchStage.issuedDate = {};
        if (startDate)
            matchStage.issuedDate.$gte = startDate;
        if (endDate)
            matchStage.issuedDate.$lte = endDate;
    }
    return this.aggregate([
        { $match: matchStage },
        {
            $addFields: {
                totalProfit: {
                    $reduce: {
                        input: '$items',
                        initialValue: 0,
                        in: {
                            $add: [
                                '$$value',
                                {
                                    $subtract: [
                                        '$$this.total',
                                        { $multiply: ['$$this.quantity', '$$this.baseCost'] }
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $group: {
                _id: null,
                totalInvoices: { $sum: 1 },
                totalAmount: { $sum: '$summary.grandTotal' },
                totalPaid: { $sum: { $ifNull: ['$paidAmount', 0] } },
                totalDue: { $sum: { $ifNull: ['$dueAmount', '$summary.grandTotal'] } },
                totalProfit: { $sum: '$totalProfit' },
                averageInvoiceAmount: { $avg: '$summary.grandTotal' },
            }
        }
    ]);
};
// Static method to get status-wise statistics
invoiceSchema.statics.getStatusStats = function () {
    return this.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$summary.grandTotal' },
                totalDue: { $sum: { $ifNull: ['$dueAmount', '$summary.grandTotal'] } }
            }
        },
        { $sort: { count: -1 } }
    ]);
};
// Ensure virtuals are included in JSON output
invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });
exports.default = mongoose_1.default.model('Invoice', invoiceSchema);
