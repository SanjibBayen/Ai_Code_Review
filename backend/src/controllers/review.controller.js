import CodeReview from '../models/CodeReview.js';
import Project from '../models/Project.js';
import ReviewHistory from '../models/ReviewHistory.js';
import { reviewCode } from '../services/aiReview.service.js';
import { normalizeLanguage, validateCode } from '../services/codeAnalysis.service.js';
import { buildReviewResponse } from '../utils/transformers.js';

const respondWithError = (res, status, message, error = null) => {
    return res.status(status).json({
        success: false,
        message,
        error: error || message,
    });
};

const createHistoryEntry = async (req, reviewDoc, projectDoc) => {
    try {
        await ReviewHistory.create({
            user: req.user._id,
            review: reviewDoc._id,
            project: projectDoc?._id || null,
            language: reviewDoc.language,
            score: reviewDoc.score,
            status: 'completed',
        });
    } catch (error) {
        console.warn('History entry skipped:', error.message);
    }
};

export const createReview = async (req, res) => {
    try {
        const { code, language, projectId } = req.body;

        const validation = validateCode(code, language);
        if (!validation.valid) {
            return respondWithError(res, 400, validation.message);
        }

        let project = null;
        if (projectId) {
            project = await Project.findOne({ _id: projectId, user: req.user._id });
            if (!project) {
                return respondWithError(res, 404, 'Project not found');
            }
        }

        const normalizedLanguage = normalizeLanguage(language);
        const aiResult = await reviewCode(code, normalizedLanguage);

        const review = await CodeReview.create({
            user: req.user._id,
            project: projectId || null,
            language: normalizedLanguage,
            code,
            score: aiResult.score || 0,
            categories: {
                security: aiResult.categories?.security || 0,
                performance: aiResult.categories?.performance || 0,
                quality: aiResult.categories?.quality || 0,
                maintainability: aiResult.categories?.maintainability || 0,
                readability: aiResult.categories?.readability || 85,
                bestPractices: aiResult.categories?.bestPractices || 80,
            },
            summary: aiResult.summary || '',
            bugs: aiResult.bugs || [],
            securityIssues: aiResult.securityIssues || [],
            performanceIssues: aiResult.performanceIssues || [],
            suggestions: aiResult.suggestions || [],
            improvedCode: aiResult.improvedCode || '',
        });

        await createHistoryEntry(req, review, project);

        const reviewPayload = buildReviewResponse(review.toObject(), project);

        res.status(201).json({
            success: true,
            message: 'Code reviewed successfully',
            review: reviewPayload,
        });
    } catch (error) {
        console.error('Create review error:', error);
        return respondWithError(res, 500, 'Failed to review code', error.message);
    }
};

export const getReviews = async (req, res) => {
    try {
        const reviews = await CodeReview.find({ user: req.user._id })
            .populate('project', 'name repository branch language description')
            .sort({ createdAt: -1 });

        const payload = reviews.map((review) => buildReviewResponse(review.toObject(), review.project));

        res.status(200).json({
            success: true,
            count: payload.length,
            reviews: payload,
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        return respondWithError(res, 500, 'Server error', error.message);
    }
};

export const getReview = async (req, res) => {
    try {
        const review = await CodeReview.findOne({ _id: req.params.id, user: req.user._id }).populate('project', 'name repository branch language description');

        if (!review) {
            return respondWithError(res, 404, 'Review not found');
        }

        res.status(200).json({
            success: true,
            review: buildReviewResponse(review.toObject(), review.project),
        });
    } catch (error) {
        console.error('Get review error:', error);
        return respondWithError(res, 500, 'Server error', error.message);
    }
};

export const deleteReview = async (req, res) => {
    try {
        const review = await CodeReview.findOneAndDelete({ _id: req.params.id, user: req.user._id });

        if (!review) {
            return respondWithError(res, 404, 'Review not found');
        }

        await ReviewHistory.deleteMany({ review: review._id });

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
        });
    } catch (error) {
        console.error('Delete review error:', error);
        return respondWithError(res, 500, 'Server error', error.message);
    }
};
