"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const location_controller_1 = require("../controllers/location.controller");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/locations/countries:
 *   get:
 *     tags: [Locations]
 *     summary: Get all countries
 *     description: Retrieve a list of all countries with pagination and search
 *     parameters:
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search term to filter countries by name or ISO code
 *         example: "united"
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 250
 *           default: 250
 *         description: Number of countries per page (max 250)
 *         example: 50
 *     responses:
 *       200:
 *         description: Countries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Countries retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     countries:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: "United States"
 *                           isoCode:
 *                             type: string
 *                             example: "US"
 *                           flag:
 *                             type: string
 *                             example: "🇺🇸"
 *                           phonecode:
 *                             type: string
 *                             example: "1"
 *                           currency:
 *                             type: string
 *                             example: "USD"
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/countries', location_controller_1.getCountries);
/**
 * @swagger
 * /api/locations/country/{isoCode}:
 *   get:
 *     tags: [Locations]
 *     summary: Get country by ISO code
 *     description: Retrieve a specific country by its ISO code
 *     parameters:
 *       - name: isoCode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ISO code of the country (e.g., US, CA, GB)
 *         example: "US"
 *     responses:
 *       200:
 *         description: Country retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Country retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     country:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                           example: "United States"
 *                         isoCode:
 *                           type: string
 *                           example: "US"
 *                         flag:
 *                           type: string
 *                           example: "🇺🇸"
 *                         phonecode:
 *                           type: string
 *                           example: "1"
 *                         currency:
 *                           type: string
 *                           example: "USD"
 *                         latitude:
 *                           type: string
 *                           example: "37.09024"
 *                         longitude:
 *                           type: string
 *                           example: "-95.712891"
 *       400:
 *         description: Bad request - ISO code required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Country not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Country with ISO code 'XX' not found
 *                 error:
 *                   type: string
 *                   example: Country not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/country/:isoCode', location_controller_1.getCountryByIsoCode);
/**
 * @swagger
 * /api/locations/states/{countryCode}:
 *   get:
 *     tags: [Locations]
 *     summary: Get states by country
 *     description: Retrieve all states/provinces for a specific country
 *     parameters:
 *       - name: countryCode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ISO code of the country
 *         example: "US"
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search term to filter states by name or ISO code
 *         example: "california"
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 100
 *         description: Number of states per page (max 100)
 *         example: 50
 *     responses:
 *       200:
 *         description: States retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: States for US retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     states:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: "California"
 *                           isoCode:
 *                             type: string
 *                             example: "CA"
 *                           countryCode:
 *                             type: string
 *                             example: "US"
 *                     countryCode:
 *                       type: string
 *                       example: "US"
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Bad request - country code required
 *       500:
 *         description: Server error
 */
router.get('/states/:countryCode', location_controller_1.getStatesByCountry);
/**
 * @swagger
 * /api/locations/cities/{countryCode}/{stateCode}:
 *   get:
 *     tags: [Locations]
 *     summary: Get cities by country and state
 *     description: Retrieve all cities for a specific state in a country
 *     parameters:
 *       - name: countryCode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ISO code of the country
 *         example: "US"
 *       - name: stateCode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ISO code of the state
 *         example: "CA"
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search term to filter cities by name
 *         example: "los"
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 100
 *         description: Number of cities per page (max 100)
 *         example: 50
 *     responses:
 *       200:
 *         description: Cities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Cities for CA, US retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     cities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: "Los Angeles"
 *                           countryCode:
 *                             type: string
 *                             example: "US"
 *                           stateCode:
 *                             type: string
 *                             example: "CA"
 *                     countryCode:
 *                       type: string
 *                       example: "US"
 *                     stateCode:
 *                       type: string
 *                       example: "CA"
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Bad request - country and state codes required
 *       500:
 *         description: Server error
 */
router.get('/cities/:countryCode/:stateCode', location_controller_1.getCitiesByState);
/**
 * @swagger
 * /api/locations/cities/{countryCode}:
 *   get:
 *     tags: [Locations]
 *     summary: Get all cities by country
 *     description: Retrieve all cities for a specific country (without state filtering)
 *     parameters:
 *       - name: countryCode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ISO code of the country
 *         example: "US"
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search term to filter cities by name
 *         example: "new"
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 100
 *         description: Number of cities per page (max 100)
 *         example: 50
 *     responses:
 *       200:
 *         description: Cities retrieved successfully
 *       400:
 *         description: Bad request - country code required
 *       500:
 *         description: Server error
 */
router.get('/cities/:countryCode', location_controller_1.getCitiesByCountry);
/**
 * @swagger
 * /api/locations/stats:
 *   get:
 *     tags: [Locations]
 *     summary: Get location statistics
 *     description: Retrieve counts of countries, states, and cities in the database
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Location statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     countries:
 *                       type: integer
 *                       example: 250
 *                     states:
 *                       type: integer
 *                       example: 4500
 *                     cities:
 *                       type: integer
 *                       example: 50000
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
router.get('/stats', location_controller_1.getLocationStats);
exports.default = router;
