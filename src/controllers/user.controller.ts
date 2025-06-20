import { Request, Response } from 'express';
import User, { IUser } from '../models/user.model';
import { generateToken } from '../utils/jwt';
import { decryptPassword } from '../utils/encryption';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ 
        statusCode: 400,
        message: 'User already exists with this email',
        error: 'User already exists with this email' 
      });
      return;
    }

    // Create new user
    const user: IUser = new User({
      firstName,
      lastName,
      email,
      password,
      role: role || 'Employee',
    });

    await user.save();

    // Generate token
    const token = generateToken({
      userId: (user._id as any).toString(),
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
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      },
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ 
        statusCode: 400,
        message: 'Validation failed',
        error: 'Validation failed', 
        details: errors 
      });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ 
        statusCode: 500,
        message: 'Server error during registration',
        error: 'Server error during registration' 
      });
    }
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    res.status(200).json({
      statusCode: 200,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error',
      error: 'Server error' 
    });
  }
};

// Get all users with search and pagination
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      search = '', 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Convert to numbers
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Build search query
    let searchQuery: any = {};
    if (search && typeof search === 'string' && search.trim() !== '') {
      searchQuery = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    // Get total count for pagination metadata
    const totalCount = await User.countDocuments(searchQuery);
    
    // Get users with search and pagination (including password field)
    const users = await User.find(searchQuery)
      // .select('+password') // Include password field for decryption
      .skip(skip)
      .limit(limitNum)
      .sort(sortObj);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    
    // Transform users to include decrypted password
    const usersWithDecryptedPassword = users.map(user => {
      const userObj = user.toObject() as any;
      try {
        userObj.password = decryptPassword(user.password);
      } catch (error) {
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
          search: search as string,
          sortBy: sortBy as string,
          sortOrder: sortOrder as string
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Error fetching users',
      error: 'Error fetching users' 
    });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        statusCode: 404,
        message: 'User not found',
        error: 'User not found'
      });
      return;
    }

    // Prevent admin from deleting themselves
    if ((user._id as any).toString() === (req.user._id as any).toString()) {
      res.status(400).json({
        statusCode: 400,
        message: 'You cannot delete your own account',
        error: 'You cannot delete your own account'
      });
      return;
    }

    // Delete the user (hard delete)
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      statusCode: 200,
      message: 'User deleted successfully',
      data: {
        deletedUser: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error deleting user',
      error: 'Error deleting user'
    });
  }
};

// Toggle user active status (Admin only)
export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
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
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        statusCode: 404,
        message: 'User not found',
        error: 'User not found'
      });
      return;
    }

    // Prevent admin from deactivating themselves
    if ((user._id as any).toString() === (req.user._id as any).toString() && !isActive) {
      res.status(400).json({
        statusCode: 400,
        message: 'You cannot deactivate your own account',
        error: 'You cannot deactivate your own account'
      });
      return;
    }

    // Update user status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, select: '-password' }
    );

    res.status(200).json({
      statusCode: 200,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: updatedUser!._id,
          firstName: updatedUser!.firstName,
          lastName: updatedUser!.lastName,
          email: updatedUser!.email,
          role: updatedUser!.role,
          isActive: updatedUser!.isActive,
          updatedAt: updatedUser!.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error updating user status',
      error: 'Error updating user status'
    });
  }
};

// Update user (Admin only)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, password, role } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
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
      const existingUser = await User.findOne({ email });
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
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (role !== undefined) updateData.role = role;

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    res.status(200).json({
      statusCode: 200,
      message: 'User updated successfully',
      data: {
        user: {
          id: updatedUser!._id,
          firstName: updatedUser!.firstName,
          lastName: updatedUser!.lastName,
          email: updatedUser!.email,
          role: updatedUser!.role,
          isActive: updatedUser!.isActive,
          lastLogin: updatedUser!.lastLogin,
          createdAt: updatedUser!.createdAt,
          updatedAt: updatedUser!.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error updating user',
      error: 'Error updating user'
    });
  }
}; 