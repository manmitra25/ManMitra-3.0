const User = require("../models/user-model");
const adminMiddleware = async (req,res,next) => {
    let admin = req.user;
    console.log(admin);
    
    console.log("auth midde ",req.user);
    // const role = User.isAdmin
//    console.log(role);
   
    if(!admin){
        res.status(403).json({message:"Access denied. user is not an admin"})
    }
    next();
    
}
module.exports = adminMiddleware