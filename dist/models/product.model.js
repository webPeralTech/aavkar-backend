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
const productSchema = new mongoose_1.Schema({
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
            validator: function (v) {
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
            validator: function (v) {
                if (!v)
                    return true; // Optional field
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
            validator: function (v) {
                return v === undefined || v === null || v >= 0;
            },
            message: 'Base cost must be a positive number'
        },
    },
}, {
    timestamps: true,
    // Ensure proper indexing for common queries
});
// Create compound indexes for better query performance
productSchema.index({ ps_type: 1, ps_name: 1 });
productSchema.index({ ps_type: 1, ps_tax: 1 });
// Pre-save middleware to ensure ps_code uniqueness only when provided
productSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.ps_code === '') {
            this.ps_code = undefined;
        }
        next();
    });
});
// Virtual for full product identification
productSchema.virtual('fullIdentifier').get(function () {
    return this.ps_code ? `${this.ps_name} (${this.ps_code})` : this.ps_name;
});
// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });
exports.default = mongoose_1.default.model('Product', productSchema);
