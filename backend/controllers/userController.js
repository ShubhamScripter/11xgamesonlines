// import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import SubAdmin from "../models/subAdminModel.js";
import passwordHistory from "../models/passwordHistory.js";
import LoginHistory from "../models/loginHistory.js";
import axios from "axios";
import betModel from "../models/betModel.js";
import crypto from 'crypto';

// Register User 
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveLoginHistory = async (userName, id, status, req) => {
  // console.log("dfghjk");
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      "IP not found";

    // console.log("🔥 Final IP:", ip);

    // ✅ Get geo details
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const { city, region, country_name: country, org: isp } = response.data;

    const now = new Date();
    const formattedDateTime = now
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(",", "");

    await LoginHistory.create({
      userName,
      userId: id,
      status: status === "Success" ? "Login Successful" : "Login Failed",
      dateTime: formattedDateTime,
      ip,
      isp,
      city,
      region,
      country,
    });
  } catch (error) {
    console.error("🚨 Login history error:", error.message);
  }
};

export const loginUser = async (req, res) => {
  console.log("\n🚀🚀🚀 LOGIN USER FUNCTION CALLED 🚀🚀🚀");
  console.log("Request body:", req.body);
  try {
    const { userName, password } = req.body;
    console.log("userName:", userName, "password:", password);

    //  Check if userName and password are provided
    if (!userName || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both username and password." });
    }

    // Find user by userName
    const user = await SubAdmin.findOne({ userName });
    if (!user) {
      await saveLoginHistory(userName, "user not found", "Invalid UserName.", req);
      return res.status(400).json({ message: "User id and password wrong." });
    }
    if (user.status !== "active") {
      return res
        .status(400)
        .json({ message: `Your Account is ${user.status}...` });
    }

    if (user.role !== "user") {
      await saveLoginHistory(userName, user._id, "Login With Admin Id", req);
      return res
        .status(400)
        .json({ message: "This Dashboard is for User Dashboard..." });
    }

    //  Compare password
    console.log("🔍 DEBUG: Comparing passwords");
    console.log("   Plain password received:", password);
    console.log("   Hashed password in DB:", user.password);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("   Password match result:", isMatch);

    if (!isMatch) {
      await saveLoginHistory(userName, user._id, "Invalid Password.", req);
      return res.status(400).json({ message: "Invalid credentials." });
    }

    //Generate a unique session token
    const sessionToken=crypto.randomBytes(32).toString('hex');
    const deviceId=req.headers['user-agent'] || "unknown-device";
    const ipAddress=req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    //SAVE TO DATABASE
    user.sessionToken=sessionToken;
    user.lastLogin=new Date();
    user.lastDevice=deviceId;
    user.lastIP=ipAddress;
    await user.save();








    //  Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role ,
        sessionToken: sessionToken,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // console.log("Generated Token:", token); // ✅ Debugging: Check if token is generated

    //  Set token in HTTP-only cookie
    res.cookie("auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // console.log("Cookie Set:", res.getHeaders()["set-cookie"]); //  Debugging: Check if cookie is set
    await saveLoginHistory(userName, user._id, "Success", req);

    // ✅ Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req; // Get ID from request

    if (!id) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    // ✅ Find sub-admin & exclude sensitive fields
    const user = await SubAdmin.findById(id).select(
      "-password -masterPassword"
    );
    


    if (!user) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }

    const updatedPendingBets = await betModel.find({ userId: id, status: 0 });
    user.exposure = updatedPendingBets.reduce((sum, b) => sum + b.price, 0);

    await user.save()

    res.status(200).json({
      message: "Sub-admin details retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching sub-admin:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

export const changePasswordByUserSelf = async (req, res) => {
  const { id } = req; // Sub-admin ID (admin making the change)
  try {
    const { oldPassword, newPassword } = req.body;
    const subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old Password Wrong !" });
    }
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(newPassword, salt);
    subAdmin.password = newPassword;
    await subAdmin.save();
    await passwordHistory.create({
      userName: subAdmin.userName,
      remark: "Password Changed By Self.",
      userId: id,
    });
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: subAdmin,
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getPasswordHistoryByUserId = async (req, res) => {
  const { id } = req; // Sub-admin ID (admin making the change)
  try {
    // passed in route as /credit-ref-history/:userId
    const { page = 1, limit = 10, searchQuery = "" } = req.query;
    // console.log("userId", id);

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {
      userId: id,
      // userName: { $regex: searchQuery },
    };

    const data = await passwordHistory
      .find(filter)
      .sort({ createdAt: -1 }) // optional: latest first
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await passwordHistory.countDocuments(filter);

    // console.log("total", total);
    // console.log("data", data);

    return res.status(200).json({
      message: "Password History fetched successfully",
      data,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching creditRefHistory:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};
export const getLoginHistory = async (req, res) => {
  try {
    const { userId } = req.params; // passed in route as /credit-ref-history/:userId
    // console.log("userId", userId);
    const data = await LoginHistory.find({ userId }); // optional: latest first
    // console.log("data", data);
    res.status(200).json({
      message: "Login history fetched successfully",
      data,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching login history:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const user_logout = async (req, res) => {
  res.clearCookie("auth", {
    httpOnly: true, // must match the cookie options used when setting
    secure: true, // only if you're using HTTPS
    sameSite: "None", // or 'Lax' or 'Strict', must match
    path: "/", // make sure path is same as when set
  });

  res.status(200).json({ message: "Logout success" });
};
