const mongoose = require("mongoose")



const connectDB = async (req,res) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database connected ${process.env.MONGODB_URI}`);
        
    } catch (error) {
        console.log("DB connection failed",error);
        
    }
}

module.exports = connectDB