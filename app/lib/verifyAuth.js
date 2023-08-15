/*
* Title: Authorization Verify
* Description: Verify User Authorization (For Regular User)
* Author: Md Kawsar Ali
* Date: 15/08/23
*/

const jwt = require('jsonwebtoken')
const refreshJWT = require('./refreshJWT')

const verifyAuth = async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;

    if (accessToken && refreshToken) {
        jwt.verify(accessToken, process.env.JWT_SECRET_KEY, async (err, decoded) => {
            if (err) {

                // If accessToken is Expired refresh token!
                if (err.message === 'jwt expired') {
                    refreshJWT(refreshToken, (data) => {
                        const { newAccessToken, newRefreshToken, payload } = data;

                        // Set the tokens as an HTTP-Only cookie and send response
                        res.cookie('accessToken', newAccessToken, {
                            httpOnly: true,
                            maxAge: 3600000 // 1 Hour
                        })

                        res.cookie('refreshToken', newRefreshToken, {
                            httpOnly: true,
                            maxAge: 604800000 // 7 days
                        })

                        req.decoded = payload;
                        next();
                        return
                    });

                } else {
                    res.status(403).json({ message: 'Access Forbidden: Your token is not valid!' });
                    return res.end();
                }
            } else {

                req.decoded = decoded;
                return next();
            }
        });

    } else {
        return res.status(401).json({ message: 'Access Denied: Please Login First!' });
    }
}

module.exports = verifyAuth;