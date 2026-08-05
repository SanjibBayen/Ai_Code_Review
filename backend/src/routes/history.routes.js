
import express from 'express';

import {
    getReviewHistory,
    getHistoryById,
    deleteHistory,
} from '../controllers/history.controller.js';

import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validation.middleware.js';

const router = express.Router();


// Get all review history
router.get(
    '/',
    protect,
    getReviewHistory
);


// Get single history
router.get(
    '/:id',
    protect,
    validateObjectId(),
    getHistoryById
);


// Delete history
router.delete(
    '/:id',
    protect,
    validateObjectId(),
    deleteHistory
);


export default router;
