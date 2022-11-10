const Email = require('email-templates');
require("dotenv").config(); 

const mailtrap_user = process.env.MAILTRAP_USER;
const mailtrap_pass = process.env.MAILTRAP_PASS;

const sendMail = (application, recipient, token_url, callback) => {

    const email = new Email({
        message: {
            from: 'noreply@auth.com'
        },
        send: true,
        transport: {
            host: 'smtp.mailtrap.io',
            port: 2525,
            ssl: false,
            tls: true,
            auth: {
                user: mailtrap_user,
                pass: mailtrap_pass
            }
        }
    });

    let data = { email: email, link: token_url, application: application };
    
    email
    .send({
        template: 'token',
        message: {
            to: recipient
        },
        locals: data
    })
    .then(console.log)
    .then(() => callback())
    .catch(console.error);
}

module.exports = {
    sendMail
};