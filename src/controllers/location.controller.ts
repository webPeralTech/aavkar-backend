import { Request, Response } from 'express';
import CountryModel from '../models/country.model';
import StateModel from '../models/state.model';
import CityModel from '../models/city.model';

// Get all countries
export const getCountries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search = '', page = 1, limit = 250 } = req.query;
    
    // Convert to numbers
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 250); // Max 250 countries per page
    
    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Build search query
    let searchQuery: any = { isDeleted: false };
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
    const totalCount = await CountryModel.countDocuments(searchQuery);
    
    // Get countries with search and pagination
    const countries = await CountryModel.find(searchQuery)
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
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Error fetching countries',
      error: 'Error fetching countries' 
    });
  }
};

// Get country by ISO code
export const getCountryByIsoCode = async (req: Request, res: Response): Promise<void> => {
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
    const country = await CountryModel.findOne({ 
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
  } catch (error) {
    console.error('Get country by ISO code error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Error fetching country',
      error: 'Error fetching country' 
    });
  }
};

// Get states by country code
export const getStatesByCountry = async (req: Request, res: Response): Promise<void> => {
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
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100); // Max 100 states per page
    
    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Build search query
    let searchQuery: any = { countryCode: countryCode.toUpperCase(), isDeleted: false };
    if (search && typeof search === 'string' && search.trim() !== '') {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { isoCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination metadata
    const totalCount = await StateModel.countDocuments(searchQuery);
    
    // Get states with search and pagination
    const states = await StateModel.find(searchQuery)
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
  } catch (error) {
    console.error('Get states error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Error fetching states',
      error: 'Error fetching states' 
    });
  }
};

// Get cities by country and state code
export const getCitiesByState = async (req: Request, res: Response): Promise<void> => {
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
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100); // Max 100 cities per page
    
    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Build search query
    let searchQuery: any = { 
      countryCode: countryCode.toUpperCase(),
      stateCode: stateCode.toUpperCase(),
      isDeleted: false
    };
    if (search && typeof search === 'string' && search.trim() !== '') {
      searchQuery.name = { $regex: search, $options: 'i' };
    }
    
    // Get total count for pagination metadata
    const totalCount = await CityModel.countDocuments(searchQuery);
    
    // Get cities with search and pagination
    const cities = await CityModel.find(searchQuery)
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
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Error fetching cities',
      error: 'Error fetching cities' 
    });
  }
};

// Get all cities by country (without state filtering)
export const getCitiesByCountry = async (req: Request, res: Response): Promise<void> => {
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
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100); // Max 100 cities per page
    
    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Build search query
    let searchQuery: any = { countryCode: countryCode.toUpperCase(), isDeleted: false };
    if (search && typeof search === 'string' && search.trim() !== '') {
      searchQuery.name = { $regex: search, $options: 'i' };
    }
    
    // Get total count for pagination metadata
    const totalCount = await CityModel.countDocuments(searchQuery);
    
    // Get cities with search and pagination
    const cities = await CityModel.find(searchQuery)
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
  } catch (error) {
    console.error('Get cities by country error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Error fetching cities',
      error: 'Error fetching cities' 
    });
  }
};

// Get location statistics
export const getLocationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [countryCount, stateCount, cityCount] = await Promise.all([
      CountryModel.countDocuments({ isDeleted: false }),
      StateModel.countDocuments({ isDeleted: false }),
      CityModel.countDocuments({ isDeleted: false })
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
  } catch (error) {
    console.error('Get location stats error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Error fetching location statistics',
      error: 'Error fetching location statistics' 
    });
  }
}; 