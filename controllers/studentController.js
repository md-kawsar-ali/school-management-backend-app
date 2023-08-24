/*
* Title: Student Controllers
* Description: Student Controllers
* Author: Md Kawsar Ali
* Date: 18/08/23
*/

const mongoose = require('mongoose');
const Student = require('./../models/studentModel')

// Get All Students with skip and limit
exports.getAllStudent = async (req, res) => {
    try {
        const skip = parseInt(req.query?.skip);
        const limit = parseInt(req.query?.limit);

        const students = await Student.find().skip(skip).limit(limit);
        const total = await Student.countDocuments();

        if (!students || students.length <= 0) {
            return res.status(404).json({ message: 'Student not found!' })
        }

        return res.status(200).json({ students, total });

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

// Update Student by ID
exports.updateStudent = async (req, res) => {
    const studentId = req.params.id;
    const updates = req.body;

    try {
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found!' })
        }

        // Student Info Validation
        if (updates.name && typeof updates.name === 'string') {
            student.name = updates.name;
        }

        if (updates.dob) {
            student.dob = updates.dob;
        }

        if (updates.gender && ['male', 'female', 'non-binary'].includes(updates.gender)) {
            student.gender = updates.gender;
        }

        // Current Class Validation
        if (updates.currentClass && typeof updates.currentClass === 'object') {

            if (updates.currentClass.className && typeof updates.currentClass.className === 'string') {
                student.currentClass.className = updates.currentClass.className;
            }

            if (updates.currentClass.roll && typeof updates.currentClass.roll === 'string') {
                student.currentClass.roll = updates.currentClass.roll;
            }

            if (updates.currentClass.section && typeof updates.currentClass.section === 'string') {
                student.currentClass.section = updates.currentClass.section;
            }

            if (updates.currentClass.academicYear && typeof updates.currentClass.academicYear === 'string') {
                student.currentClass.academicYear = updates.currentClass.academicYear;
            }
        }

        // Guardian Info Validation
        if (updates.guardian && typeof updates.guardian === 'object') {

            if (updates.guardian.guardianName && typeof updates.guardian.guardianName === 'string') {
                student.guardian.guardianName = updates.guardian.guardianName;
            }

            if (updates.guardian.relationship && typeof updates.guardian.relationship === 'string') {
                student.guardian.relationship = updates.guardian.relationship;
            }

            if (updates.guardian.contact && typeof updates.guardian.contact === 'object') {
                if (updates.guardian.contact.phone && typeof updates.guardian.contact.phone === 'string') {
                    student.guardian.contact.phone = updates.guardian.contact.phone;
                }

                if (updates.guardian.contact.email && /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(updates.guardian.contact.email)) {
                    student.guardian.contact.email = updates.guardian.contact.email;
                }
            }
        }

        // Previous Classes Validation
        if (updates.previousClasses && Array.isArray(updates.previousClasses)) {

            if (updates.previousClasses.length > 0) {
                updates.previousClasses.map((prevClass) => {


                    const existingClass = student.previousClasses.find(classObj => classObj._id?.toString() === prevClass._id?.toString());

                    if (existingClass) {
                        if (prevClass.className) {
                            existingClass.className = prevClass.className;
                        }

                        if (prevClass.roll) {
                            existingClass.roll = prevClass.roll;
                        }

                        if (prevClass.section) {
                            existingClass.section = prevClass.section;
                        }

                        if (prevClass.academicYear) {
                            existingClass.academicYear = prevClass.academicYear;
                        }
                    } else {
                        const newClass = {}

                        if (prevClass.className) {
                            newClass.className = prevClass.className;
                        }

                        if (prevClass.roll) {
                            newClass.roll = prevClass.roll;
                        }

                        if (prevClass.section) {
                            newClass.section = prevClass.section;
                        }

                        if (prevClass.academicYear) {
                            newClass.academicYear = prevClass.academicYear;
                        }

                        student.previousClasses.push(newClass);
                    }
                });
            }
        }

        const updatedStudent = await student.save();

        if (!updatedStudent) {
            res.status(400).json({ message: 'Failed to update student!' });
        }

        res.status(200).json({ student: updatedStudent, message: 'Student updated successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'An error occured!' });
    }
}

// Delete Student by ID
exports.deleteStudent = async (req, res) => {
    const studentId = req.params.id;

    try {
        const deletedStudent = await Student.findByIdAndDelete(studentId);

        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found!' });
        }

        res.status(200).json({ message: 'Student deleted successfully!' });

    } catch (err) {
        res.status(500).json({ message: 'An error occured!' });
    }
}