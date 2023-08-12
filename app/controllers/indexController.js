/*
* Title: Index Controller
* Description: Root Controller - '/'
* Author: Md Kawsar Ali
* Date: 12/08/23
*/

exports.indexController = (req, res) => {
    res.status(200).json({
        message: "Welcome to School Management App!"
    })
}