import express from "express";
import {
  getMyReservation,
  getReservationById,
} from "../controllers/reservationController.js";
const router = express.Router();

router.get("/getmyreservation", getMyReservation);
router.get("/getreservationId/:userId", getReservationById);

export default router;
