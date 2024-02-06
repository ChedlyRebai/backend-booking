import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import { createError } from "../utils/error.js";
import reservation from "../models/reservation.js";

export const createRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;
  const newRoom = new Room(req.body);

  try {
    const savedRoom = await newRoom.save();
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $push: { rooms: savedRoom._id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json(savedRoom);
  } catch (err) {
    next(err);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};


export const updateRoomAvailability = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const { userId, checkInDate, checkOutDate } = req.body;
    const room = await Room.findById(roomId);

    if(!room){
      res.status(400).json("Room Not found");
    }

    const requestedDates = getDatesBetween(checkInDate, checkOutDate);
    const isAvailable = requestedDates.every(date =>
      room.roomNumbers.every(roomNumber =>
        roomNumber.unavailableDates.every(unavailableDate =>
          !datesAreEqual(unavailableDate, date)
        )
      )
    );
   
    
    if (!isAvailable) {
      return res.status(400).json("Room is not available for the specified dates.");
    }

    const newReservation = new reservation({
      user: userId,
      room: roomId,
      checkInDate,
      checkOutDate,
      totalPrice: calculateTotalPrice(checkInDate, checkOutDate) // Implement your own logic to calculate total price
    });

    await newReservation.save().then((data)=>{
      console.log(data)
    });

    // Update room's unavailable dates
    const updatedRoom = await Room.findOneAndUpdate(
      { _id: roomId },
      {
        $push: {
          "roomNumbers.$[elem].unavailableDates": { $each: requestedDates }
        }
      },

      {
        arrayFilters: [{ "elem.number": { $exists: true } }]
      }
    ).then((data)=>console.log(data));

    console.log(updateRoom)
    res.status(200).json("Room status has been updated.");
  } catch (err) {
    next(err);
  }
};

export const deleteRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;
  try {
    await Room.findByIdAndDelete(req.params.id);
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $pull: { rooms: req.params.id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json("Room has been deleted.");
  } catch (err) {
    next(err);
  }
};


export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
};

export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};


function getDatesBetween(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);

  while (currentDate <= endDateObj) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}


function calculateTotalPrice(checkInDate, checkOutDate) {
  // Calculate the number of nights between check-in and check-out dates
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const numberOfNights = Math.round(Math.abs((checkOut - checkIn) / oneDay));
  // Replace this with your own pricing logic (e.g., fetching prices from a database)
  const pricePerNight = 100; // Example price per night
  // Calculate the total price
  const totalPrice = numberOfNights * pricePerNight;

  return totalPrice;
}

