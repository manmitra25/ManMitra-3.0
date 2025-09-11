const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');
const bookingController = require('../controllers/booking-controller');
const authMiddleware = require("../middlewares/auth-middleware")
const adminMiddleware = require("../middlewares/admin-middleware")
const serviceMiddleware = require("../middlewares/services-middleware")
const self_booking_middleware = require("../middlewares/booking-middleware")
router.route("/").get(authController.home);

router.route("/signup").post(authController.signup);

router.route("/login").post(authController.login);

router.route("/user").get( authMiddleware, authController.user);

// router.route("/anon").get( authMiddleware, authController.anon);

// router.route("/user/:id").get( authMiddleware, authController.getUserbyId);

router.route("/bookings").get( authMiddleware,bookingController.getAllBookings);

router.route("/allusers").get( authMiddleware, adminMiddleware,authController.getAllUsers);

router.route("/booking/:serviceId").post(authMiddleware,serviceMiddleware,bookingController.createBooking)


router.route("/selfbooking").get( authMiddleware, self_booking_middleware,bookingController.selfBooking);

router.route("/user/:id").get( adminMiddleware, authController.getUserbyId);

router.route("/users/delete/:id").delete(authMiddleware,adminMiddleware,authController.deleteUserById);

router.route("/users/update/:id").patch(authMiddleware,adminMiddleware,authController.updateUserbyId);
module.exports = router;