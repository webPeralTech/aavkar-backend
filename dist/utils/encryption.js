"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.decryptPassword = exports.encryptPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_SECRET || 'x69fT3w7nKqPdLdA7VeMjX890BHuYg5R';
const key = crypto_1.default.scryptSync(secretKey, 'salt', 32);
const encryptPassword = (password) => {
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Combine IV and encrypted data
    return iv.toString('hex') + ':' + encrypted;
};
exports.encryptPassword = encryptPassword;
const decryptPassword = (encryptedPassword) => {
    const parts = encryptedPassword.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
exports.decryptPassword = decryptPassword;
const comparePassword = (plainPassword, encryptedPassword) => {
    try {
        const decrypted = (0, exports.decryptPassword)(encryptedPassword);
        return plainPassword === decrypted;
    }
    catch (error) {
        return false;
    }
};
exports.comparePassword = comparePassword;
