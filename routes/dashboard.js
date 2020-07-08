var express = require('express');
var router = express.Router();

//DB Models
const { User } = require('./../models/user');

router.get('/', function (req, res, next) {

    //TODO: you need to decide what to do when a user that is not authorized tries to visit a restricted page
    if (!req.user) return res.status(401).end('You need to be logged in');

    res.send('Dashboard Page!')

});

module.exports = router;
