const config = require('./config');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Get the ROUTES
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const forgotPasswordRouter = require('./routes/forgot_password');
const resetPasswordRouter = require('./routes/reset_password');
const dashboardRouter = require('./routes/dashboard');
const verifyAccountRouter = require('./routes/verify_account');

const app = express();

//DB Config
mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Middleware
const { auth } = require('./middleware/auth');

// Assign the ROUTES
app.use('/', auth, loginRouter);
app.use('/api/logout', auth, logoutRouter);
app.use('/api/login', auth, loginRouter);
app.use('/api/verify-account', verifyAccountRouter);
app.use('/api/register', auth, registerRouter);
app.use('/api/forgot-password', auth, forgotPasswordRouter);
app.use('/api/reset-password', auth, resetPasswordRouter);
app.use('/api/dashboard', auth, dashboardRouter);

module.exports = app;
