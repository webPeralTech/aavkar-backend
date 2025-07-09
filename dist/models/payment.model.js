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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const paymentSchema = new mongoose_1.Schema({
    p_type: {
        type: String,
        enum: {
            values: ['cash', 'cheque', 'UPI'],
            message: 'Payment type must be one of: cash, cheque, UPI'
        },
        required: [true, 'Payment type is required'],
        index: true,
    },
    invoice_id: {
        type: String,
        required: [true, 'Invoice ID is required'],
        trim: true,
        maxlength: [100, 'Invoice ID cannot be more than 100 characters'],
        index: true, // For fast lookup of payments by invoice
    },
    date_time: {
        type: Date,
        required: [true, 'Payment date and time is required'],
        index: true, // For date-based queries and reporting
        validate: {
            validator: function (v) {
                return v <= new Date(); // Payment date cannot be in the future
            },
            message: 'Payment date cannot be in the future'
        },
    },
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0.01, 'Payment amount must be greater than 0'],
        validate: {
            validator: function (v) {
                // Ensure amount has at most 2 decimal places
                return /^\d+(\.\d{1,2})?$/.test(v.toString());
            },
            message: 'Payment amount can have at most 2 decimal places'
        },
    },
}, {
    timestamps: true,
});
// Create compound indexes for better query performance
paymentSchema.index({ invoice_id: 1, date_time: -1 }); // Common query: payments by invoice, sorted by date
paymentSchema.index({ p_type: 1, date_time: -1 }); // Reports by payment type and date
paymentSchema.index({ date_time: -1, amount: -1 }); // Financial reports by date and amount
// Virtual for formatted amount (for display purposes)
paymentSchema.virtual('formattedAmount').get(function () {
    return this.amount.toFixed(2);
});
// Virtual for payment summary
paymentSchema.virtual('paymentSummary').get(function () {
    return `${this.p_type.toUpperCase()} - ₹${this.amount.toFixed(2)} on ${this.date_time.toLocaleDateString()}`;
});
// Pre-save middleware to ensure amount precision
paymentSchema.pre('save', function (next) {
    if (this.amount) {
        // Round to 2 decimal places to avoid floating point precision issues
        this.amount = Math.round(this.amount * 100) / 100;
    }
    next();
});
// Static method to get total payments for an invoice
paymentSchema.statics.getTotalPaymentsForInvoice = function (invoiceId) {
    return this.aggregate([
        { $match: { invoice_id: invoiceId } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
};
// Static method to get payment statistics by type
paymentSchema.statics.getPaymentStatsByType = function (startDate, endDate) {
    const matchStage = {};
    if (startDate || endDate) {
        matchStage.date_time = {};
        if (startDate)
            matchStage.date_time.$gte = startDate;
        if (endDate)
            matchStage.date_time.$lte = endDate;
    }
    return this.aggregate([
        ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
        {
            $group: {
                _id: '$p_type',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 },
                averageAmount: { $avg: '$amount' }
            }
        },
        { $sort: { totalAmount: -1 } }
    ]);
};
// Ensure virtuals are included in JSON output
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });
exports.default = mongoose_1.default.model('Payment', paymentSchema);
