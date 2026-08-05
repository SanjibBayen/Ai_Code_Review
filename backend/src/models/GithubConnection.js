import mongoose from 'mongoose';

const githubConnectionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },

        githubId: {
            type: String,
            required: true,
        },

        username: {
            type: String,
            required: true,
        },

        accessToken: {
            type: String,
            required: true,
        },

        avatarUrl: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

const GithubConnection = mongoose.models.GithubConnection || mongoose.model(
    'GithubConnection',
    githubConnectionSchema
);

export default GithubConnection;
