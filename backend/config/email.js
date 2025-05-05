const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'mail.alibeddi.com',
    port: 587,
    secure: false,
    auth: {
        user: 'sane3tounsi-project@alibeddi.com',
        pass: '---------------'
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = transporter;