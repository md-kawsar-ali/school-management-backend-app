/*
* Title: Student Controllers
* Description: Student Controllers
* Author: Md Kawsar Ali
* Date: 18/08/23
*/

const mongoose = require('mongoose')
const Student = require('./../models/studentModel')

// Get All Students
exports.getAllStudent = async (req, res) => {
    try {
        const students = await Student.find({});

        if (!students || students.length <= 0) {
            return res.status(404).json({ message: 'Student not found!' })
        }

        return res.status(200).json({ students });

    } catch (err) {
        return res.status(500).json({ message: 'An error occured!' })
    }
}

// Get Student by ID
exports.getStudent = async (req, res) => {
    const id = req.params.id;

    try {
        const student = await Student.findOne({ _id: id });

        return res.status(200).json({ student });

    } catch (err) {
        return res.status(404).json({ message: 'Student not found!' })
    }
}

// Add New Student
exports.addStudent = async (req, res) => {

    // Destructuring (req.body object)
    const {
        name = undefined,
        dob = undefined,
        gender = undefined,
        enrollmentDate = undefined,
        previousClasses = []
    } = req.body;

    const {
        className = undefined,
        roll = undefined,
        section = undefined,
        academicYear = undefined
    } = req.body.currentClass || {};

    const {
        guardianName = undefined,
        relationship = undefined,
        contact = undefined
    } = req.body.guardian || {};

    const {
        phone = undefined,
        email = undefined
    } = contact || {};

    // Check All the required field
    if (!name || !dob || !gender || !className || !roll || !section || !academicYear || !guardianName || !relationship || !contact.phone) {
        return res.status(403).json({ message: 'Invalid Input: All the fields are required!' });
    }

    try {
        const newStudent = new Student({
            name,
            dob,
            gender,
            currentClass: {
                className,
                roll,
                section,
                academicYear
            },
            guardian: {
                guardianName,
                relationship,
                contact: {
                    phone,
                    email
                }
            },
            previousClasses,
            enrollmentDate
        });

        const createdStudent = await newStudent.save();

        return res.status(201).json({
            student: createdStudent,
            message: 'Student created successfully!'
        });

    } catch (err) {
        // Mongoose Validation Error
        if (err instanceof mongoose.Error.ValidationError) {
            // Concise Error Message
            const errMsg = err.message.split(": ");

            return res.status(400).json({ error: errMsg[errMsg.length - 1] });
        } else {
            return res.status(403).json({ message: 'An error occured!' });
        }
    }
}