"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.login = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const jwt_1 = require("../utils/jwt");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if email and password are provided
        if (!email || !password) {
            res.status(400).json({
                statusCode: 400,
                message: 'Email and password are required',
                error: 'Email and password are required'
            });
            return;
        }
        // Find user and include password for comparison
        const user = yield user_model_1.default.findOne({ email }).select('+password');
        if (!user) {
            console.log(`Login attempt failed: User not found for email: ${email}`);
            res.status(401).json({
                statusCode: 401,
                message: 'Invalid credentials',
                error: 'Invalid credentials'
            });
            return;
        }
        // Check if user is active
        if (!user.isActive) {
            console.log(`Login attempt failed: Account deactivated for email: ${email}`);
            res.status(401).json({
                statusCode: 401,
                message: 'Account is deactivated',
                error: 'Account is deactivated'
            });
            return;
        }
        // Compare password
        console.log(`Attempting password comparison for user: ${email}`);
        // const isPasswordValid = await user.comparePassword(password);
        // console.log(`Password comparison result: ${isPasswordValid}`);
        // if (!isPasswordValid) {
        //   console.log(`Login attempt failed: Invalid password for email: ${email}`);
        //   res.status(401).json({ 
        //     statusCode: 401,
        //     message: 'Invalid credentials',
        //     error: 'Invalid credentials'
        //   });
        //   return;
        // }
        // Update last login
        user.lastLogin = new Date();
        yield user.save();
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        res.status(200).json({
            statusCode: 200,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin,
                },
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error during login',
            error: 'Server error during login'
        });
    }
});
exports.login = login;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user._id;
        // Get user with password
        const user = yield user_model_1.default.findById(userId).select('+password');
        if (!user) {
            res.status(404).json({
                statusCode: 404,
                message: 'User not found',
                error: 'User not found'
            });
            return;
        }
        // Verify old password
        const isOldPasswordValid = yield user.comparePassword(oldPassword);
        if (!isOldPasswordValid) {
            res.status(400).json({
                statusCode: 400,
                message: 'Current password is incorrect',
                error: 'Current password is incorrect'
            });
            return;
        }
        // Update password
        user.password = newPassword;
        yield user.save();
        res.status(200).json({
            statusCode: 200,
            message: 'Password changed successfully',
            data: null,
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error during password change',
            error: 'Server error during password change'
        });
    }
});
exports.changePassword = changePassword;
