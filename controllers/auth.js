import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

import multer from "multer";

let filename = "";

const mystorage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, redirect) => {
    let date = Date.now();
    let f1 = date + "." + file.mimetype.split("/")[1];
    redirect(null, f1);
    filename = f1;
  },
});

const upload = multer({ storage: mystorage });

export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();
    await sendWelcomeEmail(req.body.email);

    res.status(200).send("User has been created.");
  } catch (err) {
    next(err);
  }
};
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(createError(404, "User not found!"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong password or username!"));

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
    );

    const { password, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ details: { ...otherDetails }, isAdmin });
  } catch (err) {
    next(err);
  }
};

const sendWelcomeEmail = async (email) => {
  try {
    // Create a nodemailer transporter
    const transport = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: "chedly.rebai123@gmail.com",
        pass: "nalg bvnz wqpl bnui",
      },
    });

    // Define email options with the provided HTML content
    const mailOptions = {
      from: "chedly.rebai123@gmail.com",
      to: email,
      subject: "Welcome to Your App",
      text: "Thank you for registering with Your App. We look forward to having you on board!",
      html: `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Our Reservation Service</title>
        <style>
          /* Add any additional styling here */
        </style>
      </head>
      <body style="font-family: 'Arial', sans-serif;">

        <div style="text-align: center; padding: 20px; background-color: #f5f5f5;">
          <h2 style="color: #333;">Welcome to Our Reservation Service!</h2>
          <p style="color: #555; font-size: 16px;">We are excited to have you join us. Your journey with our reservation service starts now!</p>

          <div style="margin: 20px;">
            <p style="color: #777; font-size: 14px;">What can you do with our reservation service?</p>
            <ul style="list-style-type: none; padding: 0; margin: 0;">
              <li>&#8226; Make reservations for your favorite places.</li>
              <li>&#8226; View and manage your upcoming reservations.</li>
              <li>&#8226; Explore new places and plan your visits.</li>
            </ul>
          </div>

          <a href="https://yourreservationwebsite.com" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;">Get Started Now</a>

          <p style="color: #888; font-size: 14px; margin-top: 20px;">If you have any questions or need assistance, feel free to contact us at support@yourreservationwebsite.com</p>
        </div>

        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">Thank you for choosing our reservation service!</p>
      </body>
      </html>
    `,
    };

    // Send the email
    await transport.sendMail(mailOptions);

    console.log(`Welcome email sent to: ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};
