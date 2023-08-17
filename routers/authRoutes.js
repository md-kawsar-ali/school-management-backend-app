/*
* Title: Authentication Routers
* Description: User registration and login routers
* Author: Md Kawsar Ali
* Date: 12/08/23
*/

const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/verify', userController.verifyEmail)
router.get('/logout', userController.logout)

module.exports = router;