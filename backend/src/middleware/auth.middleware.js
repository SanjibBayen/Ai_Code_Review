import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        let token;

        // Check Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login first.',
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Find user
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.',
            });
        }

        // Attach user to request
        req.user = user;

        next();
    } catch (error) {
        console.error('Authentication error:', error.message);

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }
};