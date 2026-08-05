import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { buildUserResponse } from '../utils/transformers.js';

const OTP_LIFETIME_MS = 10 * 60 * 1000;
const includeDemoOtp = process.env.NODE_ENV !== 'production';

const withDemoOtp = (payload, otp) => (
    includeDemoOtp ? { ...payload, demoOtp: otp } : payload
);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const createOtpPayload = async () => {
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 12);
    return {
        otp,
        otpHash,
        otpExpiresAt: new Date(Date.now() + OTP_LIFETIME_MS),
    };
};

const formatOtpEmail = (otp, purpose) => {
    const subject = purpose === 'login' ? 'Your AI Code Review login OTP' : 'Verify your AI Code Review account';
    const verb = purpose === 'login' ? 'login' : 'verification';

    return {
        subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 10px;">
                <h2>${purpose === 'login' ? 'Login OTP' : 'Verify Your Email'}</h2>
                <p>${purpose === 'login' ? 'Use the code below to sign in to your AI Code Review account.' : 'Thank you for registering with AI Code Review.'}</p>
                <p>Your ${verb} OTP is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; text-align: center; background: #f5f5f5; border-radius: 8px;">
                    ${otp}
                </div>
                <p>This OTP will expire in <strong>10 minutes</strong>.</p>
                <p>If you did not request this, you can ignore this email.</p>
            </div>
        `,
    };
};

const sendOtpEmail = async (email, otp, purpose = 'verification') => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        return;
    }

    const { subject, html } = formatOtpEmail(otp, purpose);

    try {
        await transporter.sendMail({
            from: `"AI Code Review" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html,
        });
    } catch (error) {
        console.warn('Email delivery skipped:', error.message);
    }
};

const respondWithError = (res, status, message, error = null) => {
    return res.status(status).json({
        success: false,
        message,
        error: error || message,
    });
};

const issueTokenResponse = (res, user, message = 'Authentication successful') => {
    const token = generateToken(user._id);
    return res.status(200).json({
        success: true,
        message,
        token,
        user: buildUserResponse(user),
    });
};

const finalizeOtpAuthentication = async (res, user, otp, message = 'Authentication successful') => {
    const token = generateToken(user._id);
    user.otpHash = null;
    user.otpExpiresAt = null;
    if (!user.isVerified) {
        user.isVerified = true;
    }
    await user.save();

    return res.status(200).json({
        success: true,
        message,
        token,
        user: buildUserResponse(user),
    });
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email) {
            return respondWithError(res, 400, 'Name and email are required');
        }

        if (password && password.length < 6) {
            return respondWithError(res, 400, 'Password must be at least 6 characters');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return respondWithError(res, 400, 'Invalid email format');
        }

        const existingUser = await User.findOne({ email });
        const { otp, otpHash, otpExpiresAt } = await createOtpPayload();
        const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

        if (existingUser) {
            if (existingUser.isVerified) {
                return respondWithError(res, 409, 'User already exists');
            }

            existingUser.name = name;
            if (hashedPassword) {
                existingUser.password = hashedPassword;
            }
            existingUser.otpHash = otpHash;
            existingUser.otpExpiresAt = otpExpiresAt;
            await existingUser.save();

            await sendOtpEmail(email, otp);
            return res.status(200).json(withDemoOtp({
                success: true,
                message: 'Verification code sent to your email.',
            }, otp));
        }

        const user = await User.create({
            name,
            email,
            ...(hashedPassword ? { password: hashedPassword } : {}),
            isVerified: false,
            otpHash,
            otpExpiresAt,
        });

        await sendOtpEmail(email, otp);

        return res.status(201).json(withDemoOtp({
            success: true,
            message: 'Verification code sent to your email.',
        }, otp));
    } catch (error) {
        console.error('Register error:', error);
        return respondWithError(res, 500, 'Server error', error.message);
    }
};

