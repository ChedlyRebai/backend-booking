import express from "express";
import {
  getAllReservations,
  getMyReservation,
  getReservationById,
} from "../controllers/reservationController.js";
const router = express.Router();

router.get("/getmyreservation", getMyReservation);
router.get("/getreservationId/:userId", getReservationById);
router.get("/getallreservation", getAllReservations);

export default router;
