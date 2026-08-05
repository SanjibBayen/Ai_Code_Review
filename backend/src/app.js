import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import reviewRoutes from './routes/review.routes.js';
import historyRoutes from './routes/history.routes.js';
import githubRoutes from './routes/github.routes.js';

import {
    notFound,
    errorHandler,
} from './middleware/error.middleware.js';

import {
    apiLimiter,
} from './middleware/rateLimit.middleware.js';

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
    cors({
        origin:
            process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// Body parser
app.use(
    express.json({
        limit: '1mb',
    })
);

// Rate limiting
app.use('/api', apiLimiter);

// Test route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'AI Code Review API is running',
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/github', githubRoutes);

// 404
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;