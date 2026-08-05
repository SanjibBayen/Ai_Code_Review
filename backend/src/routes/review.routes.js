import express from 'express';

import {
    createReview,
    getReviews,
    getReview,
    deleteReview,
} from '../controllers/review.controller.js';

import { protect } from '../middleware/auth.middleware.js';
import { reviewLimiter } from '../middleware/rateLimit.middleware.js';
import { validateObjectId } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/', protect, reviewLimiter, createReview);
router.post('/analyze', protect, reviewLimiter, createReview);
router.get('/', protect, getReviews);
router.get('/:id', protect, validateObjectId(), getReview);
router.delete('/:id', protect, validateObjectId(), deleteReview);

export default router;