export const verifyEmailOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return respondWithError(res, 400, 'Email and OTP are required');
        }

        const user = await User.findOne({ email });
        if (!user) {
            return respondWithError(res, 404, 'User not found');
        }

        if (!user.otpHash || !user.otpExpiresAt) {
            return respondWithError(res, 400, 'No OTP found. Please request a new verification code.');
        }

        if (new Date() > user.otpExpiresAt) {
            return respondWithError(res, 400, 'OTP expired. Please request a new verification code.');
        }

        const isOtpValid = await bcrypt.compare(otp, user.otpHash);
        if (!isOtpValid) {
            return respondWithError(res, 400, 'Invalid OTP. Please try again.');
        }

        return finalizeOtpAuthentication(res, user, otp, user.isVerified ? 'Login successful.' : 'Email verified successfully.');
    } catch (error) {
        console.error('Verify OTP error:', error);
        return respondWithError(res, 500, 'Server error', error.message);
    }
};

export const resendVerificationOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return respondWithError(res, 400, 'Email is required');
        }

        const user = await User.findOne({ email });
        if (!user) {
            return respondWithError(res, 404, 'User not found');
        }

        const { otp, otpHash, otpExpiresAt } = await createOtpPayload();
        user.otpHash = otpHash;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();

        await sendOtpEmail(email, otp);

        return res.status(200).json(withDemoOtp({
            success: true,
            message: 'Verification OTP resent to your email.',
        }, otp));
    } catch (error) {
        console.error('Resend OTP error:', error);
        return respondWithError(res, 500, 'Server error', error.message);
    }
};

export const requestLoginOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return respondWithError(res, 400, 'Email is required');
        }

        const user = await User.findOne({ email });
        if (!user) {
            return respondWithError(res, 404, 'User not found');
        }

        if (!user.isVerified) {
            return respondWithError(res, 400, 'Please verify your email before requesting login OTP.');
        }

        const { otp, otpHash, otpExpiresAt } = await createOtpPayload();
        user.otpHash = otpHash;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();

        await sendOtpEmail(email, otp, 'login');

        return res.status(200).json(withDemoOtp({
            success: true,
            message: 'Login OTP sent to your email.',
        }, otp));
    } catch (error) {
        console.error('Login OTP request error:', error);
        return respondWithError(res, 500, 'Server error', error.message);
    }
};

export const verifyLoginOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return respondWithError(res, 400, 'Email and OTP are required');
        }

        const user = await User.findOne({ email });
        if (!user) {
            return respondWithError(res, 404, 'User not found');
        }

        if (!user.otpHash || !user.otpExpiresAt) {
            return respondWithError(res, 400, 'No OTP found. Please request a new login code.');
        }

        if (new Date() > user.otpExpiresAt) {
            return respondWithError(res, 400, 'OTP expired. Please request a new login code.');
        }

        const isOtpValid = await bcrypt.compare(otp, user.otpHash);
        if (!isOtpValid) {
            return respondWithError(res, 400, 'Invalid OTP. Please try again.');
        }

        return finalizeOtpAuthentication(res, user, otp, 'Login successful.');
    } catch (error) {
        console.error('Verify login OTP error:', error);
        return respondWithError(res, 500, 'Server error', error.message);
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return respondWithError(res, 400, 'Email is required');
        }

        const user = await User.findOne({ email });
        if (!user) {
            return respondWithError(res, 404, 'User not found');
        }

        if (!user.isVerified) {
            return respondWithError(res, 403, 'Please verify your email before logging in.');
        }

        if (!password) {
            const { otp, otpHash, otpExpiresAt } = await createOtpPayload();
            user.otpHash = otpHash;
            user.otpExpiresAt = otpExpiresAt;
            await user.save();
            await sendOtpEmail(email, otp, 'login');
            return res.status(200).json(withDemoOtp({
                success: true,
                message: 'Login OTP sent to your email.',
            }, otp));
        }

        if (!user.password) {
            return respondWithError(res, 401, 'Please use email verification to sign in.');
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return respondWithError(res, 401, 'Invalid email or password');
        }

        return issueTokenResponse(res, user, 'Login successful');
    } catch (error) {
        console.error('Login error:', error);
        return respondWithError(res, 500, 'Server error', error.message);
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return respondWithError(res, 404, 'User not found');
        }

        return res.status(200).json({
            success: true,
            user: buildUserResponse(user),
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return respondWithError(res, 500, 'Server error', error.message);
    }
};
