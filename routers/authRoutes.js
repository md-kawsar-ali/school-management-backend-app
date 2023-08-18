/*
* Title: Authentication Routers
* Description: User registration and login routers
* Author: Md Kawsar Ali
* Date: 12/08/23
*/

const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router
    .post('/registration', userController.registration)
    .post('/login', userController.login)
    .get('/verify', userController.verifyEmail)
    .get('/logout', userController.logout)
    .post('/forget-password', userController.forgetPassword)
    .post('/reset-password', userController.resetPassword)

module.exports = router;