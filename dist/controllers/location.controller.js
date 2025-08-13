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
exports.getLocationStats = exports.getCitiesByCountry = exports.getCitiesByState = exports.getStatesByCountry = exports.getCountryByIsoCode = exports.getCountries = void 0;
const country_model_1 = __importDefault(require("../models/country.model"));
const state_model_1 = __importDefault(require("../models/state.model"));
const city_model_1 = __importDefault(require("../models/city.model"));
// Get all countries
const getCountries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 250 } = req.query;
        // Convert to numbers
        const pageNum = parseInt(page, 10);
        const limitNum = Math.min(parseInt(limit, 10), 250); // Max 250 countries per page
        // Calculate skip value for pagination
        const skip = (pageNum - 1) * limitNum;
        // Build search query
        let searchQuery = { isDeleted: false };
        if (search && typeof search === 'string' && search.trim() !== '') {
            searchQuery = {
                isDeleted: false,
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { isoCode: { $regex: search, $options: 'i' } }
                ]
            };
        }
        // Get total count for pagination metadata
        const totalCount = yield country_model_1.default.countDocuments(searchQuery);
        // Get countries with search and pagination
        const countries = yield country_model_1.default.find(searchQuery)
            .select('name isoCode flag phonecode currency')
            .skip(skip)
            .limit(limitNum)
            .sort({ name: 1 });
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        res.status(200).json({
            statusCode: 200,
            message: 'Countries retrieved successfully',
            data: {
                countries,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    limit: limitNum,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? pageNum + 1 : null,
                    prevPage: hasPrevPage ? pageNum - 1 : null
                }
            }
        });
    }
    catch (error) {
        console.error('Get countries error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error fetching countries',
            error: 'Error fetching countries'
        });
    }
});
exports.getCountries = getCountries;
// Get country by ISO code
const getCountryByIsoCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { isoCode } = req.params;
        if (!isoCode) {
            res.status(400).json({
                statusCode: 400,
                message: 'ISO code is required',
                error: 'ISO code is required'
            });
            return;
        }
        // Find country by ISO code (case insensitive, only non-deleted)
        const country = yield country_model_1.default.findOne({
            isoCode: isoCode.toUpperCase(),
            isDeleted: false
        }).select('name isoCode flag phonecode currency latitude longitude');
        if (!country) {
            res.status(404).json({
                statusCode: 404,
                message: `Country with ISO code '${isoCode}' not found`,
                error: 'Country not found'
            });
            return;
        }
        res.status(200).json({
            statusCode: 200,
            message: 'Country retrieved successfully',
            data: {
                country
            }
        });
    }
    catch (error) {
        console.error('Get country by ISO code error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error fetching country',
            error: 'Error fetching country'
        });
    }
});
exports.getCountryByIsoCode = getCountryByIsoCode;
// Get states by country code
const getStatesByCountry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { countryCode } = req.params;
        const { search = '', page = 1, limit = 100 } = req.query;
        if (!countryCode) {
            res.status(400).json({
                statusCode: 400,
                message: 'Country code is required',
                error: 'Country code is required'
            });
            return;
        }
        // Convert to numbers
        const pageNum = parseInt(page, 10);
        const limitNum = Math.min(parseInt(limit, 10), 100); // Max 100 states per page
        // Calculate skip value for pagination
        const skip = (pageNum - 1) * limitNum;
        // Build search query
        let searchQuery = { countryCode: countryCode.toUpperCase(), isDeleted: false };
        if (search && typeof search === 'string' && search.trim() !== '') {
            searchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { isoCode: { $regex: search, $options: 'i' } }
            ];
        }
        // Get total count for pagination metadata
        const totalCount = yield state_model_1.default.countDocuments(searchQuery);
        // Get states with search and pagination
        const states = yield state_model_1.default.find(searchQuery)
            .select('name isoCode countryCode')
            .skip(skip)
            .limit(limitNum)
            .sort({ name: 1 });
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        res.status(200).json({
            statusCode: 200,
            message: `States for ${countryCode} retrieved successfully`,
            data: {
                states,
                countryCode,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    limit: limitNum,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? pageNum + 1 : null,
                    prevPage: hasPrevPage ? pageNum - 1 : null
                }
            }
        });
    }
    catch (error) {
        console.error('Get states error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error fetching states',
            error: 'Error fetching states'
        });
    }
});
exports.getStatesByCountry = getStatesByCountry;
// Get cities by country and state code
const getCitiesByState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { countryCode, stateCode } = req.params;
        const { search = '', page = 1, limit = 100 } = req.query;
        if (!countryCode || !stateCode) {
            res.status(400).json({
                statusCode: 400,
                message: 'Country code and state code are required',
                error: 'Country code and state code are required'
            });
            return;
        }
        // Convert to numbers
        const pageNum = parseInt(page, 10);
        const limitNum = Math.min(parseInt(limit, 10), 100); // Max 100 cities per page
        // Calculate skip value for pagination
        const skip = (pageNum - 1) * limitNum;
        // Build search query
        let searchQuery = {
            countryCode: countryCode.toUpperCase(),
            stateCode: stateCode.toUpperCase(),
            isDeleted: false
        };
        if (search && typeof search === 'string' && search.trim() !== '') {
            searchQuery.name = { $regex: search, $options: 'i' };
        }
        // Get total count for pagination metadata
        const totalCount = yield city_model_1.default.countDocuments(searchQuery);
        // Get cities with search and pagination
        const cities = yield city_model_1.default.find(searchQuery)
            .select('name countryCode stateCode')
            .skip(skip)
            .limit(limitNum)
            .sort({ name: 1 });
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        res.status(200).json({
            statusCode: 200,
            message: `Cities for ${stateCode}, ${countryCode} retrieved successfully`,
            data: {
                cities,
                countryCode,
                stateCode,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    limit: limitNum,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? pageNum + 1 : null,
                    prevPage: hasPrevPage ? pageNum - 1 : null
                }
            }
        });
    }
    catch (error) {
        console.error('Get cities error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error fetching cities',
            error: 'Error fetching cities'
        });
    }
});
exports.getCitiesByState = getCitiesByState;
// Get all cities by country (without state filtering)
const getCitiesByCountry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { countryCode } = req.params;
        const { search = '', page = 1, limit = 100 } = req.query;
        if (!countryCode) {
            res.status(400).json({
                statusCode: 400,
                message: 'Country code is required',
                error: 'Country code is required'
            });
            return;
        }
        // Convert to numbers
        const pageNum = parseInt(page, 10);
        const limitNum = Math.min(parseInt(limit, 10), 100); // Max 100 cities per page
        // Calculate skip value for pagination
        const skip = (pageNum - 1) * limitNum;
        // Build search query
        let searchQuery = { countryCode: countryCode.toUpperCase(), isDeleted: false };
        if (search && typeof search === 'string' && search.trim() !== '') {
            searchQuery.name = { $regex: search, $options: 'i' };
        }
        // Get total count for pagination metadata
        const totalCount = yield city_model_1.default.countDocuments(searchQuery);
        // Get cities with search and pagination
        const cities = yield city_model_1.default.find(searchQuery)
            .select('name countryCode stateCode')
            .skip(skip)
            .limit(limitNum)
            .sort({ name: 1 });
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        res.status(200).json({
            statusCode: 200,
            message: `Cities for ${countryCode} retrieved successfully`,
            data: {
                cities,
                countryCode,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    limit: limitNum,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? pageNum + 1 : null,
                    prevPage: hasPrevPage ? pageNum - 1 : null
                }
            }
        });
    }
    catch (error) {
        console.error('Get cities by country error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error fetching cities',
            error: 'Error fetching cities'
        });
    }
});
exports.getCitiesByCountry = getCitiesByCountry;
// Get location statistics
const getLocationStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [countryCount, stateCount, cityCount] = yield Promise.all([
            country_model_1.default.countDocuments({ isDeleted: false }),
            state_model_1.default.countDocuments({ isDeleted: false }),
            city_model_1.default.countDocuments({ isDeleted: false })
        ]);
        res.status(200).json({
            statusCode: 200,
            message: 'Location statistics retrieved successfully',
            data: {
                countries: countryCount,
                states: stateCount,
                cities: cityCount,
                lastUpdated: new Date()
            }
        });
    }
    catch (error) {
        console.error('Get location stats error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error fetching location statistics',
            error: 'Error fetching location statistics'
        });
    }
});
exports.getLocationStats = getLocationStats;
