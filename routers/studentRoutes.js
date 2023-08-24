/*
* Title: Student Routers
* Description: Student management routers
* Author: Md Kawsar Ali
* Date: 18/08/23
*/

const express = require('express')
const router = express.Router()
const studentController = require('../controllers/studentController')
const verifyAuth = require('./../helpers/verifyAuth')
const verifyAdmin = require('./../helpers/verifyAdmin')

router
    .get('/', verifyAuth, verifyAdmin, studentController.getAllStudent)
    .get('/:id', verifyAuth, verifyAdmin, studentController.getStudent)
    .post('/', verifyAuth, verifyAdmin, studentController.addStudent)
    .patch('/:id', verifyAuth, verifyAdmin, studentController.updateStudent)
    .delete('/:id', verifyAuth, verifyAdmin, studentController.deleteStudent)

module.exports = router;