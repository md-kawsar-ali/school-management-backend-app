/*
* Title: Refresh JWT Token
* Description: Refresh JWT Token if access Token is expired
* Author: Md Kawsar Ali
* Date: 15/08/23
*/

const jwt = require("jsonwebtoken")

module.exports = async (refreshToken, callback) => {
    jwt.verify(refreshToken, process.env.JWT_SECRET_KEY, async (err2, decoded2) => {
        if (err2) {
            return res.status(403).json({ message: 'Access Forbidden: Your token is not valid!' });
        }

        const payload = {
            _id: decoded2._id,
            username: decoded2.username,
            email: decoded2.email,
            role: decoded2.role
        }

        const newAccessToken = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h'
        });

        const newRefreshToken = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: '7d'
        });

        callback({ newAccessToken, newRefreshToken, payload });
    })
}