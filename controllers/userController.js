/*
* Title: User Controllers
* Description: User Controllers
* Author: Md Kawsar Ali
* Date: 12/08/23
*/

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('../models/userModel');

// Registration Controller
exports.registration = async (req, res) => {
    const { username, email, password } = req.body;

    // Set default role = 'regular' (Prevent user to set role)
    const role = 'regular';

    try {
        const newUser = new User({
            username,
            email,
            password,
            role
        });

        const createdUser = await newUser.save();

        const user = {
            _id: createdUser._id,
            username: createdUser.username,
            email: createdUser.email,
            role: createdUser.role
        }

        const accessToken = await jwt.sign(user, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h'
        });

        const refreshToken = await jwt.sign(user, process.env.JWT_SECRET_KEY, {
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

        res.status(201)
            .json({
                user,
                message: 'Registration successful!'
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
            return res.cookie('token', '', { httpOnly: true }).status(400).json({ message: 'Username is already taken!' });

        } else if (err.code === 11000 && err.keyPattern.email) {
            return res.cookie('token', '', { httpOnly: true }).status(400).json({ message: 'Email is already used!' });
        } else {
            res.cookie('token', '', { httpOnly: true }).status(500).json({ message: 'Registration failed!' })
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
            role: user.role
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

// Get User Detail (Only for Logged In User)
exports.getUser = async (req, res) => {
    const username = req.decoded.username;

    try {
        // Find user excluding password and __v property
        const user = await User.findOne({ username }).select('-password -__v');

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
        const users = await User.find({}).select('-password -__v');

        if (!users) {
            return res.status(404).json({ message: 'Users Not Found!' })
        }

        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: 'An error occurred!' })
    }
}