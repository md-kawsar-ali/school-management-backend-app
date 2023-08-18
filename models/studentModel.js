/*
* Title: Student Model
* Description: Student mongoose model
* Author: Md Kawsar Ali
* Date: 18/08/23
*/

const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'non-binary'],
        required: true
    },
    currentClass: {
        className: { type: String, required: true },
        roll: { type: String, required: true },
        section: { type: String, required: true },
        academicYear: { type: String, required: true }
    },
    guardian: {
        guardianName: { type: String, required: true },
        relationship: { type: String, required: true },
        contact: {
            phone: { type: String, required: true },
            email: {
                type: String,
                validate: {
                    validator: function (email) {
                        // Regular expression for email validation
                        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);
                    },
                    message: 'Please enter a valid email address'
                }
            }
        }
    },
    previousClasses: [{
        className: String,
        roll: String,
        section: String,
        academicYear: String
    }],
    enrollmentDate: { type: Date, default: Date.now }
}, { collection: 'students' });


const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
