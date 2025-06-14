import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import customerRoutes from './customers.routes';
import companyRoutes from './company.routes';
import locationRoutes from './location.routes';
import productRoutes from './products.routes';

const router = express.Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/companies', companyRoutes);
router.use('/locations', locationRoutes);
router.use('/products', productRoutes);

export default router; 