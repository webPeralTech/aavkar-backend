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
exports.updateUser = exports.toggleUserStatus = exports.deleteUser = exports.getAll = exports.getProfile = exports.register = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const jwt_1 = require("../utils/jwt");
const encryption_1 = require("../utils/encryption");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role } = req.body;
        // Check if user already exists
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                statusCode: 400,
                message: 'User already exists with this email',
                error: 'User already exists with this email'
            });
            return;
        }
        // Create new user
        const user = new user_model_1.default({
            name,
            email,
            password,
            role: role || 'employee',
        });
        yield user.save();
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        res.status(201).json({
            statusCode: 201,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                },
            },
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                statusCode: 400,
                message: 'Validation failed',
                error: 'Validation failed',
                details: errors
            });
        }
        else {
            console.error('Registration error:', error);
            res.status(500).json({
                statusCode: 500,
                message: 'Server error during registration',
                error: 'Server error during registration'
            });
        }
    }
});
exports.register = register;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        res.status(200).json({
            statusCode: 200,
            message: 'Profile retrieved successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            },
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Server error'
        });
    }
});
exports.getProfile = getProfile;
// Get all users with search and pagination
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        // Convert to numbers
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        // Calculate skip value for pagination
        const skip = (pageNum - 1) * limitNum;
        // Build search query
        let searchQuery = {};
        if (search && typeof search === 'string' && search.trim() !== '') {
            searchQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { role: { $regex: search, $options: 'i' } }
                ]
            };
        }
        // Build sort object
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
        // Get total count for pagination metadata
        const totalCount = yield user_model_1.default.countDocuments(searchQuery);
        // Get users with search and pagination (including password field)
        const users = yield user_model_1.default.find(searchQuery)
            .select('+password') // Include password field for decryption
            .skip(skip)
            .limit(limitNum)
            .sort(sortObj);
        // console.log(users,"users>>><<<<");
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        // Transform users to include decrypted password
        const usersWithDecryptedPassword = users.map(user => {
            const userObj = user.toObject();
            // console.log(userObj,"userObj");
            try {
                userObj.password = (0, encryption_1.decryptPassword)(user.password);
            }
            catch (error) {
                userObj.password = 'Unable to decrypt';
            }
            return userObj;
        });
        res.status(200).json({
            statusCode: 200,
            message: 'Users retrieved successfully',
            data: {
                users: usersWithDecryptedPassword,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    limit: limitNum,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? pageNum + 1 : null,
                    prevPage: hasPrevPage ? pageNum - 1 : null
                },
                filters: {
                    search: search,
                    sortBy: sortBy,
                    sortOrder: sortOrder
                }
            }
        });
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error fetching users',
            error: 'Error fetching users'
        });
    }
});
exports.getAll = getAll;
// Delete user (Admin only)
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Check if user exists
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                statusCode: 404,
                message: 'User not found',
                error: 'User not found'
            });
            return;
        }
        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            res.status(400).json({
                statusCode: 400,
                message: 'You cannot delete your own account',
                error: 'You cannot delete your own account'
            });
            return;
        }
        // Delete the user (hard delete)
        yield user_model_1.default.findByIdAndDelete(userId);
        res.status(200).json({
            statusCode: 200,
            message: 'User deleted successfully',
            data: {
                deletedUser: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error deleting user',
            error: 'Error deleting user'
        });
    }
});
exports.deleteUser = deleteUser;
// Toggle user active status (Admin only)
const toggleUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;
        // Validate isActive field
        if (typeof isActive !== 'boolean') {
            res.status(400).json({
                statusCode: 400,
                message: 'isActive field must be a boolean value',
                error: 'Invalid isActive value'
            });
            return;
        }
        // Check if user exists
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                statusCode: 404,
                message: 'User not found',
                error: 'User not found'
            });
            return;
        }
        // Prevent admin from deactivating themselves
        if (user._id.toString() === req.user._id.toString() && !isActive) {
            res.status(400).json({
                statusCode: 400,
                message: 'You cannot deactivate your own account',
                error: 'You cannot deactivate your own account'
            });
            return;
        }
        // Update user status
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { isActive }, { new: true, select: '-password' });
        res.status(200).json({
            statusCode: 200,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    isActive: updatedUser.isActive,
                    updatedAt: updatedUser.updatedAt
                }
            }
        });
    }
    catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error updating user status',
            error: 'Error updating user status'
        });
    }
});
exports.toggleUserStatus = toggleUserStatus;
// Update user (Admin only)
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { name, email, password, role } = req.body;
        // Check if user exists
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                statusCode: 404,
                message: 'User not found',
                error: 'User not found'
            });
            return;
        }
        // If email is being updated, check if it already exists
        if (email && email !== user.email) {
            const existingUser = yield user_model_1.default.findOne({ email });
            if (existingUser) {
                res.status(400).json({
                    statusCode: 400,
                    message: 'Email already exists',
                    error: 'User with this email already exists'
                });
                return;
            }
        }
        // Update only provided fields
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (email !== undefined)
            updateData.email = email;
        if (password !== undefined)
            updateData.password = password;
        if (role !== undefined)
            updateData.role = role;
        // Update the user
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, updateData, { new: true, select: '+password' });
        res.status(200).json({
            statusCode: 200,
            message: 'User updated successfully',
            data: {
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    password: (0, encryption_1.decryptPassword)(updatedUser.password),
                    isActive: updatedUser.isActive,
                    lastLogin: updatedUser.lastLogin,
                    createdAt: updatedUser.createdAt,
                    updatedAt: updatedUser.updatedAt
                }
            }
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error updating user',
            error: 'Error updating user'
        });
    }
});
exports.updateUser = updateUser;
