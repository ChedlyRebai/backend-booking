import express from "express";
import {
  createRoom,
  deleteRoom,
  getRoom,
  getRoomByRoomNumber,
  getRooms,
  updateRoom,
  updateRoomAvailability,
} from "../controllers/room.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();
//CREATE
router.post("/:hotelid",  createRoom);

//UPDATE
router.put("/availability/:id", updateRoomAvailability);
router.put("/:id",  updateRoom);
//DELETE
router.delete("/:id/:hotelid",  deleteRoom);
//GET

router.get("/getRoomById", getRoomByRoomNumber);

router.get("/:id", getRoom);
//GET ALL

router.get("/", getRooms);

export default router;
