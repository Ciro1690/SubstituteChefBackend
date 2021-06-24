// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
// javascript
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = (sendTo, sendFrom, messageText) => {
    const msg = {
        to: sendTo, // Change to your recipient
        from: sendFrom, // Change to your verified sender
        subject: 'Substitute Chef',
        text: 'Update to application!',
        html: messageText,
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })
}

module.exports = { sendEmail };