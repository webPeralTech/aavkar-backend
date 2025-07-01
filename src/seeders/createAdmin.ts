import mongoose from 'mongoose';
import { Country, State, City } from 'country-state-city';
import CountryModel from '../models/country.model';
import StateModel from '../models/state.model';
import CityModel from '../models/city.model';
import connectDB from '../config/database';
import User from '../models/user.model';

const createDefaultAdmin = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@crm.com' });

    if (existingAdmin) {
      console.log('✅ Master Admin already exists');

      // Delete existing admin user
      // await User.deleteOne({ email: 'admin@crm.com' });
      // console.log('🗑️ Deleted existing admin user');

      return;
    }

    // Create the admin user (password will be encrypted by the pre-save hook)
    const adminUser = new User({
      name: 'Master Admin',
      email: 'admin@crm.com',
      password: 'Admin@123', // Remove manual encryption - let the model handle it
      role: 'admin',
      isActive: true,
    });

    await adminUser.save();
    console.log('✅ Master Admin user created successfully');
    console.log('📧 Email: admin@crm.com');
    console.log('🔐 Password: Admin@123');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

const seedLocationData = async (): Promise<void> => {
  try {
    console.log('🌍 Starting location data seeding...');

    // Connect to database
    await connectDB();

    // Check if data already exists
    const countryCount = await CountryModel.countDocuments();
    if (countryCount > 0) {
      console.log('✅ Location data already exists. Skipping seeding.');
      return;
    }

    console.log('📊 Seeding countries...');

    // Seed Countries
    const countries = Country.getAllCountries();
    const countryData = countries.map(country => ({
      name: country.name,
      isoCode: country.isoCode,
      flag: country.flag || '',
      phonecode: country.phonecode || '',
      currency: country.currency || '',
      latitude: country.latitude || '',
      longitude: country.longitude || '',
    }));

    await CountryModel.insertMany(countryData);
    console.log(`✅ Seeded ${countryData.length} countries`);

    console.log('📊 Seeding states...');

    // Seed States
    const allStates: any[] = [];
    countries.forEach(country => {
      const states = State.getStatesOfCountry(country.isoCode);
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
        await StateModel.insertMany(batch);
        console.log(`✅ Seeded states batch ${Math.ceil((i + 1) / batchSize)}`);
      }
      console.log(`✅ Seeded total ${allStates.length} states`);
    }

    console.log('📊 Seeding cities for major countries...');

    // Seed Cities for major countries only to avoid overwhelming the database
    const majorCountries = ['US', 'CA', 'GB', 'AU', 'IN', 'DE', 'FR', 'IT', 'ES', 'JP'];
    const allCities: any[] = [];
    let cityCount = 0;

    for (const countryCode of majorCountries) {
      const states = State.getStatesOfCountry(countryCode);

      for (const state of states) {
        const cities = City.getCitiesOfState(countryCode, state.isoCode);
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
          await CityModel.insertMany(allCities);
          cityCount += allCities.length;
          console.log(`✅ Seeded ${cityCount} cities so far...`);
          allCities.length = 0; // Clear the array
        }
      }
    }

    // Insert remaining cities
    if (allCities.length > 0) {
      await CityModel.insertMany(allCities);
      cityCount += allCities.length;
    }

    console.log(`✅ Seeded total ${cityCount} cities`);
    console.log('🎉 Location data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding location data:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeders if this file is executed directly
if (require.main === module) {
  const runSeeders = async () => {
    try {
      console.log('🚀 Starting seeding process...');

      // First, create the default admin
      await createDefaultAdmin();

      // Then, seed location data
      await seedLocationData();

      console.log('🎉 All seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error during seeding process:', error);
      process.exit(1);
    }
  };

  runSeeders();
}

export default createDefaultAdmin;
export { seedLocationData }; 