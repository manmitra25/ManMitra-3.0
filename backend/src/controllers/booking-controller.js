const User = require('../models/user-model')
const Service = require('../models/service-model')
const Booking = require('../models/booking-model')
const PsychoContent = require('../models/gamedata-psycho-model')
const createBooking = async (req,res) => {
  try {
   //userId,serviceId,price,status,history}
   const { serviceId } = req.params;
   console.log("this is service id",serviceId);
   
  const userId =  req.userID ;
  let username = req.user.username;

//   const serviceId =  req.serviceID ;

    const service = req.service;
    const servicename = req.servicename;

    let createdBooking = await Booking.create({username:username,userId:userId,serviceId:serviceId,status:service.status,history:service.history,price:service.price,servicename:servicename})

    console.log(createdBooking);
    
    
   return res.status(201).json(createdBooking)
  } catch (error) {
    console.log(error);
    
    console.log(error.message);
    
    res.send(error);
  }
}

const getAllBookings = async(req,res,next) =>
  {
      try {
          const bookings=await PsychoContent.find({});
          console.log(bookings);
          
          if(!bookings || bookings.length===0){
              return res.status(404).json({message:"No bookings"})
          }else{
              return res.status(200).json(bookings)
          }
      } catch (error) {
          next(error);
      }
  }

 
  
      const selfBooking = async (req, res) => {
          try {
            // const userData = await User.find({});
            const bookingData =  req.userBookingdata
            console.log(bookingData);
            return res.status(200).json( bookingData );
          } catch (error) {
            console.log(` error from self bookimng route ${error}`);
          }
        };
      
  
  
  
      

module.exports = {createBooking,getAllBookings,selfBooking}