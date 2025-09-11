const User = require('../models/user-model')
const Service = require('../models/service-model')

const listServices = async (req,res) => {
  try {

    let allServices = await Service.find();
    
   
    res.status(200).json(allServices)

  } catch (error) {
    console.log("error from listServices controller",error);
    
    res.status(500).json({message: "error from listServices controller"})
  }
}

const createService = async (req,res) => {
  try {
    // const {id} = req.body;
    
    // let checkUser = await User.findOne({id});

    let createdService = await ServiceCategory.create({name,description,price,category})
    console.log("jhala create",createdService);
    
   return res.status(201).json(createdService)
  } catch (error) {
    res.send(error)
  }
}

module.exports ={ listServices , createService}