const jwt = require("jsonwebtoken");
const Service = require("../models/service-model"); // Use Service model, not ServiceCategory

const serviceMiddleware = async (req, res, next) => {
  try {
    // // Extract token from headers
    // const token = req.header("Authorization");
    // if (!token) {
    //   return res.status(401).json({ message: "Unauthorized: Token not provided" });
    // }

    // // Remove "Bearer" prefix
    // const jwtToken = token.replace("Bearer", "").trim();

    // // // Verify JWT Token
    // // const decoded = jwt.verify(jwtToken, process.env.JWT_KEY);
    // // req.userID = decoded.id; // Store userId in request

    // Extract serviceId from query
    const serviceId = req.query.serviceId || req.params.serviceId;
    if (!serviceId) {
      return res.status(400).json({ message: "Service ID is required" });
    }
    console.log(serviceId);
    

    // Fetch service details
    const serviceData = await Service.findById({_id:serviceId});
    console.log("service data",serviceData);
    
    if (!serviceData) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Attach data to request
    req.service = serviceData;
    req.serviceID = serviceData._id;
    req.servicename = serviceData.name;
    next(); // Proceed to controller
  } catch (error) {
    console.error("Error in service middleware:", error.message);
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};

module.exports = serviceMiddleware;
