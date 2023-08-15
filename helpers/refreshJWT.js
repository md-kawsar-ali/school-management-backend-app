/*
* Title: Refresh JWT Token
* Description: Refresh JWT Token if access Token is expired
* Author: Md Kawsar Ali
* Date: 15/08/23
*/

const jwt = require("jsonwebtoken")

const refreshToken = async (refreshToken, callback) => {
    try {
        const decoded2 = await jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

        const payload = {
            _id: decoded2._id,
            username: decoded2.username,
            email: decoded2.email,
            role: decoded2.role
        };

        const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h'
        });

        const newRefreshToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: '7d'
        });

        callback({ newAccessToken, newRefreshToken, payload });
    } catch (err) {
        res.status(403).json({ message: 'Access Forbidden: Your token is not valid!' });
        res.end();
    }
};

module.exports = refreshToken;