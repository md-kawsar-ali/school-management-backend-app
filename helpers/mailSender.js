/*
* Title: Mail Sender
* Description: You can easily send mail using the function below
* Author: Md Kawsar Ali
* Date: 14/08/23
*/

const nodemailer = require('nodemailer');

// mailSender function
const mailSender = (to, subject, message, callback) => {

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587, // Use 587 for TSL and 465 for SSL
        secure: false, // Set to true if using SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Mail Options
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: to,
        subject: subject,
        html: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // console.log(error);

            callback(true, null)
        } else {

            callback(false, info.response)
        }
    });
}

module.exports = mailSender;