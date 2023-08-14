/*
* Title: Index Route
* Description: This is root router - '/'
* Author: Md Kawsar Ali
* Date: 12/08/23
*/
const express = require('express')
const router = express.Router()

const { indexController } = require("../controllers/indexController");

router.get('/', indexController)

module.exports = router;