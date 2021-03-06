var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('./../config');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//DB Models
const { User } = require('./../models/user');

router.post('/v/:email?/:refreshToken?', function (req, res, next) {

    if (!req.params.email || !req.params.refreshToken) {
        return res.status(400).end("The submitted URL is invalid. Please check your email and try again.")
    }

    User.findOne({ 'email': req.params.email }, (err, user) => {
        if (err) return res.status(400).send('There was an error with your request. Please try again.');

        //Check if email exists in the database
        if (!user) return res.status(404).end('No user found with that email');

        //Check if token matches
        const refreshToken = user.refreshTokens.filter(token => token == req.params.refreshToken);
        if (refreshToken.length < 1) return res.status(404).end("Link has expired. Please login and get a new Verification Link.");

        user.active = 1;
        user.save((err, user) => {
            if (err) return res.status(400).send('There was an error with your request. Please try again.');
            res.send("Account has been Verified")
        })

    })

});

router.post('/resend', function (req, res, next) {

    jwt.verify(req.cookies.refreshToken, config.REFRESH_TOKEN_SECRET, (err, user) => {
        // if (err) return console.log(err)

        const hostname = (process.env.NODE_ENV === 'production' ? req.hostname : `http://localhost:${process.env.PORT}`)

        //TODO: Configure email content as needed 
        const msg = {
            to: `${user.email}`,
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL} >`,
            subject: 'Verification Email',
            text: `Hi ${user.firstname}, Please use this link to verify your email address: ${hostname}/verify-account/v/${user.email}/${req.cookies.refreshToken}`,
            html: `
                    Hi ${user.firstname}, Please use this link to verify your email address:
                    <br><br>
                    ${hostname}/verify-account/v/${user.email}/${req.cookies.refreshToken}
                `,
        };
        //ES6
        sgMail
            .send(msg)
            .then(() => {
                // console.log("Message sent!");
                res.status(200).end("Check your email")
            }, error => {
                // console.error(error);
                res.status(400).end('There was an error Processing your request. Please try again')

                // if (error.response) return console.error(error.response.body)

            });
    })

});

module.exports = router;