import express from 'express';

import {
    createProject,
    getUserProjects,
    getOneProject,
    updateProject,
    deleteProject,
} from '../controllers/project.controller.js';

import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validation.middleware.js';

const router = express.Router();

// Create project
router.post('/', protect, createProject);

// Get all projects
router.get('/', protect, getUserProjects);

// Get single project
router.get('/:id', protect, validateObjectId(), getOneProject);

// Update project
router.put('/:id', protect, validateObjectId(), updateProject);

// Delete project
router.delete('/:id', protect, validateObjectId(), deleteProject);

export default router;
