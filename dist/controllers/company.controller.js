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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompany = exports.getById = exports.getAll = exports.createOrUpdate = void 0;
const company_model_1 = require("../models/company.model");
const fileUtils_1 = require("../utils/fileUtils");
// Create or Update company (unified function)
const createOrUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if any company exists
        const existingCompany = yield company_model_1.Company.findOne();
        if (existingCompany) {
            // Update existing company
            // If a new logo is uploaded, delete the old one
            if (req.body.company_logo && existingCompany.company_logo && req.body.company_logo !== existingCompany.company_logo) {
                (0, fileUtils_1.deleteUploadedFile)(existingCompany.company_logo);
            }
            const company = yield company_model_1.Company.findByIdAndUpdate(existingCompany._id, req.body, { new: true, runValidators: true });
            res.status(200).json({
                statusCode: 200,
                message: 'Company updated successfully',
                data: { company }
            });
        }
        else {
            // Create new company
            const company = new company_model_1.Company(req.body);
            yield company.save();
            res.status(201).json({
                statusCode: 201,
                message: 'Company created successfully',
                data: { company }
            });
        }
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
                message: 'Company with this name or email already exists',
                error: 'Duplicate entry'
            });
        }
        else {
            console.error('Create/Update company error:', error);
            res.status(500).json({
                statusCode: 500,
                message: 'Error processing company',
                error: 'Server error'
            });
        }
    }
});
exports.createOrUpdate = createOrUpdate;
// Get company
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield company_model_1.Company.findOne();
        if (!company) {
            res.status(404).json({
                statusCode: 404,
                message: 'No company found',
                error: 'Company not found'
            });
            return;
        }
        res.status(200).json({
            statusCode: 200,
            message: 'Company retrieved successfully',
            data: { company }
        });
    }
    catch (error) {
        console.error('Get company error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error fetching company',
            error: 'Server error'
        });
    }
});
exports.getAll = getAll;
// Get company by ID
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield company_model_1.Company.findById(req.params.id);
        if (!company) {
            res.status(404).json({
                statusCode: 404,
                message: 'Company not found',
                error: 'Company not found'
            });
            return;
        }
        res.status(200).json({
            statusCode: 200,
            message: 'Company retrieved successfully',
            data: { company }
        });
    }
    catch (error) {
        console.error('Get company by ID error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error fetching company',
            error: 'Server error'
        });
    }
});
exports.getById = getById;
// Delete company
const deleteCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield company_model_1.Company.findById(req.params.id);
        if (!company) {
            res.status(404).json({
                statusCode: 404,
                message: 'Company not found',
                error: 'Company not found'
            });
            return;
        }
        // Delete company logo if exists
        if (company.company_logo) {
            (0, fileUtils_1.deleteUploadedFile)(company.company_logo);
        }
        yield company_model_1.Company.findByIdAndDelete(req.params.id);
        res.status(200).json({
            statusCode: 200,
            message: 'Company deleted successfully',
            data: null
        });
    }
    catch (error) {
        console.error('Delete company error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error deleting company',
            error: 'Server error'
        });
    }
});
exports.deleteCompany = deleteCompany;
