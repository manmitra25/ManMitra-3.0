const jwt = require("jsonwebtoken");
const User = require("../models/user-model");


const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized HTTP, Token not provided" });
  }

  // Remove "Bearer" prefix
  const jwtToken = token.replace("Bearer", "").trim();
  console.log("Token from auth middleware:", jwtToken);

  try {
    // Verify the token
    const isVerified = jwt.verify(jwtToken, process.env.JWT_KEY);
    console.log("Verified token payload:", isVerified);

    // Fetch user details from the database
    const userData = await User.findOne({ nickname: isVerified.nickname }).select({
      password: 0,
    });

    // If user is not found, return Unauthorized error
    if (!userData) {
      console.warn("Unauthorized: User not found in database.");
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    req.token = token;
    req.user = userData;
    req.userID = userData._id;

    next();
  } catch (error) {
    console.error("Error in auth middleware:", error.message);
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};




module.exports = authMiddleware ;
