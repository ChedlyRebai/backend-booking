// reservationController.js
import Reservation from "../models/reservation.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import { createError } from "../utils/error.js";

export const createReservation = async (req, res, next) => {
  const { userId, roomId, checkInDate, checkOutDate, totalPrice } = req.body;

  try {
    // Create a new reservation
    const newReservation = new Reservation({
      user: userId,
      room: roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
    });
    const savedReservation = await newReservation.save();

    // Update user's reservation list
    await User.findByIdAndUpdate(userId, {
      $push: { reservations: savedReservation._id },
    });

    res.status(201).json(savedReservation);
  } catch (err) {
    next(err);
  }
};
