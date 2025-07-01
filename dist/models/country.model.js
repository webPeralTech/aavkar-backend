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
const countrySchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
// Create indexes for better performance
// countrySchema.index({ name: 1 }); // Removed: already has unique: true
// countrySchema.index({ isoCode: 1 }); // Removed: already has unique: true
exports.default = mongoose_1.default.model('Country', countrySchema);
