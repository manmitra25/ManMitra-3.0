const express = require('express');
const router = express.Router();

const authMiddleware = require("../middlewares/auth-middleware")
const serviceController = require("../controllers/service-controller")

router.route("/all").get(authMiddleware,serviceController.listServices);

router.route("/create").post(authMiddleware,serviceController.createService);





module.exports = router;