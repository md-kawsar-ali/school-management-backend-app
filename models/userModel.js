/*
* Title: User Model
* Description: User mongoose model
* Author: Md Kawsar Ali
* Date: 12/08/23
*/

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: [5, 'Username must be at least 5 characters!'],
        maxLength: [25, 'Username must be less than 25 characters!']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (email) {
                // Regular expression for email validation
                return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (password) {
                // Requires: min 8 characters, uppercase, lowercase, number, and special character
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
            },
            message: 'Password must contain at least 8 characters including uppercase, lowercase, number, and special character'
        }
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'regular'],
            message: '{VALUE} is not supported'
        }
    },
    verificationToken: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true
    }
}, { collection: 'users' });

// Hash password before saving
userSchema.pre('save', async function (next) {
    const user = this; // Store the context in a variable

    if (user.isModified('password')) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
    }

    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;