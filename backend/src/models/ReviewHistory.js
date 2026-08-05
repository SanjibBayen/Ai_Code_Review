import mongoose from 'mongoose';

const reviewHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        review: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CodeReview',
            required: true,
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            default: null,
        },

        language: {
            type: String,
            required: true,
        },

        score: {
            type: Number,
            min: 0,
            max: 100,
        },

        status: {
            type: String,
            enum: ['completed', 'failed', 'processing'],
            default: 'completed',
        },
    },
    {
        timestamps: true,
    }
);

const ReviewHistory = mongoose.model(
    'ReviewHistory',
    reviewHistorySchema
);

export default ReviewHistory;