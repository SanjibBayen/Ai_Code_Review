import mongoose from 'mongoose';

const codeReviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
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

        code: {
            type: String,
            required: true,
        },

        score: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        categories: {
            security: {
                type: Number,
                default: 0,
            },

            performance: {
                type: Number,
                default: 0,
            },

            quality: {
                type: Number,
                default: 0,
            },

            maintainability: {
                type: Number,
                default: 0,
            },

            readability: {
                type: Number,
                default: 0,
            },

            bestPractices: {
                type: Number,
                default: 0,
            },
        },

        summary: {
            type: String,
            default: '',
        },

        bugs: [
            {
                title: String,
                file: String,
                line: Number,
                severity: {
                    type: String,
                    enum: ['low', 'medium', 'high', 'critical', 'warning', 'info'],
                },
                message: String,
                suggestion: String,
                originalCode: String,
                suggestedCode: String,
            },
        ],

        securityIssues: [
            {
                title: String,
                file: String,
                line: Number,
                severity: {
                    type: String,
                    enum: ['low', 'medium', 'high', 'critical', 'warning', 'info'],
                },
                message: String,
                suggestion: String,
                originalCode: String,
                suggestedCode: String,
            },
        ],

        performanceIssues: [
            {
                title: String,
                file: String,
                line: Number,
                severity: {
                    type: String,
                    enum: ['low', 'medium', 'high', 'critical', 'warning', 'info'],
                },
                message: String,
                suggestion: String,
                originalCode: String,
                suggestedCode: String,
            },
        ],

        suggestions: [
            {
                type: String,
            },
        ],

        improvedCode: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

const CodeReview = mongoose.model('CodeReview', codeReviewSchema);

export default CodeReview;
