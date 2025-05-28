
const users = require('../models/tenant.js'); 

const authenticateUser = async (req, res) => {  
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ message: "Please provide phone number" });
    }
    // Check if the user exists in the database
    const user = await users.find({ phone: phone }).lean();
    if (user && user.length > 0) {
        // Populate unitsLeased field for the first user found
        const populatedUser = await users.populate(user, { path: 'unitsLeased' });
        user[0].unitsLeased = populatedUser[0].unitsLeased;
    }
    if (!user) {
        return res.status(401).json({ message: "Invalid phone" });
    }
    return res.render("homepage.ejs", {'user':user[0]}); 
}


module.exports = {  
    authenticateUser,
};