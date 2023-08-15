/*
* Title: Admin Authorization Verify
* Description: Verify Admin Authorization (For Admin User)
* Author: Md Kawsar Ali
* Date: 15/08/23
*/

const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ message: 'Access Denied: Please Login First!' });
    }

    jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Access Forbidden: Your token is not valid!' });
        }

        if (decoded.role !== 'admin') {
            return res.status(401).json({ message: 'Access Denied: You are not an admin!' });
        }

        req.decoded = decoded;
        next();
    });
};

module.exports = verifyAdmin;