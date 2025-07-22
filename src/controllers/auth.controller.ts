import { Request, Response } from 'express';
import User from '../models/user.model';
import { generateToken } from '../utils/jwt';
import { comparePassword } from '../utils/encryption';
import { Company } from '../models/company.model';

export const login = async (req: Request, res: Response): Promise<void> => {
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

    // Find user and include password for comparison (only non-deleted users)
    const user = await User.findOne({ email, isDeleted: false }).select('+password');

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
    const isPasswordValid = await comparePassword(password, user.password);
    console.log(`Password comparison result: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log(`Login attempt failed: Invalid password for email: ${email}`);
      res.status(401).json({ 
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Invalid credentials'
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // company table image url send response
    const company = await Company.find({});
    const companyImage = company.map((company) => company.company_logo);

    // Generate token
    const token = generateToken({
      userId: (user._id as any).toString(),
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
          companyImage: companyImage[0],
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error during login',
      error: 'Server error during login'
    });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user with password (only non-deleted users)
    const user = await User.findOne({ _id: userId, isDeleted: false }).select('+password');

    if (!user) {
      res.status(404).json({ 
        statusCode: 404,
        message: 'User not found',
        error: 'User not found'
      });
      return;
    }

    // Verify old password
    const isOldPasswordValid = await user.comparePassword(oldPassword);

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
    await user.save();

    res.status(200).json({
      statusCode: 200,
      message: 'Password changed successfully',
      data: null,
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      statusCode: 500,
      message: 'Server error during password change',
      error: 'Server error during password change'
    });
  }
};
