import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            default: null,
        },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },

        plan: {
            type: String,
            enum: ['free', 'pro'],
            default: 'free',
        },

        reviewCount: {
            type: Number,
            default: 0,
        },

        avatar: {
            type: String,
            default: '',
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false,
        },

        otpHash: {
            type: String,
            default: null,
        },

        otpExpiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

export default User;