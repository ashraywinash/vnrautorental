const express = require('express');
const tenantRouter = require('./tenantRouter');
const unitRouter = require('./unitRouter');


const adminRouter = express.Router();

adminRouter.get('/', (req, res) => {
    res.render('adminpage.ejs', { message: "Welcome to VNR Auto Rental!" });
});
adminRouter.use('/tenant', tenantRouter)
adminRouter.use('/unit', unitRouter)


module.exports = adminRouter;