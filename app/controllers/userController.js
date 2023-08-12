/*
* Title: User Controllers
* Description: User Controllers
* Author: Md Kawsar Ali
* Date: 12/08/23
*/

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/userModel');

// Registration Controller
exports.registration = async (req, res) => {
    const { username, email, password } = req.body;

    // Set default role = 'regular'
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

        // Sign JWT Token
        const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
            expiresIn: '1d'
        })

        res.cookie('token', token, { httpOnly: true })
            .status(201)
            .json({
                user,
                message: 'Registration successful!'
            });

    } catch (err) {
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
            return res.cookie('token', '', { httpOnly: true }).status(401).json({ message: 'Authentication Failed: User Not Found!' })
        }

        // Compare hashed password
        isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.cookie('token', '', { httpOnly: true }).status(401).json({ message: 'Authentication Failed: Password does not match!' })
        }

        // Generate a JWT token
        const payload = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }

        const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: '1d'
        });

        // Set the token as an HTTP-Only cookie and send response
        return res.cookie('token', token, { httpOnly: true })
            .status(200)
            .json({
                user: payload,
                message: 'Successfully Logged In!'
            })

    } catch (err) {
        return res.status(500).json({ message: 'An error occurred! Login failed!' })
    }
}