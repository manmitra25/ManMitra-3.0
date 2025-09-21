import express from "express";
import { adminAuth } from "../middleware/admin-middleware.js";
import {
  addVolunteer,
  addTherapist,
  getVolunteers,
  getTherapists,
  deleteVolunteer,
  deleteTherapist,
  registerAdmin,
  loginAdmin,
  getPendingRequests,
  updateTherapistStatus,
  updateVolunteerStatus
} from "../controllers/admin-controller.js";

const router = express.Router();

// Protect all routes with adminAuth


router.post("/signup", registerAdmin);

router.post("/login", loginAdmin);
router.use(adminAuth);
router.post("/volunteer", addVolunteer);
router.get("/volunteers", getVolunteers);
router.delete("/volunteer-del/:id", deleteVolunteer);

router.post("/therapist", addTherapist);
router.get("/therapists", getTherapists);
router.delete("/therapist-del/:id", deleteTherapist);

//accept request and update
router.get("/pending",  getPendingRequests);
router.patch("/therapist/:id",  updateTherapistStatus);
router.patch("/volunteer/:id", updateVolunteerStatus);

export default router;
