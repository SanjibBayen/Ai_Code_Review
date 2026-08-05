import express from 'express';

import {
    registerUser,
    loginUser,
    getMe,
    verifyEmailOtp,
    resendVerificationOtp,
    requestLoginOtp,
    verifyLoginOtp,
} from '../controllers/auth.controller.js';

import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyEmailOtp);
router.post('/resend-otp', resendVerificationOtp);

router.post('/login', loginUser);
router.post('/login-otp', requestLoginOtp);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/logout', (_req, res) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', protect, getMe);

export default router;
