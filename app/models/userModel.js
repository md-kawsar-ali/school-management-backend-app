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
        minLength: [5, 'Too short Username!'],
        maxLength: [15, 'Too Long Username!']
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: [8, 'Password should be 8 or more characters!']
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'regular'],
            message: '{VALUE} is not supported'
        }
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
