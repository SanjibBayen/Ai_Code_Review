import ReviewHistory from '../models/ReviewHistory.js';
import { buildHistoryResponse } from '../utils/transformers.js';

const respondWithError = (res, status, message, error = null) => {
    return res.status(status).json({
        success: false,
        message,
        error: error || message,
    });
};

export const getReviewHistory = async (req, res) => {
    try {
        const history = await ReviewHistory.find({ user: req.user._id })
            .populate('review', 'language score summary createdAt bugs securityIssues performanceIssues suggestions improvedCode categories code')
            .populate('project', 'name repository branch language description')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: history.length,
            history: history.map((item) => buildHistoryResponse(item)),
        });
    } catch (error) {
        console.error('Get review history error:', error);
        return respondWithError(res, 500, 'Failed to fetch review history', error.message);
    }
};

export const getHistoryById = async (req, res) => {
    try {
        const history = await ReviewHistory.findOne({ _id: req.params.id, user: req.user._id })
            .populate('review', 'language score summary createdAt bugs securityIssues performanceIssues suggestions improvedCode categories code')
            .populate('project', 'name repository branch language description');

        if (!history) {
            return respondWithError(res, 404, 'Review history not found');
        }

        return res.status(200).json({
            success: true,
            historyItem: buildHistoryResponse(history),
        });
    } catch (error) {
        console.error('Get history error:', error);
        return respondWithError(res, 500, 'Failed to fetch review history', error.message);
    }
};

export const deleteHistory = async (req, res) => {
    try {
        const history = await ReviewHistory.findOneAndDelete({ _id: req.params.id, user: req.user._id });

        if (!history) {
            return respondWithError(res, 404, 'Review history not found');
        }

        return res.status(200).json({
            success: true,
            message: 'Review history deleted successfully',
        });
    } catch (error) {
        console.error('Delete history error:', error);
        return respondWithError(res, 500, 'Failed to delete history', error.message);
    }
};
