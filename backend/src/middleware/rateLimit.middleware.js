import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
    },
});


export const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,

    max: 20,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message:
            'Review limit reached. Please try again later.',
    },
});