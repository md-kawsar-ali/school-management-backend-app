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

module.exports = router;