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
exports.deleteCustomer = exports.updateCustomer = exports.getCustomer = exports.getCustomers = exports.createCustomer = void 0;
const customer_model_1 = __importDefault(require("../models/customer.model"));
const createCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerData = req.body;
        // Set assignedTo to current user if not provided and user is sales/support
        // if (!customerData.assignedTo && ['sales', 'support'].includes(req.user.role)) {
        //   customerData.assignedTo = req.user._id;
        // }
        const customer = new customer_model_1.default(customerData);
        yield customer.save();
        // Populate the assignedTo field
        // await customer.populate('assignedTo', 'name email');
        res.status(201).json({
            statusCode: 201,
            message: 'Customer created successfully',
            data: { customer },
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
        else if (error.code === 11000) {
            res.status(400).json({
                statusCode: 400,
                message: 'Customer with this email already exists',
                error: 'Customer with this email already exists'
            });
        }
        else {
            console.error('Create customer error:', error);
            res.status(500).json({
                statusCode: 500,
                message: 'Server error during customer creation',
                error: 'Server error during customer creation'
            });
        }
    }
});
exports.createCustomer = createCustomer;
const getCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, 
        // status,
        // source,
        // assignedTo,
        search, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
        // Build filter query
        const filter = {};
        // if (status) filter.status = status;
        // if (source) filter.source = source;
        // if (assignedTo) filter.assignedTo = assignedTo;
        // // If user is not admin/manager, only show their assigned customers
        // if (!['admin', 'manager'].includes(req.user.role)) {
        //   filter.assignedTo = req.user._id;
        // }
        // Add search functionality
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        const sortObject = {};
        sortObject[sortBy] = sortDirection;
        const customers = yield customer_model_1.default.find(filter)
            // .populate('assignedTo', 'name email')
            .sort(sortObject)
            .skip(skip)
            .limit(Number(limit));
        const total = yield customer_model_1.default.countDocuments(filter);
        res.status(200).json({
            statusCode: 200,
            message: 'Customers retrieved successfully',
            data: {
                customers,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    }
    catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Server error'
        });
    }
});
exports.getCustomers = getCustomers;
const getCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const customer = yield customer_model_1.default.findById(id);
        if (!customer) {
            res.status(404).json({
                statusCode: 404,
                message: 'Customer not found',
                error: 'Customer not found'
            });
            return;
        }
        // Check if user has permission to view this customer
        // if (
        //   !['admin', 'manager'].includes(req.user.role) &&
        //   customer.assignedTo?.toString() !== req.user._id.toString()
        // ) {
        //   res.status(403).json({ 
        //     statusCode: 403,
        //     message: 'Access denied',
        //     error: 'Access denied' 
        //   });
        //   return;
        // }
        res.status(200).json({
            statusCode: 200,
            message: 'Customer retrieved successfully',
            data: { customer }
        });
    }
    catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Server error'
        });
    }
});
exports.getCustomer = getCustomer;
const updateCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const customer = yield customer_model_1.default.findById(id);
        if (!customer) {
            res.status(404).json({
                statusCode: 404,
                message: 'Customer not found',
                error: 'Customer not found'
            });
            return;
        }
        // // Check if user has permission to update this customer
        // if (
        //   !['admin', 'manager'].includes(req.user.role) &&
        //   customer.assignedTo?.toString() !== req.user._id.toString()
        // ) {
        //   res.status(403).json({ 
        //     statusCode: 403,
        //     message: 'Access denied',
        //     error: 'Access denied' 
        //   });
        //   return;
        // }
        const updatedCustomer = yield customer_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        // .populate('assignedTo', 'name email');
        res.status(200).json({
            statusCode: 200,
            message: 'Customer updated successfully',
            data: { customer: updatedCustomer },
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
            console.error('Update customer error:', error);
            res.status(500).json({
                statusCode: 500,
                message: 'Server error',
                error: 'Server error'
            });
        }
    }
});
exports.updateCustomer = updateCustomer;
const deleteCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const customer = yield customer_model_1.default.findById(id);
        if (!customer) {
            res.status(404).json({
                statusCode: 404,
                message: 'Customer not found',
                error: 'Customer not found'
            });
            return;
        }
        // // Only admin and manager can delete customers
        // if (!['admin', 'manager'].includes(req.user.role)) {
        //   res.status(403).json({ 
        //     statusCode: 403,
        //     message: 'Access denied',
        //     error: 'Access denied' 
        //   });
        //   return;
        // }
        yield customer_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            statusCode: 200,
            message: 'Customer deleted successfully',
            data: null
        });
    }
    catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Server error'
        });
    }
});
exports.deleteCustomer = deleteCustomer;
