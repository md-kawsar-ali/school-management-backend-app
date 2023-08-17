/*
* Title: Authorization Verify
* Description: Verify User Authorization (For Regular User)
* Author: Md Kawsar Ali
* Date: 15/08/23
*/

const jwt = require('jsonwebtoken')
const refreshJWT = require('./refreshJWT')

// Set http-Only Cookies
const setCookiesAndContinue = (req, res, newAccessToken, newRefreshToken, payload, next) => {
    res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        maxAge: 3600000 // 1 Hour
    });

    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        maxAge: 604800000 // 7 days
    });

    req.decoded = payload;
    next();
};

const verifyAuth = async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;

    if (accessToken && refreshToken) {
        try {
            const decoded = await jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

            // Check the user is verified or not
            if (!decoded.isVerified) {
                return res.cookie('token', '', { httpOnly: true }).status(401).json({ message: 'Sorry! Your Account is not Verified! Please, check your email address and verify!' })
            }

            req.decoded = decoded;
            return next();

        } catch (err) {
            if (err.message === 'jwt expired') {
                refreshJWT(refreshToken, (data) => {

                    // Set New Tokens
                    setCookiesAndContinue(req, res, data.newAccessToken, data.newRefreshToken, data.payload, next);

                });

            } else {
                res.status(403).json({ message: 'Access Forbidden: Your token is not valid!' });
                res.end();
            }
        }

    } else {

        return res.status(401).json({ message: 'Access Denied: Please Login First!' });
    }
};

module.exports = verifyAuth;