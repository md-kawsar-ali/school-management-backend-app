/*
* Title: Authorization Verify
* Description: Verify User Authorization (For Regular User)
* Author: Md Kawsar Ali
* Date: 15/08/23
*/

const jwt = require("jsonwebtoken")

const verifyAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Access Forbidden: Your token is not valid!' });
            }

            req.decoded = decoded;
            next();
        });

    } else {
        return res.status(401).json({ message: 'Access Denied: Please Login First!' });
    }
}

module.exports = verifyAuth;