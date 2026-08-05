import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            default: '',
        },

        language: {
            type: String,
            required: true,
        },

        repositoryUrl: {
            type: String,
            default: '',
        },

        repositoryName: {
            type: String,
            default: '',
        },

        // These are the fields used by the existing frontend API contract.
        repository: {
            type: String,
            default: '',
            trim: true,
        },

        branch: {
            type: String,
            default: 'main',
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;
