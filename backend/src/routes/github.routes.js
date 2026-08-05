import express from 'express';

import {
    connectGitHub,
    githubOAuthCallback,
    getGitHubUser,
    getGithubRepos,
    getBranches,
    getRepositoryFiles,
    getRepositoryFile,
    disconnectGitHub,
    reviewRepository,
} from '../controllers/github.controller.js';

import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/connect', protect, connectGitHub);
router.get('/callback', githubOAuthCallback);
router.get('/user', protect, getGitHubUser);
router.get('/repositories', protect, getGithubRepos);
router.get('/repos/:owner/:repo/branches', protect, getBranches);
router.get('/repos/:owner/:repo/tree', protect, getRepositoryFiles);
router.get('/repos/:owner/:repo/file', protect, getRepositoryFile);
router.delete('/disconnect', protect, disconnectGitHub);
router.post('/review', protect, reviewRepository);
router.get('/repos', protect, getGithubRepos);

export default router;
