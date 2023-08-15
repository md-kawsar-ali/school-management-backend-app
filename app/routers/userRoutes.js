/*
* Title: User Routes
* Description: This is user routes such as view user details etc...
* Author: Md Kawsar Ali
* Date: 12/08/23
*/

const express = require('express')
const router = express.Router()
const verifyAuth = require('./../lib/verifyAuth')
const verifyAdmin = require('./../lib/verifyAdmin')

const userController = require('./../controllers/userController');

router.get('/', verifyAuth, userController.getUser);
router.get('/all', verifyAuth, verifyAdmin, userController.getAllUser);

module.exports = router;