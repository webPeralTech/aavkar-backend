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
exports.seedLocationData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const country_state_city_1 = require("country-state-city");
const country_model_1 = __importDefault(require("../models/country.model"));
const state_model_1 = __importDefault(require("../models/state.model"));
const city_model_1 = __importDefault(require("../models/city.model"));
const database_1 = __importDefault(require("../config/database"));
const user_model_1 = __importDefault(require("../models/user.model"));
const createDefaultAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to database
        yield (0, database_1.default)();
        // Check if admin user already exists
        const existingAdmin = yield user_model_1.default.findOne({ email: 'admin@crm.com' });
        if (existingAdmin) {
            console.log('✅ Master Admin already exists');
            // Delete existing admin user
            // await User.deleteOne({ email: 'admin@crm.com' });
            // console.log('🗑️ Deleted existing admin user');
            return;
        }
        // Create the admin user (password will be encrypted by the pre-save hook)
        const adminUser = new user_model_1.default({
            name: 'Master Admin',
            email: 'admin@crm.com',
            password: 'Admin@123', // Remove manual encryption - let the model handle it
            role: 'admin',
            isActive: true,
        });
        yield adminUser.save();
        console.log('✅ Master Admin user created successfully');
        console.log('📧 Email: admin@crm.com');
        console.log('🔐 Password: Admin@123');
    }
    catch (error) {
        console.error('❌ Error creating admin user:', error);
    }
    finally {
        // Close database connection
        yield mongoose_1.default.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
});
const seedLocationData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🌍 Starting location data seeding...');
        // Connect to database
        yield (0, database_1.default)();
        // Check if data already exists
        const countryCount = yield country_model_1.default.countDocuments();
        if (countryCount > 0) {
            console.log('✅ Location data already exists. Skipping seeding.');
            return;
        }
        console.log('📊 Seeding countries...');
        // Seed Countries
        const countries = country_state_city_1.Country.getAllCountries();
        const countryData = countries.map(country => ({
            name: country.name,
            isoCode: country.isoCode,
            flag: country.flag || '',
            phonecode: country.phonecode || '',
            currency: country.currency || '',
            latitude: country.latitude || '',
            longitude: country.longitude || '',
        }));
        yield country_model_1.default.insertMany(countryData);
        console.log(`✅ Seeded ${countryData.length} countries`);
        console.log('📊 Seeding states...');
        // Seed States
        const allStates = [];
        countries.forEach(country => {
            const states = country_state_city_1.State.getStatesOfCountry(country.isoCode);
            states.forEach(state => {
                allStates.push({
                    name: state.name,
                    isoCode: state.isoCode,
                    countryCode: state.countryCode,
                    latitude: state.latitude || '',
                    longitude: state.longitude || '',
                });
            });
        });
        if (allStates.length > 0) {
            // Insert states in batches to avoid memory issues
            const batchSize = 1000;
            for (let i = 0; i < allStates.length; i += batchSize) {
                const batch = allStates.slice(i, i + batchSize);
                yield state_model_1.default.insertMany(batch);
                console.log(`✅ Seeded states batch ${Math.ceil((i + 1) / batchSize)}`);
            }
            console.log(`✅ Seeded total ${allStates.length} states`);
        }
        console.log('📊 Seeding cities for major countries...');
        // Seed Cities for major countries only to avoid overwhelming the database
        const majorCountries = ['US', 'CA', 'GB', 'AU', 'IN', 'DE', 'FR', 'IT', 'ES', 'JP'];
        const allCities = [];
        let cityCount = 0;
        for (const countryCode of majorCountries) {
            const states = country_state_city_1.State.getStatesOfCountry(countryCode);
            for (const state of states) {
                const cities = country_state_city_1.City.getCitiesOfState(countryCode, state.isoCode);
                cities.forEach(city => {
                    allCities.push({
                        name: city.name,
                        countryCode: city.countryCode,
                        stateCode: city.stateCode,
                        latitude: city.latitude || '',
                        longitude: city.longitude || '',
                    });
                });
                // Insert in smaller batches for cities to manage memory
                if (allCities.length >= 500) {
                    yield city_model_1.default.insertMany(allCities);
                    cityCount += allCities.length;
                    console.log(`✅ Seeded ${cityCount} cities so far...`);
                    allCities.length = 0; // Clear the array
                }
            }
        }
        // Insert remaining cities
        if (allCities.length > 0) {
            yield city_model_1.default.insertMany(allCities);
            cityCount += allCities.length;
        }
        console.log(`✅ Seeded total ${cityCount} cities`);
        console.log('🎉 Location data seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Error seeding location data:', error);
    }
    finally {
        // Close database connection
        yield mongoose_1.default.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
});
exports.seedLocationData = seedLocationData;
// Run the seeders if this file is executed directly
if (require.main === module) {
    const runSeeders = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log('🚀 Starting seeding process...');
            // First, create the default admin
            yield createDefaultAdmin();
            // Then, seed location data
            yield seedLocationData();
            console.log('🎉 All seeding completed successfully!');
        }
        catch (error) {
            console.error('❌ Error during seeding process:', error);
            process.exit(1);
        }
    });
    runSeeders();
}
exports.default = createDefaultAdmin;
