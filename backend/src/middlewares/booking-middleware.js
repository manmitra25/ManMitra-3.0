const Booking = require('../models/booking-model')


const self_booking_middleware = async (req, res, next) => {
 
  try {

    let username = req.user.username;
    
    // Fetch user details from the database
    const userselfBooking = await Booking.find({username:username});

    console.log("userselfBooking",userselfBooking);
    
    req.userBookingdata= userselfBooking;
    req.userBookingID = userselfBooking._id;

    console.log("hyatun", req.userBookingdata);
    
    next();
  } catch (error) {
    console.error("Error in self_maintain_middleware:", error.message);
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};

module.exports = self_booking_middleware;