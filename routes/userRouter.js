
const express = require('express');
const tenantRouter = require('./tenantRouter');
const unitRouter = require('./unitRouter');
const { authenticateUser } = require('../controllers/userControl');


const userRouter = express.Router();

userRouter.get('/', (req, res) => {
    res.render('signin.ejs', { message: "Welcome to VNR Auto Rental!" });
});

userRouter.post('/', authenticateUser);


module.exports = userRouter;
