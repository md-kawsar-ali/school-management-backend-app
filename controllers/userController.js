/*
* Title: User Controllers
* Description: User Controllers
* Author: Md Kawsar Ali
* Date: 12/08/23
*/

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const mongoose = require('mongoose')
const User = require('../models/userModel')
const mailSender = require('../helpers/mailSender')

// Registration Controller
exports.registration = async (req, res) => {
    const { username, email, password } = req.body;

    // Check the password
    if (!password || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
        return res.status(403).json({ message: 'Password must contain at least 8 characters including uppercase, lowercase, number, and special character!' });
    }

    // Set default role = 'regular' (Prevent user to set role)
    const role = 'regular';
    const verificationToken = crypto.randomBytes(20).toString('hex');

    try {
        const newUser = new User({
            username,
            email,
            password,
            role,
            verificationToken,
            isVerified: false,
        });

        const createdUser = await newUser.save();

        // Send Verification Mail
        const verificationUrl = process.env.SITE_URL + '/auth/verify/?token=' + verificationToken;

        const htmlMsg = `
            <h2>Hello ${username}, <br />Please, verify your account!</h2>
            <p><a href="${verificationUrl}">Click Here</a> to verify your account!</p>
            <br />
            <p>Or, open this link in your browser: ${verificationUrl}</p>
            <br />
            <p>- Thank you!</p>
        `;
        mailSender(email, 'Account Verification!', htmlMsg, (err) => {
            if (err) {
                return res.cookie('token', '', { httpOnly: true }).status(500).json({ message: 'Registration failed!' })
            }
        });

        const user = {
            _id: createdUser._id,
            username: createdUser.username,
            email: createdUser.email,
            role: createdUser.role
        }

        res.status(201).json({
            user,
            message: `Registration successful! Please, check your email: ${email} and verify your account!`
        });

    } catch (err) {
        // Mongoose Validation Error
        if (err instanceof mongoose.Error.ValidationError) {
            // Concise Error Message
            const errMsg = err.message.split(": ");

            return res.status(400).json({ error: errMsg[errMsg.length - 1] });
        }

        // Custom Validation Error
        if (err.code === 11000 && err.keyPattern.username) {
            return res.status(400).json({ message: 'Username is already taken!' });

        } else if (err.code === 11000 && err.keyPattern.email) {
            return res.status(400).json({ message: 'Email is already used!' });
        } else {
            res.status(500).json({ message: 'Registration failed!' })
        }
    }
}

// Login Controller
exports.login = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // find user by username or email
        const user = await User.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (!user) {
            return res.cookie('token', '', { httpOnly: true }).status(401).json({ message: 'Login Failed: User Not Found!' })
        }

        // Compare hashed password
        isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.cookie('token', '', { httpOnly: true }).status(401).json({ message: 'Login Failed: Password does not match!' })
        }

        // Generate a JWT tokens
        const payload = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        }

        const accessToken = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: '1d'
        });

        const refreshToken = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: '7d'
        });

        // Set the tokens as an HTTP-Only cookie and send response
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 3600000 // 1 Hour
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 604800000 // 7 days
        })


        return res.status(200).json({
            user: payload,
            message: 'Successfully Logged In!'
        })

    } catch (err) {
        return res.status(500).json({ message: 'An error occurred! Login failed!' })
    }
}

// Logout Controller
exports.logout = (req, res) => {
    res.cookie('accessToken', '', { httpOnly: true })
    res.cookie('refreshToken', '', { httpOnly: true })

    return res.status(200)
        .json({ message: 'User Logged Out!' })
}

// Verify Email
exports.verifyEmail = async (req, res) => {
    const token = req.query.token;

    const user = await User.findOne({ verificationToken: token });

    if (token && user) {
        try {
            await User.findOneAndUpdate({ verificationToken: token }, { verificationToken: null, isVerified: true }, { new: true });

            return res.cookie('token', '', { httpOnly: true }).send('Email verified successfully!');
        } catch (err) {
            return res.status(500).send('Verification Failed!');
        }
    } else {
        return res.status(404).send('Invalid verification token!');
    }
}

// Forget Password
exports.forgetPassword = async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email : null;

    if (!email || email.length <= 0) {
        return res.status(403).json({ message: 'Invalid Email Address!' })
    }

    try {
        const user = await User.findOne({ email });

        const resetToken = await jwt.sign(
            {
                username: user.username
            },
            process.env.JWT_RESET_KEY,
            {
                expiresIn: '15m' // 15 minutes
            }
        )

        // Send reset Token using Email
        const to = user.email;
        const subject = 'Reset Password!'
        const restPasswordUrl = process.env.SITE_URL + '/auth/reset-password?token=' + resetToken;

        const htmlMsg = `
            <h3>Reset Password!</h3>
            <p>To reset your new password, please <a href="${restPasswordUrl}"><strong>Click Here</strong></a></p>
            <p>Or copy the link below and open in your browser: </p>
            <p>${restPasswordUrl}</p>
            <br/>
            <p>Note: The reset link will be expired in 15 minutes!</p>
            <br/>
            <p>- Thanks!</p>
        `;

        mailSender(to, subject, htmlMsg, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to sent reset link!' });
            }
        });

        return res.status(200).json({ message: 'Reset password link sent to your email address!' });

    } catch (err) {
        return res.status(404).json({ message: 'Account not found with this email address!' });
    }
}

// Reset Password
exports.resetPassword = async (req, res) => {
    const token = typeof req.query.token === 'string' ? req.query.token : null;
    const newPassword = typeof req.body.password === 'string' ? req.body.password : null;

    if (!token || token.length <= 0) {
        return res.status(403).json({ message: 'Invalid or Empty Token!' });
    }

    if (!newPassword || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
        return res.status(403).json({ message: 'Password must contain at least 8 characters including uppercase, lowercase, number, and special character!' });
    }

    try {
        const decoded = await jwt.verify(token, process.env.JWT_RESET_KEY);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.findOneAndUpdate(
            { email: decoded.email },
            { password: hashedPassword },
            { new: true });

        return res.status(200).json({ message: 'Your password has been reset successfully!' })

    } catch (err) {
        if (err.message === 'jwt expired') {
            return res.status(403).json({ message: 'Your reset link is already expired! Please, try again!' })
        }

        return res.status(500).json({ message: 'Failed to reset your password!' })
    }
}

// Get User Detail (Only for Logged In User)
exports.getUser = async (req, res) => {
    const username = req.decoded.username;

    try {
        // Find user excluding password and __v property
        const user = await User.findOne({ username }).select('-password -__v -verificationToken');

        if (!user) {
            return res.status(404).json({ message: 'User Not Found!' })
        }

        return res.status(200).json(user);

    } catch (err) {
        return res.status(500).json({ message: 'An error occurred!' })
    }
}

// Get All user (Only for Admin)
exports.getAllUser = async (req, res) => {
    try {
        // Find user excluding password and __v property
        const users = await User.find({}).select('-password -__v -verificationToken');

        if (!users) {
            return res.status(404).json({ message: 'Users Not Found!' })
        }

        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: 'An error occurred!' })
    }
}