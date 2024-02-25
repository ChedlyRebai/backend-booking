// reservationController.js
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import {
  default as Reservation,
  default as reservation,
} from "../models/reservation.js";

export const createReservation = async (req, res, next) => {
  const { userId, roomId, checkInDate, checkOutDate, totalPrice } = req.body;

  try {
    const newReservation = new Reservation({
      user: userId,
      room: roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
    });
    console.log(req.body);
    console.log("total:", totalPrice);
    const savedReservation = await newReservation.save();

    await User.findByIdAndUpdate(userId, {
      $push: { reservations: savedReservation._id },
    });

    res.status(201).json(savedReservation);
  } catch (err) {
    next(err);
  }
};

export const getReservationById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const reservations = await reservation.find({ user: userId });
    const roomIds = reservations.map((item) => item.room);

    const roomPromises = roomIds.map(async (roomId) => {
      return await Room.findOne({ "roomNumbers._id": roomId });
    });

    const rooms = await Promise.all(roomPromises);
    // Extract hotelIds from rooms
    const hotelIds = reservations.map((room) => (room ? room.hotelId : null));
    // Use Promise.all to wait for all hotel queries to complete
    console.log(hotelIds);
    const hotelPromises = hotelIds.map(async (hotelId) => {
      return hotelId ? await Hotel.findById(hotelId) : null;
    });

    const hotels = await Promise.all(hotelPromises);
    // Combine reservation, room, and hotel information
    const result = reservations.map((item, i) => ({
      reservation: item,
      room: {
        roomIdss: rooms[i] ? rooms[i]._id : null,
        title: rooms[i] ? rooms[i].title : null,
        price: rooms[i] ? rooms[i].price : null,
        photo: rooms[i] ? rooms[i].photo : null,

        maxPeople: rooms[i] ? rooms[i].maxPeople : null,
        roomNumber: rooms[i] ? rooms[i].roomNumbers : null,
      },

      hotel: {
        id: item.hotelId,
        name: hotels[i] ? hotels[i].name : null,
        type: hotels[i] ? hotels[i].type : null,
        city: hotels[i] ? hotels[i].city : null,
        address: hotels[i] ? hotels[i].address : null,
        distance: hotels[i] ? hotels[i].distance : null,
        photos: hotels[i] ? hotels[i].photos : null,
        title: hotels[i] ? hotels[i].title : null,
        desc: hotels[i] ? hotels[i].desc : null,
        rating: hotels[i] ? hotels[i].rating : null,
        cheapestPrice: hotels[i] ? hotels[i].cheapestPrice : null,
        featured: hotels[i] ? hotels[i].featured : null,
      },
    }));

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const getAllReservations = async (req, res, next) => {
  try {
    const reservations = await reservation.find().populate("user");

    const roomIds = reservations.map((item) => item.room);
    const roomPromises = roomIds.map(async (roomId) => {
      return await Room.findOne({ "roomNumbers._id": roomId });
    });
    const rooms = await Promise.all(roomPromises);

    const hotelIds = reservations.map((room) => (room ? room.hotelId : null));
    const hotelPromises = hotelIds.map(async (hotelId) => {
      return hotelId ? await Hotel.findById(hotelId) : null;
    });
    const hotels = await Promise.all(hotelPromises);

    const result = reservations.map((item, i) => ({
      reservation: item,
      user: item.user, // Include user information
      room: {
        roomIdss: rooms[i] ? rooms[i]._id : null,
        title: rooms[i] ? rooms[i].title : null,
        price: rooms[i] ? rooms[i].price : null,
        photo: rooms[i] ? rooms[i].photo : null,
        maxPeople: rooms[i] ? rooms[i].maxPeople : null,
        roomNumber: rooms[i] ? rooms[i].roomNumbers : null,
      },
      hotel: {
        id: item.hotelId,
        name: hotels[i] ? hotels[i].name : null,
        type: hotels[i] ? hotels[i].type : null,
        city: hotels[i] ? hotels[i].city : null,
        address: hotels[i] ? hotels[i].address : null,
        distance: hotels[i] ? hotels[i].distance : null,
        photos: hotels[i] ? hotels[i].photos : null,
        title: hotels[i] ? hotels[i].title : null,
        desc: hotels[i] ? hotels[i].desc : null,
        rating: hotels[i] ? hotels[i].rating : null,
        cheapestPrice: hotels[i] ? hotels[i].cheapestPrice : null,
        featured: hotels[i] ? hotels[i].featured : null,
      },
    }));

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

export const getMyReservation = async (req, res, next) => {
  try {
    const { userId, roomId } = req.body;

    // Get the room information based on the roomId
    const room = await Room.findOne({ "roomNumbers._id": roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Get reservations for the user
    const reservations = await reservation.find({ user: userId });

    // Combine room information with reservations
    const result = reservations.map((reservation) => ({
      reservation,
      room: {
        title: room.title,
        price: room.price,
        photo: room.photo,
        desc: room.desc,
      },
    }));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
