import SubAdmin from "../../models/subAdminModel.js"; // Ensure SubAdmin model is imported
import crypto from "crypto";
import axios from "axios";
import createToken from "../../config/tokenCreate.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import WithdrawalHistory from "../../models/withdrawalHistoryModel.js";
import DepositHistory from "../../models/depositeHistoryModel.js";
import TransactionHistory from "../../models/transtionHistoryModel.js";
import creditRefHistory from "../../models/creditRefHistory.js";
import passwordHistory from "../../models/passwordHistory.js";
import LoginHistory from "../../models/loginHistory.js";
import betModel from "../../models/betModel.js";
import { v4 as uuidv4 } from 'uuid';
import SecondTransactionHistory from "../../models/transtionHistoryModel2.js";


//Function to extract the ip address from request
const getClientIP=(req)=>{
  const ip=req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
          req.connection?.remoteAddress || 
          req.socket?.remoteAddress || 
          req.connection?.socket?.remoteAddress ||
          "IP not found";

  return ip;

};

const updateAdmin = async (id) => {
  try {
    const admin = await SubAdmin.findById(id);
    if (!admin) {
      throw new Error("Admin not found");
    }

    // Step 1: Get direct downlines for total exposure
    const downlineUsers = await SubAdmin.find({ invite: admin.code });
    const totalExposure = downlineUsers.reduce((sum, user) => sum + (user.exposure || 0), 0);
    const totalBalance = downlineUsers.reduce((sum, user) => sum + (user.balance || 0), 0);

    // Step 2: Use a queue for multi-level traversal
    let queue = [admin.code];
    // let totalBalance = 0;
    let totalAvBalance = 0;

    while (queue.length > 0) {
      const currentCode = queue.shift();

      const downlineUsers = await SubAdmin.find({ invite: currentCode });

      for (const user of downlineUsers) {
        // totalBalance += user.balance || 0;

        totalAvBalance += user.avbalance || 0;



        // // ⬇️ Use balance for agents/admins, avbalance for normal users
        // if (user.role === "user") {
        //   totalAvBalance += user.avbalance || 0;
        // } else {
        //   totalAvBalance += user.balance || 0;
        // }

        // Enqueue next level downlines
        if (user.code) {
          queue.push(user.code);
        }
      }
      // console.log("totalAvBalance", totalAvBalance);
    }

    // console.log("/sub-admin/getuserbyid", totalBalance)
    // Step 3: Save calculated values to admin
    admin.totalBalance = totalBalance;
    admin.agentAvbalance = totalAvBalance;
    admin.exposure = totalExposure;

    await admin.save();

    return {
      success: true,
      message: "Admin updated with downline data",
      admin,
    };
  } catch (error) {
    console.error("updateAdmin error:", error);
    return { success: false, message: error.message };
  }
};
export const createSubAdmin = async (req, res) => {
  try {
    // console.log("req.body", req.body)
    //  Destructure request body
    const {
      id,
      email,
      name,
      userName,
      accountType,
      commission,
      commition=0,
      balance=0,
      exposureLimit=0,
      creditReference=0,
      rollingCommission=0,
      phone=0,
      password,
      partnership=0,
    } = req.body;

    const masterPassword=password;



    // console.log("Creating SubAdmin:", req.body);

    // ✅ Generate a Unique Code for Referral
    const uniqueCode = crypto.randomBytes(4).toString("hex").toUpperCase(); // Example: 9F3A7B2C

    // ✅ Find the admin who is creating the sub-admin
    const admin = await SubAdmin.findById(id);
    const role=admin.role;
    console.log
    console.log("admin",admin);



    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    //Here I have replaced this 
    if(admin.secret===0){
      return res.status(403).json({
        message:"Admin account is not authorized to create users"
      })
    }

    // if (admin.secret === 0) {
    //   return res.status(200).json({ message: "created successfully" });
    // }

    // ✅ Role-based validation for creating sub-admins
    // const roleHierarchy = {
    //   supperadmin: ["admin", "white", "super", "master", "agent", "user"],
    //   admin: ["white", "super", "master", "agent", "user"],
    //   white: ["super", "master", "agent", "user"],
    //   super: ["master", "agent", "user"],
    //   master: ["agent", "user"],
    //   agent: ["user"],
    // };

     const roleHierarchy = {
      superadmin:["admin"],
      admin: ["subadmin"],
      subadmin: ['seniorSuper'],
      seniorSuper: ["superAgent"],
      superAgent: ["agent"],
      agent: ["user"],
    };

    // // ✅ Compare password
    // const isMatch = await bcrypt.compare(masterPassword, admin.password);

    // if (!isMatch) {
    //   return res.status(400).json({ message: "Invalid Master password." });
    // }

    if (!roleHierarchy[role] || !roleHierarchy[role].includes(accountType)) {
      return res.status(403).json({
        message: `${role} can only create ${[roleHierarchy[role]].join(
          ", "
        )} accounts.`,
      });
    }

    // ✅ Balance deduction logic
    // if (['admin', 'subadmin', 'seniorSuper', 'superAgent', 'agent', 'user'].includes(role)) {
    //   if (balance > admin.balance || balance > admin.avbalance || admin.balance < 1) {
    //     return res.status(400).json({ message: "Insufficient balance" });
    //   }
    // }

    // ✅ Check if user already exists (by username or phone)
    const existingSubAdmin = await SubAdmin.findOne({ userName });



    if (existingSubAdmin) {
      return res.status(400).json({ message: `${userName} already exists` });
    }

    //  Check for duplicate email (if provided) - BLOCK creation
    if (email) {
      const existingUserByEmail = await SubAdmin.findOne({ 
        email: email.trim().toLowerCase(), 
        status: { $ne: "delete" } 
      });

      if (existingUserByEmail) {
        return res.status(400).json({ 
          message: "An account with this email address already exists. Please use a different email." 
        });
      }
    }

    // Check for duplicate phone number (if provided) - BLOCK creation
    if (phone) {
      const existingUserByPhone = await SubAdmin.findOne({ 
        phone: phone, 
        status: { $ne: "delete" } 
      });

      if (existingUserByPhone) {
        return res.status(400).json({ 
          message: "An account with this phone number already exists. Please use a different phone number." 
        });
      }
    }



    



    
    const requestedCommission = commission ?? commition ?? 0;
    const numericCommission = Number(requestedCommission);

    if (Number.isNaN(numericCommission) || numericCommission < 0) {
      return res.status(400).json({
        message: "Commission must be a positive number"
      });
    }

    const canSetCommission = role === "agent" && accountType === "user";
    let appliedCommission = 0;

    if (canSetCommission) {
      const agentCommissionCap = Number(admin.commissionPercentage ?? 0);

      // Only block if trying to set commission > 0 without a cap
      if (numericCommission > 0 && agentCommissionCap <= 0) {
        return res.status(400).json({
          message: "Superadmin has not assigned a commission percentage to this agent yet. You can only create users with 0% commission."
        });
      }

      // Check if requested commission exceeds the cap (only if cap is set)
      if (agentCommissionCap > 0 && numericCommission > agentCommissionCap) {
        return res.status(400).json({
          message: `Commission cannot exceed your allowed limit of ${agentCommissionCap}%`
        });
      }

      appliedCommission = numericCommission;
    }

    const profit = balance - creditReference;



    // ✅ Create new sub-admin
    const subAdmin = new SubAdmin({
      name,
      userName,
      account: accountType,
      commission: appliedCommission,
      balance,
      exposureLimit,
      creditReference,
      profitLoss: profit,
      avbalance: balance,
      totalAvbalance: balance,
      rollingCommission,
      code: uniqueCode,
      invite: admin.code, // Assigning the parent admin's referral code
      phone,
      password,
      role: accountType,
      masterPassword,
      partnership,
      email,
    });



    await subAdmin.save();
    await TransactionHistory.create({
      userId: subAdmin._id,
      userName: subAdmin.userName,
      withdrawl: 0,
      deposite: balance,
      amount: balance,
      remark: "Opening Balance",
      from: admin.userName,
      to: subAdmin.userName,
      invite: admin.code,
    });


    const downlineUser = await SubAdmin.find({
      invite: admin.code,
    });

    // Calculate total balance and avbalance
    const totalBalance = downlineUser.reduce((sum, user) => sum + (user.avbalance || 0), 0);
    const adminAvBalance = downlineUser.reduce((sum, user) => sum + (user.balance || 0), 0);
    const adminexplocer = downlineUser.reduce((sum, user) => sum + (user.exposure || 0), 0);
    // const downliProfit = downlineUser.reduce((sum, user) => sum + (user.profitLoss || 0), 0);


    admin.totalBalance = totalBalance
    admin.agentAvbalance = adminAvBalance
    admin.totalAvbalance = admin.balance - balance + adminAvBalance;
    admin.exposure = adminexplocer;
    // admin.profitLoss = downliProfit;
    admin.avbalance -= balance;
    await admin.save();



    // Generate token
    const token = await createToken({
      id: subAdmin._id,
      role: subAdmin.role,
      user: subAdmin,
    });

    return res.status(201).json({
      success: true,
      message: `${accountType} created successfully`,
      token: token,
      user: subAdmin,
    });
  } catch (error) {
    console.error("Create SubAdmin Error:", error);
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors || {})[0];
      return res.status(400).json({
        success: false,
        message: firstError?.message || "Invalid input data",
      });
    }
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
};

//Set Agent Commission by SuperAdmin
export const setAgentCommission=async(req,res)=>{
  try{
    //Check is the user is authenticated and has the role of superadmin
    if(req.role !== "superadmin"){
     return res.status(403).json({
      success:false,
      message:"Access denied only superadmin can set agent commission"
     })
     }

     //Get the agent id from the route params 
     const {agentId}=req.params;
     

     //Find the agent by id in the db 
     const agent=await SubAdmin.findById(agentId);

     if(!agent){
      return res.status(404).json({
        success:false,
        message:"Agent not found"
      })
     }
   

     //Verify the role is agent 
     if(agent.role !== "agent"){
      return res.status(403).json({
        success:false,
        message:"Access denied only agent can set commission"
      })
     }
     
     //Verify the agent is active 
    if(agent.status !=="active"){
      return res.status(403).json({
        success:false,
        message:"Agent is inactive status can't set commission"
      })
    }




     

    

     
     //Set the commission percentage for the agent  by superadmin
     const {commissionPercentage}=req.body;

     //Validate the Commission Percentage
     if(commissionPercentage===undefined || commissionPercentage===null){
      return res.status(400).json({
        success:false,
        message:"Commission Percentage is required"
      })
     }

     //Validate the Commission Percentage is a number and also between 0 and 100
     if(typeof commissionPercentage !=="number" || commissionPercentage<0 || commissionPercentage>100){
      return res.status(400).json({
        success:false,
        message:"Commission Percentage must be number between 0 and 100"
      })
     }

     //Set the commission Percentage for the agent 
     agent.commissionPercentage=commissionPercentage;
      await agent.save();

     return res.status(200).json({
      success:true,
      message:"Commission set successfully",
      data:{
        agentId:agent._id,
        username:agent.userName,
        commissionPercentage:agent.commissionPercentage 
      }
     })

     

   

   




    





    



    


     



    


  }
  catch(error){
    console.error("Set Agent Commission Error:",error);
    return res.status(500).json({message:"Server error",error:error?.message})
  }
}








export const deleteSubAdmin = async (req, res) => {
  const { id, role } = req;
  const { page = 1, limit = 10 } = req.query;
  try {
    const { userId } = req.params; // Sub-admin ID to delete
    // const { role, userId } = req; // Authenticated user's details

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const subAdmin = await SubAdmin.findById(userId);
    if (!subAdmin) {
      return res.status(404).json({ message: "user not found" });
    }

    // await SubAdmin.findByIdAndDelete(userId);

    // ✅ Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (editUser.creditReference > 0 || editUser.avbalance > 0) {
      return res
        .status(400)
        .json({ message: "User has pending balance or credit reference" });
    }

    if (!editUser) {
      return res.status(404).json({ message: "User not found" });
    }

    editUser.status = "delete"; // Admin receives the withdrawn amount
    await editUser.save();

    const filter =
      role === "supperadmin"
        ? { _id: { $ne: id }, role: { $ne: "user" }, status: { $ne: "delete" } }
        : {
          invite: editUser.code,
          role: { $ne: "user" },
          status: { $ne: "delete" },
        };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Sub-admin deleted successfully",
      data: allUsers,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Delete SubAdmin Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const saveLoginHistory = async (userName, id, status, req) => {
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



// export const loginSubAdmin = async (req, res) => {
//   try {
//     console.log("login called");
//     const { userName, password } = req.body;
//     console.log("username",userName);
//     console.log("password:",password);

//     // ✅ Check if userName and password are provided
//     if (!userName || !password) {
//       await saveLoginHistory(
//         "null",
//         "null",
//         "Please provide both username and password",
//         req
//       );
//       return res
//         .status(400)
//         .json({ message: "Please provide both username and password." });
//     }

//     // ✅ Find sub-admin by userName
//     const subAdmin = await SubAdmin.findOne({ userName });
//     const subAdmin2 = await SubAdmin.find({}).lean();
//     console.log(subAdmin2.length)

//     console.log("subadmin is:",subAdmin);

//     if (!subAdmin) {
//       await saveLoginHistory(userName, userName, "UserName Wrong", req);
//       return res.status(400).json({ message: "Sub-admin not found." });
//     }

//     // ✅ Compare password
//     // const isMatch = await bcrypt.compare(password, subAdmin.password);

//     // if (!isMatch) {
//     //   await saveLoginHistory(userName, subAdmin._id, "Password Wrong", req);
//     //   return res.status(400).json({ message: "Password Wrong !" });
//     // }

//     if (subAdmin.status !== "active") {
//       await saveLoginHistory(userName, subAdmin._id, "Account Inactive", req);
//       return res.status(400).json({ message: `Your Account has been ${admin.status} !` });
//     }

//     // Generate unique session token
//     const sessionToken = crypto.randomBytes(32).toString('hex');
//     const deviceId = req.headers['user-agent'] || "unknown-device";
//     const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

//     // ✅ Update user session information
//     subAdmin.sessionToken = sessionToken;
//     subAdmin.lastLogin = new Date();
//     subAdmin.lastDevice = deviceId;
//     subAdmin.lastIP = ipAddress;
//     await subAdmin.save();

//     console.log("sub admin role is:",subAdmin.role);

//     // ✅ Generate JWT Token with session token
//     const token = jwt.sign(
//       {
//         id: subAdmin._id,
//         role: subAdmin.role,
//         sessionToken: sessionToken
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "10d" }
//     );

//     await saveLoginHistory(userName, subAdmin._id, "Success", req);

//     // ✅ Set token in HTTP-only cookie
//     res.cookie("auth", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "Strict",
//       expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//     });

//     // ✅ Return success response
//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       data: subAdmin,
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ message: error.message, error: error.message });
//   }
// };

export const loginSubAdmin = async (req, res) => {
  try {
    console.log("login called");
    const { userName, password } = req.body;
    console.log("username",userName);
    console.log("password:",password);

    //  Check if userName and password are provided
    if (!userName || !password) {
      await saveLoginHistory(
        "null",
        "null",
        "Please provide both username and password",
        req
      );
      return res
        .status(400)
        .json({ message: "Please provide both username and password." });
    }

    //  Find sub-admin by userName
    const subAdmin = await SubAdmin.findOne({ userName });
    const subAdmin2 = await SubAdmin.find({}).lean();
    console.log(subAdmin2.length)

    console.log("subadmin is:",subAdmin);

    if (!subAdmin) {
      await saveLoginHistory(userName, userName, "UserName Wrong", req);
      return res.status(400).json({ message: "Sub-admin not found." });
    }
    //Prevent users with role "user" from logging into admin dashboard
    if(subAdmin.role === "user"){
      await saveLoginHistory(userName, subAdmin._id, "User Role Detected", req);
      return res.status(403).json({ message: "User role detected. Access denied." });
    }


     //TODO PassWord Matching Logic
    //  Compare password 
    const isMatch = await bcrypt.compare(password, subAdmin.password);

    if (!isMatch) {
      await saveLoginHistory(userName, subAdmin._id, "Password Wrong", req);
      return res.status(403).json({ message: "Password Wrong !" });
    }

    if (subAdmin.status !== "active") {
      await saveLoginHistory(userName, subAdmin._id, "Account Inactive", req);
      return res.status(400).json({ message: `Your Account has been ${subAdmin.status} !` });
    }

    // Generate unique session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const deviceId = req.headers['user-agent'] || "unknown-device";
    const ipAddress = req.headers['x-forwarded-for']?.split(",")[0]?.trim() || 
                      req.connection?.remoteAddress || 
                      req.socket?.remoteAddress || 
                      "IP not found";

    // ✅ Check for duplicate IP address (different account using same IP)
    let ipWarning = null;
    if (ipAddress && ipAddress !== "IP not found") {
      const existingUserByIP = await SubAdmin.findOne({
        lastIP: ipAddress,
        _id: { $ne: subAdmin._id }, // Different account
        status: { $ne: "delete" }
      });

      if (existingUserByIP) {
        ipWarning = `Warning: Another account (${existingUserByIP.userName}) has logged in from this IP address (${ipAddress}).`;
      }
    }

    //  Update user session information
    subAdmin.sessionToken = sessionToken;
    subAdmin.lastLogin = new Date();
    subAdmin.lastDevice = deviceId;
    subAdmin.lastIP = ipAddress;
    await subAdmin.save();

    console.log("sub admin role is:",subAdmin.role);

    // Generate JWT Token with session token
    const token = jwt.sign(
      {
        id: subAdmin._id,
        role: subAdmin.role,
        sessionToken: sessionToken
      },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    await saveLoginHistory(userName, subAdmin._id, "Success", req);

    //  Set token in HTTP-only cookie
    res.cookie("auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    //  Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: subAdmin,
      warning: ipWarning || null, // Include warning if duplicate IP detected
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message, error: error.message });
  }
};
export const logout = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.id;

    // Clear session token in database
    await SubAdmin.findByIdAndUpdate(userId, {
      $set: { sessionToken: null }
    });

    // Clear cookie
    res.clearCookie("auth", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({
      success: true,
      message: "Logout success",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

// Step 4: Add force logout endpoint
export const forceLogoutUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify admin permissions
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Clear session token
    await SubAdmin.findByIdAndUpdate(userId, {
      $set: { sessionToken: null }
    });

    res.status(200).json({
      success: true,
      message: "User logged out from all devices"
    });
  } catch (error) {
    console.error("Force logout error:", error);
    res.status(500).json({ message: "Operation failed", error: error.message });
  }
};

// export const getUserCompleteInfo = async (req, res) => {
//   try {
//     const { userId } = req.body; // User ID from URL parameters
    
//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required"
//       });
//     }

//     // Find the user by ID
//     const user = await SubAdmin.findById(userId);
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     // Get parent/upline information
//     const parent = user.invite ? await SubAdmin.findOne({ code: user.invite }) : null;
//     const grandParent = parent && parent.invite ? await SubAdmin.findOne({ code: parent.invite }) : null;

//     // Get direct downlines
//     const directDownlines = await SubAdmin.find({ 
//       invite: user.code, 
//       status: { $ne: "delete" } 
//     });

//     // Calculate downline statistics
//     const downlineStats = {
//       totalDirectDownlines: directDownlines.length,
//       activeDownlines: directDownlines.filter(u => u.status === "active").length,
//       inactiveDownlines: directDownlines.filter(u => u.status === "inactive").length,
//       totalDownlineBalance: directDownlines.reduce((sum, u) => sum + (u.balance || 0), 0),
//       totalDownlineAvBalance: directDownlines.reduce((sum, u) => sum + (u.avbalance || 0), 0),
//       totalDownlineExposure: directDownlines.reduce((sum, u) => sum + (u.exposure || 0), 0),
//     };

//     // Get user's transaction history (last 10)
//     const recentTransactions = await TransactionHistory.find({ userId })
//       .sort({ createdAt: -1 })
//       .limit(10);

//     // Get user's withdrawal history (last 5)
//     const recentWithdrawals = await WithdrawalHistory.find({ 
//       userName: user.userName 
//     })
//       .sort({ createdAt: -1 })
//       .limit(5);

//     // Get user's deposit history (last 5)
//     const recentDeposits = await DepositHistory.find({ 
//       userName: user.userName 
//     })
//       .sort({ createdAt: -1 })
//       .limit(5);

//     // Get credit reference history (last 5)
//     const creditRefHistoryData = await creditRefHistory.find({ userId })
//       .sort({ createdAt: -1 })
//       .limit(5);

//     // Get password change history (last 5)
//     const passwordChangeHistory = await passwordHistory.find({ userId })
//       .sort({ createdAt: -1 })
//       .limit(5);

//     // Get login history (last 10)
//     const loginHistory = await LoginHistory.find({ userId })
//       .sort({ createdAt: -1 })
//       .limit(10);

//     // Get betting history if user is a regular user (last 10)
//     let bettingHistory = [];
//     if (user.role === "user") {
//       bettingHistory = await betModel.find({ userId })
//         .sort({ createdAt: -1 })
//         .limit(10);
//     }

//     // Calculate additional statistics
//     const financialStats = {
//       totalCreditGiven: recentTransactions
//         .filter(t => t.deposite > 0)
//         .reduce((sum, t) => sum + t.deposite, 0),
//       totalCreditTaken: recentTransactions
//         .filter(t => t.withdrawl > 0)
//         .reduce((sum, t) => sum + t.withdrawl, 0),
//       totalBetsPlaced: bettingHistory.length,
//       totalBetAmount: bettingHistory.reduce((sum, bet) => sum + (bet.betAmount || 0), 0),
//     };

//     // Prepare hierarchy information
//     const hierarchyInfo = {
//       level: parent ? (grandParent ? 3 : 2) : 1, // Rough level calculation
//       upline: {
//         immediate: parent ? {
//           id: parent._id,
//           name: parent.name,
//           userName: parent.userName,
//           role: parent.role
//         } : null,
//         second: grandParent ? {
//           id: grandParent._id,
//           name: grandParent.name,
//           userName: grandParent.userName,
//           role: grandParent.role
//         } : null
//       }
//     };

//     // Prepare complete user information
//     const completeUserInfo = {
//       // Basic user information
//       basicInfo: {
//         id: user._id,
//         name: user.name,
//         userName: user.userName,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//         account: user.account,
//         code: user.code,
//         status: user.status,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       },

//       // Financial information
//       financialInfo: {
//         balance: user.balance,
//         avbalance: user.avbalance,
//         totalBalance: user.totalBalance,
//         totalAvbalance: user.totalAvbalance,
//         agentAvbalance: user.agentAvbalance,
//         creditReference: user.creditReference,
//         profitLoss: user.profitLoss,
//         exposure: user.exposure,
//         totalExposure: user.totalExposure,
//         exposureLimit: user.exposureLimit,
//         commition: user.commition,
//         rollingCommission: user.rollingCommission,
//         partnership: user.partnership,
//       },

//       // Settings and permissions
//       settings: {
//         secret: user.secret,
//         gamelock: user.gamelock,
//         remark: user.remark,
//       },

//       // Session information
//       sessionInfo: {
//         sessionToken: user.sessionToken ? "Active" : "Inactive",
//         lastLogin: user.lastLogin,
//         lastDevice: user.lastDevice,
//         lastIP: user.lastIP,
//       },

//       // Hierarchy and relationships
//       hierarchyInfo,

//       // Downline information
//       downlineInfo: {
//         stats: downlineStats,
//         directDownlines: directDownlines.map(d => ({
//           id: d._id,
//           name: d.name,
//           userName: d.userName,
//           role: d.role,
//           balance: d.balance,
//           avbalance: d.avbalance,
//           status: d.status,
//           createdAt: d.createdAt
//         }))
//       },

//       // Transaction histories
//       histories: {
//         recentTransactions,
//         recentWithdrawals,
//         recentDeposits,
//         creditRefHistoryData,
//         passwordChangeHistory,
//         loginHistory,
//         bettingHistory: user.role === "user" ? bettingHistory : null
//       },

//       // Statistical information
//       statistics: {
//         ...financialStats,
//         accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)), // Days
//         totalLogins: loginHistory.length,
//         successfulLogins: loginHistory.filter(l => l.status === "Login Successful").length,
//         failedLogins: loginHistory.filter(l => l.status === "Login Failed").length,
//       }
//     };

//     return res.status(200).json({
//       success: true,
//       message: "User complete information retrieved successfully",
//       data: completeUserInfo
//     });

//   } catch (error) {
//     console.error("Error fetching user complete information:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching user information",
//       error: error.message
//     });
//   }
// };

const getTotalUserDownlineBalance = async (parentCode) => {
  let total = 0;

  // Find all direct downlines
  const downlines = await SubAdmin.find({ invite: parentCode, status: { $ne: "delete" } });


  for (const d of downlines) {
    if (d.role === "user") {
      console.log("users is:",d);
      total += d.balance || 0; // Add balance if role is "user"
    }

    // Recurse for this downline's own downlines
    total += await getTotalUserDownlineBalance(d.code);
  }

  return total;
};


// export const getUserCompleteInfo = async (req, res) => {
//   try {
//     const { userId } = req.body; // User ID from URL parameters
    
//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required"
//       });
//     }

//     // Find the user by ID
//     const user = await SubAdmin.findById(userId);
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     // Get parent/upline information
//     const parent = user.invite ? await SubAdmin.findOne({ code: user.invite }) : null;
//     const grandParent = parent && parent.invite ? await SubAdmin.findOne({ code: parent.invite }) : null;

//     // Get direct downlines
//     const directDownlines = await SubAdmin.find({ 
//       invite: user.code, 
//       status: { $ne: "delete" } 
//     });

// const totalUserDownlineBalance = await getTotalUserDownlineBalance(user.code);


//     // Calculate downline statistics
//     const downlineStats = {
//       totalDirectDownlines: directDownlines.length,
//       activeDownlines: directDownlines.filter(u => u.status === "active").length,
//       inactiveDownlines: directDownlines.filter(u => u.status === "inactive").length,
//       totalDownlineBalance: directDownlines.reduce((sum, u) => sum + (u.balance || 0), 0),
//       totalDownlineAvBalance: directDownlines.reduce((sum, u) => sum + (u.avbalance || 0), 0),
//       totalDownlineExposure: directDownlines.reduce((sum, u) => sum + (u.exposure || 0), 0),
// totalUserDownlineBalance,    };

//     // Get user's transaction history (last 10)
//     const recentTransactions = await TransactionHistory.find({ userId })
//       .sort({ createdAt: -1 })
//       .limit(10);

//     // Get user's withdrawal history (last 5)
//     const recentWithdrawals = await WithdrawalHistory.find({ 
//       userName: user.userName 
//     })
//       .sort({ createdAt: -1 })
//       .limit(5);

//     // Get user's deposit history (last 5)
//     const recentDeposits = await DepositHistory.find({ 
//       userName: user.userName 
//     })
//       .sort({ createdAt: -1 })
//       .limit(5);

//     // Get credit reference history (last 5)
//     const creditRefHistoryData = await creditRefHistory.find({ userId })
//       .sort({ createdAt: -1 })
//       .limit(5);

//     // Get password change history (last 5)
//     const passwordChangeHistory = await passwordHistory.find({ userId })
//       .sort({ createdAt: -1 })
//       .limit(5);

//     // Get login history (last 10)
//     const loginHistory = await LoginHistory.find({ userId })
//       .sort({ createdAt: -1 })
//       .limit(10);

//     // Get betting history if user is a regular user (last 10)
//     let bettingHistory = [];
//     if (user.role === "user") {
//       bettingHistory = await betModel.find({ userId })
//         .sort({ createdAt: -1 })
//         .limit(10);
//     }

//     // Calculate additional statistics
//     const financialStats = {
//       totalCreditGiven: recentTransactions
//         .filter(t => t.deposite > 0)
//         .reduce((sum, t) => sum + t.deposite, 0),
//       totalCreditTaken: recentTransactions
//         .filter(t => t.withdrawl > 0)
//         .reduce((sum, t) => sum + t.withdrawl, 0),
//       totalBetsPlaced: bettingHistory.length,
//       totalBetAmount: bettingHistory.reduce((sum, bet) => sum + (bet.betAmount || 0), 0),
//     };

//     // Prepare hierarchy information
//     const hierarchyInfo = {
//       level: parent ? (grandParent ? 3 : 2) : 1, // Rough level calculation
//       upline: {
//         immediate: parent ? {
//           id: parent._id,
//           name: parent.name,
//           userName: parent.userName,
//           role: parent.role
//         } : null,
//         second: grandParent ? {
//           id: grandParent._id,
//           name: grandParent.name,
//           userName: grandParent.userName,
//           role: grandParent.role
//         } : null
//       }
//     };

//     // Prepare complete user information
//     const completeUserInfo = {
//       // Basic user information
//       basicInfo: {
//         id: user._id,
//         name: user.name,
//         userName: user.userName,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//         account: user.account,
//         code: user.code,
//         status: user.status,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       },

//       // Financial information
//       financialInfo: {
//         balance: user.balance,
//         avbalance: user.avbalance,
//         totalBalance: user.totalBalance,
//         totalAvbalance: user.totalAvbalance,
//         agentAvbalance: user.agentAvbalance,
//         creditReference: user.creditReference,
//         profitLoss: user.profitLoss,
//         exposure: user.exposure,
//         totalExposure: user.totalExposure,
//         exposureLimit: user.exposureLimit,
//         commition: user.commition,
//         rollingCommission: user.rollingCommission,
//         partnership: user.partnership,
//       },

//       // Settings and permissions
//       settings: {
//         secret: user.secret,
//         gamelock: user.gamelock,
//         remark: user.remark,
//       },

//       // Session information
//       sessionInfo: {
//         sessionToken: user.sessionToken ? "Active" : "Inactive",
//         lastLogin: user.lastLogin,
//         lastDevice: user.lastDevice,
//         lastIP: user.lastIP,
//       },

//       // Hierarchy and relationships
//       hierarchyInfo,

//       // Downline information
//       downlineInfo: {
//         stats: downlineStats,
//         directDownlines: directDownlines.map(d => ({
//           id: d._id,
//           name: d.name,
//           userName: d.userName,
//           role: d.role,
//           balance: d.balance,
//           avbalance: d.avbalance,
//           status: d.status,
//           createdAt: d.createdAt
//         })),
//         totalUserDownlineBalance,
//       },

//       // Transaction histories
//       histories: {
//         recentTransactions,
//         recentWithdrawals,
//         recentDeposits,
//         creditRefHistoryData,
//         passwordChangeHistory,
//         loginHistory,
//         bettingHistory: user.role === "user" ? bettingHistory : null
//       },

//       // Statistical information
//       statistics: {
//         ...financialStats,
//         accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)), // Days
//         totalLogins: loginHistory.length,
//         successfulLogins: loginHistory.filter(l => l.status === "Login Successful").length,
//         failedLogins: loginHistory.filter(l => l.status === "Login Failed").length,
//       }
//     };

//     return res.status(200).json({
//       success: true,
//       message: "User complete information retrieved successfully",
//       data: completeUserInfo
//     });

//   } catch (error) {
//     console.error("Error fetching user complete information:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching user information",
//       error: error.message
//     });
//   }
// };


export const getUserCompleteInfo = async (req, res) => {
  try {
    const { userId } = req.body; // User ID from URL parameters
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Find the user by ID
    let user = await SubAdmin.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ UPDATE ADMIN DATA (totalBalance, agentAvbalance, exposure) BEFORE RETURNING
    await updateAdmin(userId);
    
    // ✅ REFETCH USER TO GET UPDATED VALUES
    user = await SubAdmin.findById(userId);

    // Get parent/upline information
    const parent = user.invite ? await SubAdmin.findOne({ code: user.invite }) : null;
    const grandParent = parent && parent.invite ? await SubAdmin.findOne({ code: parent.invite }) : null;

    // Get direct downlines
    const directDownlines = await SubAdmin.find({ 
      invite: user.code, 
      status: { $ne: "delete" } 
    });

    const totalUserDownlineBalance = await getTotalUserDownlineBalance(user.code);

    // Calculate downline statistics
    const downlineStats = {
      totalDirectDownlines: directDownlines.length,
      activeDownlines: directDownlines.filter(u => u.status === "active").length,
      inactiveDownlines: directDownlines.filter(u => u.status === "inactive").length,
      totalDownlineBalance: directDownlines.reduce((sum, u) => sum + (u.balance || 0), 0),
      totalDownlineAvBalance: directDownlines.reduce((sum, u) => sum + (u.avbalance || 0), 0),
      totalDownlineExposure: directDownlines.reduce((sum, u) => sum + (u.exposure || 0), 0),
      totalUserDownlineBalance,
    };

    //  CALCULATE NEW VALUES
    const totalDownlineAvBalanceValue = downlineStats.totalDownlineAvBalance;
    const agentAvbalanceValue = (user.totalAvbalance || 0) + (user.balance || 0);

    // Get user's transaction history (last 10)
    const recentTransactions = await TransactionHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's withdrawal history (last 5)
    const recentWithdrawals = await WithdrawalHistory.find({ 
      userName: user.userName 
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get user's deposit history (last 5)
    const recentDeposits = await DepositHistory.find({ 
      userName: user.userName 
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get credit reference history (last 5)
    const creditRefHistoryData = await creditRefHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get password change history (last 5)
    const passwordChangeHistory = await passwordHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get login history (last 10)
    const loginHistory = await LoginHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get betting history if user is a regular user (last 10)
    let bettingHistory = [];
    if (user.role === "user") {
      bettingHistory = await betModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10);
    }

    // Calculate additional statistics
    const financialStats = {
      totalCreditGiven: recentTransactions
        .filter(t => t.deposite > 0)
        .reduce((sum, t) => sum + t.deposite, 0),
      totalCreditTaken: recentTransactions
        .filter(t => t.withdrawl > 0)
        .reduce((sum, t) => sum + t.withdrawl, 0),
      totalBetsPlaced: bettingHistory.length,
      totalBetAmount: bettingHistory.reduce((sum, bet) => sum + (bet.betAmount || 0), 0),
    };

    // Prepare hierarchy information
    const hierarchyInfo = {
      level: parent ? (grandParent ? 3 : 2) : 1, // Rough level calculation
      upline: {
        immediate: parent ? {
          id: parent._id,
          name: parent.name,
          userName: parent.userName,
          role: parent.role
        } : null,
        second: grandParent ? {
          id: grandParent._id,
          name: grandParent.name,
          userName: grandParent.userName,
          role: grandParent.role
        } : null
      }
    };

    //  PREPARE COMPLETE USER INFORMATION WITH UPDATED VALUES
    const completeUserInfo = {
      // Basic user information
      basicInfo: {
        id: user._id,
        name: user.name,
        userName: user.userName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        account: user.account,
        code: user.code,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },

      //  FINANCIAL INFORMATION WITH UPDATED VALUES
      financialInfo: {
        balance: user.balance,
        avbalance: user.avbalance,
        totalBalance: user.totalBalance, // ✅ Now this will have the updated value from updateAdmin
        //  CHANGED: totalAvbalance now shows totalDownlineAvBalance
        totalAvbalance: totalDownlineAvBalanceValue,
        //  CHANGED: agentAvbalance now shows totalAvbalance + balance
        agentAvbalance: agentAvbalanceValue,
        creditReference: user.creditReference,
        profitLoss: user.profitLoss,
        exposure: user.exposure,
        totalExposure: user.totalExposure,
        exposureLimit: user.exposureLimit,
        commission: user.commission,
        rollingCommission: user.rollingCommission,
        partnership: user.partnership,
      },

      // Settings and permissions
      settings: {
        secret: user.secret,
        gamelock: user.gamelock,
        remark: user.remark,
      },

      // Session information
      sessionInfo: {
        sessionToken: user.sessionToken ? "Active" : "Inactive",
        lastLogin: user.lastLogin,
        lastDevice: user.lastDevice,
        lastIP: user.lastIP,
      },

      // Hierarchy and relationships
      hierarchyInfo,

      // Downline information
      downlineInfo: {
        stats: downlineStats,
        directDownlines: directDownlines.map(d => ({
          id: d._id,
          name: d.name,
          userName: d.userName,
          role: d.role,
          balance: d.balance,
          avbalance: d.avbalance,
          status: d.status,
          createdAt: d.createdAt
        })),
        totalUserDownlineBalance,
      },

      // Transaction histories
      histories: {
        recentTransactions,
        recentWithdrawals,
        recentDeposits,
        creditRefHistoryData,
        passwordChangeHistory,
        loginHistory,
        bettingHistory: user.role === "user" ? bettingHistory : null
      },

      // Statistical information
      statistics: {
        ...financialStats,
        accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)), // Days
        totalLogins: loginHistory.length,
        successfulLogins: loginHistory.filter(l => l.status === "Login Successful").length,
        failedLogins: loginHistory.filter(l => l.status === "Login Failed").length,
      }
    };

    return res.status(200).json({
      success: true,
      message: "User complete information retrieved successfully",
      data: completeUserInfo
    });

  } catch (error) {
    console.error("Error fetching user complete information:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user information",
      error: error.message
    });
  }
};

export const getLoginHistory = async (req, res) => {
  try {
    const { userId } = req.body; // passed in route as /credit-ref-history/:userId
    // console.log("userId", userId);
    const data = await LoginHistory.find({ userId }).sort({ createdAt: -1 }); // optional: latest first
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

//  Helper function to save login history

export const getSubAdmin = async (req, res) => {
  try {
    const { id } = req; // Get ID from request

    if (!id) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    //  Find sub-admin & exclude sensitive fields
    const admin = await SubAdmin.findById(id);

    if (!admin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }

    // console.log("Fetched Sub-Admin:", admin);
    await updateAdmin(id)

    res.status(200).json({
      message: "Sub-admin details retrieved successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Error fetching sub-admin:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params; // passed in route as /credit-ref-history/:userId
    // console.log("userId", userId);
    const data = await SubAdmin.findById(userId); // optional: latest first
    // console.log("data", data);
    res.status(200).json({
      message: "User Profile fetched successfully",
      data,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching User Profile:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// get delete user
export const getDeleteUser = async (req, res) => {
  try {
    const { id, role } = req;
    const { page = 1, limit = 10 } = req.query;

    // console.log("Admin ID:", id);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const filter =
      role === "admin"
        ? {
          _id: { $ne: id },
          // role: { $ne: "user" },
          status: "delete",
        }
        : {
          invite: admin.code,
          // role: { $ne: "user" },
          status: "delete",
        };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      message: "All sub-admin details retrieved successfully",
      data: allUsers,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
// get delete user
export const restoreDeleteUser = async (req, res) => {
  try {
    const { id, role } = req;
    const { page = 1, limit = 10 } = req.query;
    const { userId, masterPassword } = req.params;

    // console.log("Admin ID:", id);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    // ✅ Verify Master Password
    const isMatch = await bcrypt.compare(masterPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Master password." });
    }

    let editUser = await SubAdmin.findById(userId);

    if (!editUser) {
      return res.status(404).json({ message: "User not found" });
    }

    editUser.status = "active"; // Admin receives the withdrawn amount
    await editUser.save();

    const filter =
      role === "admin"
        ? {
          _id: { $ne: id },
          role: { $ne: "user" },
          status: "delete",
        }
        : {
          invite: admin.code,
          role: { $ne: "user" },
          status: "delete",
        };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "User restored successfully",
      data: allUsers,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
// export const getAllUser = async (req, res) => {
//   try {
//     console.log("get all user is called");
//     const { id} = req.body;
//     const { page = 1, limit = 10, searchQuery } = req.query;

//     // console.log("searchQuery:", searchQuery);
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);

//     const admin = await SubAdmin.findById(id);
//     console.log("my admin is:",admin);
//     const role=admin.role;

//     if (!admin) {
//       return res.status(404).json({ message: "Admin not found" });
//     }

//     let filter =
//       role === "supperadmin"
//         ? { _id: { $ne: id }, role: { $ne: "user" }, status: { $ne: "delete" } }
//         : {
//           invite: admin.code,
//           status: { $ne: "delete" },
//         };

//     if (searchQuery) {
//       filter = {
//         ...filter,
//         userName: { $regex: searchQuery, $options: "i" }, // case-insensitive search
//       };
//     }
//     const allUsers = await SubAdmin.find(filter)
//       .limit(limitNum)
//       .skip((pageNum - 1) * limitNum);

//     const totalUsers = await SubAdmin.countDocuments(filter);

//     return res.status(200).json({
//       message: "All sub-admin details retrieved successfully",
//       data: allUsers,
//       totalUsers,
//       totalPages: Math.ceil(totalUsers / limitNum),
//       currentPage: pageNum,
//       selfData:admin
//     });
//   } catch (error) {
//     console.error("Error fetching all users:", error);
//     return res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// };

// export const getAllUser = async (req, res) => {
 
//   try {
  
//     const { id} = req.body;
//     const { page = 1, limit = 10, searchQuery } = req.query;

   
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);

//     const admin = await SubAdmin.findById(id);
//     const totalUserDownlineBalance = await getTotalUserDownlineBalance(admin.code);
//     console.log("my admin is:",admin);
//     const role=admin.role;

    






 




//     if (!admin) {
//       return res.status(404).json({ message: "Admin not found" });
//     }

//     let filter =
//       role === "supperadmin"
//         ? { _id: { $ne: id }, role: { $ne: "user" }, status: { $ne: "delete" } }
//         : {
//           invite: admin.code,
//           status: { $ne: "delete" },
//         };

  
//     if (searchQuery) {
//       filter = {
//         ...filter,
//         userName: { $regex: searchQuery, $options: "i" }, 
//       };
//     }
//     const allUsers = await SubAdmin.find(filter)
//       .limit(limitNum)
//       .skip((pageNum - 1) * limitNum);

//     const totalUsers = await SubAdmin.countDocuments(filter);

   

    
//     return res.status(200).json({
//       message: "All sub-admin details retrieved successfully",
//       data: allUsers,
//       totalUsers,
//       totalPages: Math.ceil(totalUsers / limitNum),
//       currentPage: pageNum,
//       selfData:admin,
//       totalUserDownlineBalance:totalUserDownlineBalance,
    
//     });
//   } catch (error) {
//     console.error("Error fetching all users:", error);
//     return res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// };

// export const getAllUser = async (req, res) => {
//   try {
//     const { id } = req.body;
//     const { page = 1, limit = 10, searchQuery } = req.query;

//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);

//     const admin = await SubAdmin.findById(id);
//     if (!admin) {
//       return res.status(404).json({ message: "Admin not found" });
//     }

//     const totalUserDownlineBalance = await getTotalUserDownlineBalance(admin.code);
//     const role = admin.role;

//     let filter =
//       role === "supperadmin"
//         ? { _id: { $ne: id }, role: { $ne: "user" }, status: { $ne: "delete" } }
//         : {
//             invite: admin.code,
//             status: { $ne: "delete" },
//           };

//     if (searchQuery) {
//       filter = {
//         ...filter,
//         userName: { $regex: searchQuery, $options: "i" },
//       };
//     }

//     // Get paginated users
//     const allUsers = await SubAdmin.find(filter)
//       .limit(limitNum)
//       .skip((pageNum - 1) * limitNum);

//     const totalUsers = await SubAdmin.countDocuments(filter);

//     // ---- NEW PART: Calculate playerbalancee for each user ----

//     // Sab users ke code nikal lo (ye hi unka invite code hota hai downline ke liye)
//     const userCodes = allUsers.map((u) => u.code);

//     // Ab un sab codes ke niche wale "user" role wale log ka balance sum karo
//     const downlineBalances = await SubAdmin.aggregate([
//       {
//         $match: {
//           role: "user",
//           status: { $ne: "delete" },
//           invite: { $in: userCodes }, // in sab ke downline users
//         },
//       },
//       {
//         $group: {
//           _id: "$invite",               // invite == parent ka code
//           totalPlayerBalance: { $sum: "$balance" }, // unka balance ka total
//         },
//       },
//     ]);

//     // Map bana lo: inviteCode -> totalPlayerBalance
//     const balanceMap = downlineBalances.reduce((acc, item) => {
//       acc[item._id] = item.totalPlayerBalance || 0;
//       return acc;
//     }, {});

//     // Har user me playerbalancee field add karo
//     const allUsersWithPlayerBalance = allUsers.map((u) => {
//       const obj = u.toObject ? u.toObject() : u;
//       return {
//         ...obj,
//         playerbalancee: balanceMap[u.code] ?? 0, // agar koi downline user nahi hai to 0
//       };
//     });

//     // -------------------------------------------------------

//     return res.status(200).json({
//       message: "All sub-admin details retrieved successfully",
//       data: allUsersWithPlayerBalance,          // <- yahan updated data bheja
//       totalUsers,
//       totalPages: Math.ceil(totalUsers / limitNum),
//       currentPage: pageNum,
//       selfData: admin,
//       totalUserDownlineBalance: totalUserDownlineBalance,
//     });
//   } catch (error) {
//     console.error("Error fetching all users:", error);
//     return res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// };

// export const getAllUser = async (req, res) => {
//   try {
//     const { id } = req.body;
//     const { page = 1, limit = 10, searchQuery } = req.query;

//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);

//     const admin = await SubAdmin.findById(id);
//     if (!admin) {
//       return res.status(404).json({ message: "Admin not found" });
//     }

//     const totalUserDownlineBalance = await getTotalUserDownlineBalance(admin.code);
//     const role = admin.role;

//     let filter =
//       role === "supperadmin"
//         ? { _id: { $ne: id }, role: { $ne: "user" }, status: { $ne: "delete" } }
//         : {
//             invite: admin.code,
//             status: { $ne: "delete" },
//           };

//     if (searchQuery) {
//       filter = {
//         ...filter,
//         userName: { $regex: searchQuery, $options: "i" },
//       };
//     }

//     // Main list (paginated)
//     const allUsers = await SubAdmin.find(filter)
//       .limit(limitNum)
//       .skip((pageNum - 1) * limitNum);

//     const totalUsers = await SubAdmin.countDocuments(filter);

//     // ================== PLAYER BALANCE LOGIC ==================

//     // Sab users ke codes (inhi codes pe unke downline users ka invite hota hai)
//     const userCodes = allUsers
//       .map((u) => u.code)
//       .filter(Boolean); // null/undefined safety

//     let balanceMap = {};

//     if (userCodes.length > 0) {
//       // Downline "role: user" ka balance sum per parent code
//       const downlineBalances = await SubAdmin.aggregate([
//         {
//           $match: {
//             role: "user",
//             status: { $ne: "delete" },
//             invite: { $in: userCodes },
//           },
//         },
//         {
//           $group: {
//             _id: "$invite", // parent ka code
//             totalPlayerBalance: { $sum: "$balance" },
//           },
//         },
//       ]);

//       balanceMap = downlineBalances.reduce((acc, item) => {
//         acc[item._id] = item.totalPlayerBalance || 0;
//         return acc;
//       }, {});
//     }

//     // Har user me playerbalancee field inject
//     const allUsersWithPlayerBalance = allUsers.map((u) => {
//       const obj = u.toObject ? u.toObject() : u;

//       const downlineTotal = balanceMap[u.code] ?? 0; // niche wale users ka total
//       const selfBalance = u.role === "user" ? (u.balance ?? 0) : 0; // khud ka balance agar user hai

//       return {
//         ...obj,
//         // user: self + downline
//         // agent/subadmin/etc: sirf downline
//         playerbalancee: downlineTotal + selfBalance,
//       };
//     });

//     // ================== RESPONSE ==================

//     return res.status(200).json({
//       message: "All sub-admin details retrieved successfully",
//       data: allUsersWithPlayerBalance,
//       totalUsers,
//       totalPages: Math.ceil(totalUsers / limitNum),
//       currentPage: pageNum,
//       selfData: admin,
//       totalUserDownlineBalance: totalUserDownlineBalance,
//     });
//   } catch (error) {
//     console.error("Error fetching all users:", error);
//     return res
//       .status(500)
//       .json({ error: "Internal server error", details: error.message });
//   }
// };

export const getAllUser = async (req, res) => {
  try {
    const { id } = req.body;
    const { page = 1, limit = 10, searchQuery } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const totalUserDownlineBalance = await getTotalUserDownlineBalance(admin.code);
    const role = admin.role;

    let filter =
      role === "supperadmin"
        ? { _id: { $ne: id }, role: { $ne: "user" }, status: { $ne: "delete" } }
        : {
            invite: admin.code,
            status: { $ne: "delete" },
          };

    if (searchQuery) {
      filter = {
        ...filter,
        userName: { $regex: searchQuery, $options: "i" },
      };
    }

    // Main list (paginated)
    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    // ================== PLAYER BALANCE LOGIC ==================

    // Sirf non-user roles ke codes ka aggregation karna sensible hai,
    // lekin general rakhte hain: jitne bhi list me hain unke codes
    const userCodes = allUsers
      .map((u) => u.code)
      .filter(Boolean);

    let balanceMap = {};

    if (userCodes.length > 0) {
      const downlineBalances = await SubAdmin.aggregate([
        {
          $match: {
            role: "user",
            status: { $ne: "delete" },
            invite: { $in: userCodes },
          },
        },
        {
          $group: {
            _id: "$invite", // parent ka code
            totalPlayerBalance: { $sum: "$balance" }, // downline users ka balance
          },
        },
      ]);

      balanceMap = downlineBalances.reduce((acc, item) => {
        acc[item._id] = item.totalPlayerBalance || 0;
        return acc;
      }, {});
    }

    const allUsersWithPlayerBalance = allUsers.map((u) => {
      const obj = u.toObject ? u.toObject() : u;

      // Agar user hai to sirf uska khud ka balance
      if (u.role === "user") {
        return {
          ...obj,
          playerbalancee: u.balance ?? 0, // yahan se direct model ka balance uthaya
          // agar totalBalance chahiye ho to isko change karke:
          // playerbalancee: u.totalBalance ?? 0
        };
      }

      // Agar user nahi hai (agent/subadmin/superadmin etc.) to downline sum
      const downlineTotal = balanceMap[u.code] ?? 0;

      return {
        ...obj,
        playerbalancee: downlineTotal,
      };
    });

    // ================== RESPONSE ==================

    return res.status(200).json({
      message: "All sub-admin details retrieved successfully",
      data: allUsersWithPlayerBalance,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
      selfData: admin,
      totalUserDownlineBalance: totalUserDownlineBalance,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};






export const getAllOnlyUser = async (req, res) => {
  try {
    const { id, role } = req;
    const { page = 1, limit = 10, searchQuery } = req.query;

    // console.log("searchQuery", searchQuery)

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 🔍 Base filter
    let filter =
      role === "admin"
        ? { _id: { $ne: id }, role: "user", status: { $ne: "delete" } }
        : { invite: admin.code, role: "user", status: { $ne: "delete" } };

    // 🔍 Add search by userName if searchQuery exists
    if (searchQuery && searchQuery !== undefined) {
      // console.log("dfghjkkkkkkkkkkkkkk")
      filter = {
        ...filter,
        userName: { $regex: searchQuery, $options: "i" }, // case-insensitive search
      };
    }



    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      message: "All sub-admin details retrieved successfully",
      data: allUsers,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};


export const getUsersByInvite = async (req, res) => {
  const { refCode } = req.body;
  try {
    const { id } = req; // Extracting admin ID from request

    //  Find the logged-in admin
    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // Fetch users where `invite` matches the admin's `code`
    const usersData = await SubAdmin.find({ invite: refCode, status: { $ne: "delete" } });

    if (!usersData.length) {
      return res
        .status(404)
        .json({ message: "No users found for this invite code." });
    }

    res.status(200).json({
      message: "Users retrieved successfully",
      data: usersData,
    });
  } catch (error) {
    console.error("Error fetching users by invite code:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};


export const getSubAdminuser = async (req, res) => {
  try {
    const { code } = req.body; // Get invite code from request body
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    // console.log("code", code);

    if (!code) {
      return res.status(400).json({ message: "Admin invite code is required" });
    }

    const filter = { invite: code, };

    const subAdmins = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    // console.log("subAdmins", subAdmins);

    // const subAdmins = await SubAdmin.find({ invite: code, role: { $ne: "user" } });

    return res.status(200).json({
      message: `Sub-admin details for level  retrieved successfully`,
      data: subAdmins,
    });
  } catch (error) {
    console.error("Error fetching sub-admin:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

export const updateCreditReference = async (req, res) => {
  try {
    const { id, role } = req; // Sub-admin ID (admin making the change)
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const { userId, formData } = req.body;
    const { creditReference, masterPassword } = formData;
    // console.log("Form Data:", creditReference, masterPassword);

    // ✅ Find the admin making the change
    let subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }

    // ✅ Verify Master Password
    const isMatch = await bcrypt.compare(masterPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Master password." });
    }

    // ✅ Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (!editUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await creditRefHistory.create({
      formName: "uplire",
      userName: editUser.userName,
      oldamount: editUser.creditReference,
      newamount: creditReference,
      remark: "Credit Reference",
      invite: subAdmin.code,
      userId: userId,
    });

    // console.log("creditRef", creditRef);
    // ✅ Update fields
    if (creditReference !== undefined)
      editUser.creditReference = creditReference;

    // ✅ Recalculate profit/loss
    editUser.profitLoss = editUser.balance - (editUser.creditReference || 0);

    // ✅ Save updated user
    await editUser.save();
    const filter =
      role === "admin"
        ? { _id: { $ne: id }, role: { $ne: "user" } }
        : { invite: subAdmin.code, role: "user" };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: `Credit ${creditReference} updated successfully`,
      data: allUsers,
    });
  } catch (error) {
    console.error("Update SubAdmin Error:", error);
    return res
      .status(500)
      .json({ message: error.message, error: error.message });
  }
};
export const updateExploserLimit = async (req, res) => {
  try {
    const { id, role } = req; // Sub-admin ID (admin making the change)
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const { userId, formData } = req.body;
    const { exposureLimit, masterPassword } = formData;
    // console.log("Form Data:", creditReference, masterPassword);

    // ✅ Find the admin making the change
    let subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }

    // ✅ Verify Master Password
    const isMatch = await bcrypt.compare(masterPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Master password." });
    }

    // ✅ Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (!editUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log("creditRef", creditRef);
    // ✅ Update fields
    if (exposureLimit !== undefined)
      editUser.exposureLimit = exposureLimit;

    // ✅ Recalculate profit/loss
    // editUser.profitLoss = editUser.balance - (editUser.creditReference || 0);

    // ✅ Save updated user
    await editUser.save();
    const filter =
      role === "admin"
        ? { _id: { $ne: id }, role: { $ne: "user" } }
        : { invite: subAdmin.code, role: "user" };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: allUsers,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


export const getCreditRefHistoryByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // passed in route as /credit-ref-history/:userId
    const { page = 1, limit = 10, searchQuery = "" } = req.query;
    // console.log("userId", userId);

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {
      userId: userId,
      // userName: { $regex: searchQuery },
    };

    const data = await creditRefHistory
      .find(filter)
      .sort({ createdAt: -1 }) // optional: latest first
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await creditRefHistory.countDocuments(filter);

    // console.log("total", total);
    // console.log("data", data);

    return res.status(200).json({
      message: "Credit Reference History fetched successfully",
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

export const withdrowalAndDeposite = async (req, res) => {
  try {
    const { id, role } = req; // Sub-admin ID (admin making the change)
    
    const { userId, formData, type, page = 1, limit = 10 } = req.body;

    

    // FIX: Normalize type - accept both "withdraw" and "withdrawal"
    // Handle null/undefined cases
    if (!type) {
      return res.status(400).json({ 
        message: "Type is required.",
        received: type 
      });
    }

    let normalizedType = String(type).toLowerCase().trim();
    
    // Map "withdraw" to "withdrawal"
    if (normalizedType === "withdraw") {
      normalizedType = "withdrawal";
    }

    console.log("🔍 Normalized type:", normalizedType);

    if(!["withdrawal","deposite"].includes(normalizedType))
    {
      console.log("❌ Validation failed - normalizedType:", normalizedType);
      return res.status(400).json({ 
        message: "Type is not valid.",
        received: type,
        normalized: normalizedType,
        expected: ["withdrawal", "deposite"]
      });
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    let { balance, masterPassword, remark } = formData;

    // ✅ Convert balance to a number
    balance = parseFloat(balance);

    if (isNaN(balance) || balance <= 0) {
      return res.status(400).json({ message: "Invalid balance amount." });
    }

    // ✅ Find the admin making the change
    let subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }

    // ✅ Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (!editUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Handle Withdrawal (use normalizedType)
    if (normalizedType === "withdrawal") {
      console.log("✅ Withdrawal processing...");
      if (balance > editUser.avbalance || balance > editUser.balance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      editUser.avbalance -= balance;
      editUser.balance -= balance;
      editUser.totalAvbalance -= balance;
      editUser.remark = remark || editUser.remark;

      editUser.profitLoss = editUser.balance - editUser.creditReference;
      subAdmin.balance += balance; // Admin receives the withdrawn amount
      subAdmin.avbalance += balance; // Admin receives the withdrawn amount
      
      await subAdmin.save();
      await editUser.save();
      
      await WithdrawalHistory.create({
        userName: editUser.userName,
        amount: balance,
        remark: remark || "Withdrawal",
        invite: subAdmin.code,
      });

      await TransactionHistory.create({
        userId: userId,
        userName: editUser.userName,
        withdrawl: balance,
        deposite: 0,
        amount: editUser.avbalance,
        from: subAdmin.userName,
        to: editUser.userName,
        remark: remark || "Transaction",
        invite: subAdmin.code,
      });
    }

    // ✅ Handle Deposit (use normalizedType)
    if (normalizedType === "deposite") {
      console.log("✅ Deposit processing...");
      if (balance > subAdmin.avbalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      } else {
        // Normal admin deposits from their own balance
        editUser.balance += balance;
        editUser.avbalance += balance;
        editUser.totalAvbalance += balance;
        editUser.remark = remark || editUser.remark;
        editUser.profitLoss = editUser.balance - editUser.creditReference;
        subAdmin.balance -= balance;
        subAdmin.avbalance -= balance;
      }

      await subAdmin.save();
      await editUser.save();
      
      await DepositHistory.create({
        userName: editUser.userName,
        amount: balance,
        remark: remark || "Deposit",
        invite: subAdmin.code,
      });

      await TransactionHistory.create({
        userId: userId,
        userName: editUser.userName,
        withdrawl: 0,
        deposite: balance,
        amount: editUser.avbalance,
        remark: remark || "Transaction",
        from: subAdmin.userName,
        to: editUser.userName,
        invite: subAdmin.code,
      });
    }

    return res.status(200).json({
      success: true,
      message: `${normalizedType} completed successfully`,
      "parent": subAdmin,
      "child": editUser
    });
  } catch (error) {
    console.error("Update SubAdmin Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
export const userSetting = async (req, res) => {
  try {
    const { id, role } = req; // Sub-admin ID (admin making the change)
    // console.log("Admin ID:", id);

    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    // console.log("req.body", req.body)

    const { masterPassword, status, userId } = req.body;
    // let { masterPassword, } = formData;

    // ✅ Find the admin making the change
    let subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }


    // console.log("masterPassword", masterPassword)

    // ✅ Verify Master Password
    const isMatch = masterPassword===subAdmin.masterPassword;
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Master password." });
    }

    // ✅ Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (!editUser) {
      return res.status(404).json({ message: "User not found" });
    }

    editUser.status = status; // Admin receives the withdrawn amount
    await editUser.save();

    // // ✅ Fetch updated user list
    // const filter =
    //   role === "supperadmin"
    //     ? { _id: { $ne: id } }
    //     : { invite: subAdmin.code, role: "user" };

    // const allUsers = await SubAdmin.find(filter)
    //   .limit(limitNum)
    //   .skip((pageNum - 1) * limitNum);

    // const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: `User ${editUser.userName}'s status ${status} successfully`,
      // totalUsers,
      // data: allUsers,
    });
  } catch (error) {
    console.error("Update SubAdmin Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const changePasswordBySelf = async (req, res) => {

  console.log("self password change cantroller called");
  const { id } = req; // Sub-admin ID (admin making the change)
  // console.log("id", id);
  // console.log("req.body", req.body);
  try {
    const { oldPassword, newPassword } = req.body;
    const subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }
    // const isMatch = await bcrypt.compare(oldPassword, subAdmin.password);
    // if (!isMatch) {
    //   return res.status(400).json({ message: "Old Password Wrong !" });
    // }
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(newPassword, salt);
    subAdmin.password = newPassword;
    await subAdmin.save();
    await passwordHistory.create({
      userName: subAdmin.userName,
      remark: "Password Changed By Self.",
      userId: id,
    });
    return res
      .status(200)
      .json({ message: "Password changed successfully", data: subAdmin });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
export const changePasswordByDownline = async (req, res) => {
  const adminId = req.id; // Sub-admin ID (admin making the change)
  // console.log("id", id);
  // console.log("req.body", req.body);
  try {
    const { oldPassword, newPassword, id } = req.body;
    const Admin = await SubAdmin.findById(adminId);
    const subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-admin not found" });
    }
    // const isMatch = await bcrypt.compare(oldPassword, Admin.password);
    // if (!isMatch) {
    //   return res.status(400).json({ message: "old Password Wrong !" });
    // }
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(newPassword, salt);
    subAdmin.password = newPassword;
    await subAdmin.save();
    await passwordHistory.create({
      userName: subAdmin.userName,
      remark: `Password Changed By ${Admin.userName}`,
      userId: id,
    });
    return res
      .status(200)
      .json({ message: "Password changed successfully", data: subAdmin });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res
      .status(500)
      .json({ message: error.message, error: error.message });
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


export const getAgentTransactionHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10,id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const admin = await SubAdmin.findById(id);
    console.log("admin in transaction is:",admin);
let filter;
    if(admin.role!="user")
    {
      console.log("admin called in if")
filter = {
      $or: [
        { invite: admin.code },
        { userId: id }
      ]
    };
    }
    else
    {
      filter=
      {
        to: admin.userName
      }
    }

    // if (startDate && endDate) {
    //   const start = new Date(startDate);
    //   const end = new Date(endDate);
    //   end.setDate(end.getDate() + 1);
    //   filter.date = { $gte: start, $lte: end };
    // }



    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const transactions = await TransactionHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // console.log("transactions", transactions)

const totalCount = await TransactionHistory.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: transactions,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// export const getAgentTransactionHistory2 = async (req, res) => {
//   try {
//     console.log("histroy 2 called");
//     const { startDate, endDate, page = 1, limit = 10,id="6923123a6d1f88af0a4b68a5" } = req.body;

//     if (!id) {
//       return res.status(400).json({ success: false, message: "User ID is required" });
//     }

//     const admin = await SubAdmin.findById(id);
//     console.log("admin is:",admin);
//     console.log("admin in transaction is:",admin);
// let filter;
//     if(admin.role!="user")
//     {
//       console.log("admin called in if")
// filter = {
//       $or: [
//         { invite: admin.code },
//         { userId: id }
//       ]
//     };
//     }
//     else
//     {
//       filter=
//       {
//         to: admin.userName
//       }
//     }

//     // if (startDate && endDate) {
//     //   const start = new Date(startDate);
//     //   const end = new Date(endDate);
//     //   end.setDate(end.getDate() + 1);
//     //   filter.date = { $gte: start, $lte: end };
//     // }

// console.log("before second transaction")
//     const SecondTransactionHistoryData=await SecondTransactionHistory.find({userId:id});
    
    
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
    
//     const transactions = await TransactionHistory.find(filter)
//     .sort({ createdAt: -1 })
//     .skip((pageNum - 1) * limitNum)
//     .limit(limitNum);
    
//     console.log("after second transaction is: ",[...SecondTransactionHistoryData,...transactions]);
    
//     // console.log("transactions", transactions)

// const totalCount = await TransactionHistory.countDocuments(filter)+SecondTransactionHistoryData.length ;

//     return res.status(200).json({
//       success: true,
//       data: [...transactions,...SecondTransactionHistoryData],
//       totalPages: Math.ceil(totalCount / limitNum),
//     });
//   } catch (error) {
//     console.error("Error fetching transactions:", error);
//     return res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

import CasinoBetHistory from "../../models/casinoBetHistory.model.js"; // Add this import

export const getAgentTransactionHistory2 = async (req, res) => {
  try {
    console.log("history 2 called");
    const { startDate, endDate, page = 1, limit = 10, id = "6923123a6d1f88af0a4b68a5" } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const admin = await SubAdmin.findById(id);
    console.log("admin is:", admin);
    console.log("admin in transaction is:", admin);

    // Build filter for TransactionHistory
    let transactionFilter;
    if (admin.role != "user") {
      console.log("admin called in if");
      transactionFilter = {
        $or: [
          { invite: admin.code },
          { userId: id }
        ]
      };
    } else {
      transactionFilter = {
        to: admin.userName
      };
    }

    // 🎰 Build filter for CasinoBetHistory
    let casinoBetFilter = { userId: id };

    // Apply date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      
      transactionFilter.createdAt = { $gte: start, $lte: end };
      casinoBetFilter.createdAt = { $gte: start, $lte: end };
    }

    console.log("before fetching data");
    
    // Fetch all three data sources
    const SecondTransactionHistoryData = await SecondTransactionHistory.find({ userId: id });
    const casinoBetHistoryData = await CasinoBetHistory.find(casinoBetFilter);
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const transactions = await TransactionHistory.find(transactionFilter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    
    console.log("after fetching data");

    // 🎰 Transform casino bet history to match transaction structure (optional)
    const transformedCasinoBets = casinoBetHistoryData.map(bet => ({
      _id: bet._id,
      userId: bet.userId,
      userName: bet.userName,
      deposite: bet.bet_amount > 0 ? bet.bet_amount : 0,
      withdrawl: bet.win_amount > 0 ? bet.win_amount : 0,
      amount: bet.change,
      remark: `Casino Bet - ${bet.game_uid}`,
      from: "Casino",
      to: bet.userName,
      date: bet.createdAt,
      createdAt: bet.createdAt,
      type: "casino_bet",
      game_uid: bet.game_uid,
      game_round: bet.game_round
    }));

    // Combine all transaction data
    const allTransactions = [
      ...transactions,
      ...SecondTransactionHistoryData,
      ...transformedCasinoBets
    ];

    // Sort combined data by date descending
    allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalCount = 
      await TransactionHistory.countDocuments(transactionFilter) + 
      SecondTransactionHistoryData.length + 
      casinoBetHistoryData.length;

    return res.status(200).json({
      success: true,
      data: allTransactions,
      totalPages: Math.ceil(totalCount / limitNum),
      totalRecords: totalCount,
      breakdown: {
        transactionHistoryCount: transactions.length,
        secondTransactionCount: SecondTransactionHistoryData.length,
        casinoBetHistoryCount: casinoBetHistoryData.length
      }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};
export const getUserTransactionHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const { userId } = req.params;// Adjust this to how your adminAuthMiddleware sets the user ID
    // console.log("userId", userId)

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // const admin = await SubAdmin.findById(id);
    const filter = { userId: userId };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const transactions = await TransactionHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // console.log("transactions", transactions)

    const totalCount = await TransactionHistory.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: transactions,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// export const getAllDownlineBets = async (req, res) => {
//   try {
//     const { id } = req; // Admin ID
//     const { startDate, endDate, page, limit, selectedGame, selectedVoid } = req.query;

//     // console.log("selectedGame, selectedVoid", selectedGame, selectedVoid)

//     const admin = await SubAdmin.findById(id);
//     if (!admin) {
//       return res.status(404).json({ success: false, message: "Admin not found" });
//     }

//     let queue = [admin.code];
//     let userIds = [];

//     while (queue.length > 0) {
//       const currentCode = queue.shift();

//       const downlineUsers = await SubAdmin.find({ invite: currentCode });

//       for (const user of downlineUsers) {
//         if (user.role === "user") {
//           userIds.push(user._id); // Collect user ID for bet query
//         } else {
//           // Add agent/admin code to queue to go deeper
//           queue.push(user.code);
//         }
//       }
//     }

//     const filter = { userId: { $in: userIds } };

//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       end.setDate(end.getDate() + 1);
//       filter.createdAt = { $gte: start, $lte: end };
//     }

//     if (selectedGame) {
//       filter.gameName = selectedGame;
//     }
//     // Filter by selectedVoid if provided
//     if (selectedVoid === "settel") {
//       filter.status = { $ne: 0 }; // Not equal to 0 (settled bets)
//     } else if (selectedVoid === "void") {
//       filter.status = 0; // Voided bets (status = 1)
//     } else if (selectedVoid === "unsettel") {
//       filter.status = 0; // Unsettled bets (status = 0)
//     }


//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);

//     // Fetch bets for all collected users
//     const betData = await betModel.find(filter)
//       .sort({ createdAt: -1 })
//       .skip((pageNum - 1) * limitNum)
//       .limit(limitNum);

//     const totalCount = await betModel.countDocuments(filter);

//     return res.status(200).json({
//       success: true,
//       totalUsers: userIds.length,
//       totalBets: betData.length,
//       data: betData,
//       totalPages: Math.ceil(totalCount / limitNum),
//     });
//   } catch (error) {
//     console.error("Error fetching bets:", error);
//     return res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

export const getAllDownlineBets = async (req, res) => {
  try {
    let { id } = req; // Admin ID

    if(req.body.id)
    {
      id=req.body.id;
    }
    
    const {startDate, endDate, page, limit, selectedGame, selectedVoid } = req.query;

    // console.log("selectedGame, selectedVoid", selectedGame, selectedVoid)

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    let queue = [admin.code];
    let userIds = [];

    if(admin.role=="user")
    {
      userIds.push(admin._id);
    }
    else
    {
      while (queue.length > 0) {
      const currentCode = queue.shift();

      const downlineUsers = await SubAdmin.find({ invite: currentCode });

      for (const user of downlineUsers) {
        if (user.role === "user") {
          userIds.push(user._id); // Collect user ID for bet query
        } else {
          // Add agent/admin code to queue to go deeper
          queue.push(user.code);
        }
      }
    }

    }
    

    

    const filter = { userId: { $in: userIds } };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lte: end };
    }

    if (selectedGame) {
      filter.gameName = selectedGame;
    }
    


    if (selectedVoid === "settel") {
      filter.status = { $ne: 0 }; // Not equal to 0 (settled bets)
    } else if (selectedVoid === "void") {
      filter.status = 0; // Voided bets (status = 1)
    } else if (selectedVoid === "unsettel") {
      filter.status = 0; // Unsettled bets (status = 0)
    }


    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Fetch bets for all collected users
    const betData = await betModel.find(filter)
      .sort({ createdAt: -1 })


      // .skip((pageNum - 1) * limitNum)
      // .limit(limitNum);

    const totalCount = await betModel.countDocuments(filter);

    return res.status(200).json({
      success: true,
      totalUsers: userIds.length,
      totalBets: betData.length,
      data: betData,
      totalPages: Math.ceil(totalCount / limitNum),
    });


  } catch (error) {
    console.error("Error fetching bets:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const parentsDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const beta = await SubAdmin.findById(id);
    if (!beta) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const papa = await SubAdmin.findOne({ code: beta.invite }) || null;
    const dada = papa ? await SubAdmin.findOne({ code: papa.invite }) : null;

    const dataArray = [beta];
    if (papa) dataArray.push(papa);
    if (dada) dataArray.push(dada);

    return res.status(200).json({
      success: true,
      message: "Parent details fetched successfully",
      data: dataArray
    });
  } catch (error) {
    console.error("Error fetching parent details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const updateGameLock = async (req, res) => {
  try {
    const { id } = req.params;
    const { game, lock } = req.body;

    // Validate input
    if (typeof lock !== "boolean" || typeof game !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid input. 'game' must be a string and 'lock' must be boolean."
      });
    }

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const gameIndex = admin.gamelock.findIndex(g => g.game === game);
    if (gameIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Game not found in user's gamelock list"
      });
    }
    admin.gamelock[gameIndex].lock = lock;
    admin.markModified('gamelock');
    await admin.save();

    // User-level update
    if (admin.role === "user") {


      return res.status(200).json({
        success: true,
        message: `Lock status for ${admin.gamelock[gameIndex].game} updated successfully`,
        gamelock: admin.gamelock
      });
    }
    // Agent/Admin hierarchical update
    else {
      let queue = [admin.code];
      while (queue.length > 0) {
        const currentCode = queue.shift();

        // console.log("Processing code:", currentCode);


        const downlineUsers = await SubAdmin.find({ invite: currentCode });

        for (const user of downlineUsers) {
          // totalBalance += user.balance || 0;

          // console.log("useeeeee", user, "lock", lock);


          // User-level update
          const gameIndex = user.gamelock.findIndex(g => g.game === game);
          if (gameIndex === -1) {
            return res.status(404).json({
              success: false,
              message: "Game not found in user's gamelock list"
            });
          }

          user.gamelock[gameIndex].lock = lock;
          user.markModified('gamelock');
          await user.save();

          if (user.code) {
            queue.push(user.code);
          }
        }
        // console.log("totalAvBalance", totalAvBalance);
      }


      return res.status(200).json({
        success: true,
        message: `Game locked successfully`,
        gamelock: admin.gamelock,
        details: {
          game,
          lock,
          // targetUser: id,
          // affectedUsers: downlineIds.length
        }
      });
    }

  } catch (error) {
    console.error("Error updating game lock:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


//  Get all active users
export const getActiveUsers = async (req, res) => {
  try {
    const users = await SubAdmin.find({ status: 'active' }).select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

//  Get all locked users
export const getLockedUsers = async (req, res) => {
  try {
    const users = await SubAdmin.find({ status: 'locked' }).select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Error fetching locked users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// export const getAllUsersIncludingSubAdmins = async (req, res) => {
//   try {
//     console.log("📡 getAllUsersIncludingSubAdmins called");

//     const { page = 1, limit = 10, searchQuery } = req.query;

//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);

//     // Filter base — fetch all users (exclude deleted)
//     let filter = { status: { $ne: "delete" } };

//     // If user searched by username
//     if (searchQuery && searchQuery.trim() !== "") {
//       filter = {
//         ...filter,
//         userName: { $regex: searchQuery, $options: "i" }, // case-insensitive search
//       };
//     }

//     // Fetch paginated results
//     const allUsers = await SubAdmin.find(filter)
//       .sort({ createdAt: -1 }) // newest first
//       .skip((pageNum - 1) * limitNum)
//       .limit(limitNum)
//       .lean();

//     const totalUsers = await SubAdmin.countDocuments(filter);

//     return res.status(200).json({
//       success: true,
//       message: "All users (including subadmins) retrieved successfully",
//       totalUsers,
//       totalPages: Math.ceil(totalUsers / limitNum),
//       currentPage: pageNum,
//       data: allUsers,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching users:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Internal Server Error",
//       details: error.message,
//     });
//   }
// };



// export const getAllUsersIncludingSubAdmins = async (req, res) => {
//   try {
//     console.log("📡 getAllUsersIncludingSubAdmins called");
//     console.log("request id is:",req.id)

//     const { page = 1, limit = 10, searchQuery = "" } = req.query;
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);

//     // ✅ 1. Fetch logged-in user
//     const loggedInUser = await SubAdmin.findById(req.id).lean();
//     console.log("loggedin user is:",loggedInUser);
//     if (!loggedInUser) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // ✅ 2. Recursive helper to fetch all nested downlines
//     const getAllDownlines = async (inviteCode) => {
//       const directDownlines = await SubAdmin.find({ account: inviteCode, status: { $ne: "delete" } }, "_id invite").lean();
//       console.log("direct downlines is:",directDownlines);
//       let allDownlineIds = directDownlines.map((u) => u._id);

//       // recursively find sub-downlines
//       for (const downline of directDownlines) {
//         const subDownlineIds = await getAllDownlines(downline.invite);
//         allDownlineIds = allDownlineIds.concat(subDownlineIds);
//       }

//       return allDownlineIds;
//     };

//     // ✅ 3. If admin → show all users
//     let filter = { status: { $ne: "delete" } };

//     if (loggedInUser.role !== "admin") {
//       const downlineIds = await getAllDownlines(loggedInUser.invite);
//       console.log("all downline id's is:",downlineIds);
//       filter._id = { $in: downlineIds };
//     }

//     // ✅ 4. Search filter
//     if (searchQuery.trim() !== "") {
//       filter.userName = { $regex: searchQuery.trim(), $options: "i" };
//     }

//     // ✅ 5. Fetch paginated users
//     const allUsers = await SubAdmin.find(filter)
//       .sort({ createdAt: -1 })
//       .skip((pageNum - 1) * limitNum)
//       .limit(limitNum)
//       .lean();

//     const totalUsers = await SubAdmin.countDocuments(filter);

//     return res.status(200).json({
//       success: true,
//       message: "All downline users (including all levels) retrieved successfully",
//       totalUsers,
//       totalPages: Math.ceil(totalUsers / limitNum),
//       currentPage: pageNum,
//       data: allUsers,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching users:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       details: error.message,
//     });
//   }
// };

// export const getAllUsersIncludingSubAdmins = async (req, res) => {
//   try {
//     console.log("📡 getAllUsersIncludingSubAdmins called");

//     const { page = 1, limit = 10, searchQuery = "", roleFilter = "", statusFilter = "" } = req.query;
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);

//     // ✅ 1. Fetch logged-in user
//     const loggedInUser = await SubAdmin.findById(req.id).lean();
//     if (!loggedInUser) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }

//     console.log("👤 Logged-in user:", loggedInUser.userName, "Role:", loggedInUser.role);

//     // ✅ 2. Recursive helper to fetch all nested downlines
//     const getAllDownlines = async (inviteCode) => {
//       const directDownlines = await SubAdmin.find({ 
//         invite: inviteCode, 
//         status: { $ne: "delete" } 
//       }, "_id invite code").lean();
      
//       let allDownlineIds = directDownlines.map((u) => u._id);

//       // Recursively find sub-downlines
//       for (const downline of directDownlines) {
//         const subDownlineIds = await getAllDownlines(downline.code);
//         allDownlineIds = allDownlineIds.concat(subDownlineIds);
//       }

//       return allDownlineIds;
//     };

//     // ✅ 3. Build base filter based on user role
//     let filter = { status: { $ne: "delete" } };

//     // If not admin, only show downlines
//     if (loggedInUser.role !== "admin") {
//       const downlineIds = await getAllDownlines(loggedInUser.code);
//       // Include self in the results
//       downlineIds.push(loggedInUser._id);
//       filter._id = { $in: downlineIds };
//     }

//     // ✅ 4. Apply search filter
//     if (searchQuery && searchQuery.trim() !== "") {
//       filter.$or = [
//         { userName: { $regex: searchQuery.trim(), $options: "i" } },
//         { name: { $regex: searchQuery.trim(), $options: "i" } },
//         { phone: { $regex: searchQuery.trim(), $options: "i" } }
//       ];
//     }

//     // ✅ 5. Apply role filter
//     if (roleFilter && roleFilter.trim() !== "") {
//       filter.role = roleFilter.trim();
//     }

//     // ✅ 6. Apply status filter
//     if (statusFilter && statusFilter.trim() !== "") {
//       filter.status = statusFilter.trim();
//     }

//     console.log("🔍 Final filter:", JSON.stringify(filter, null, 2));

//     // ✅ 7. Fetch paginated users with selected fields
//     const allUsers = await SubAdmin.find(filter)
//       .select('-password -masterPassword -sessionToken') // Exclude sensitive fields
//       .sort({ createdAt: -1 })
//       .skip((pageNum - 1) * limitNum)
//       .limit(limitNum)
//       .lean();

//     // ✅ 8. Get total count for pagination
//     const totalUsers = await SubAdmin.countDocuments(filter);

//     // ✅ 9. Helper function to get upline information
//     const getUplineInfo = async (inviteCode) => {
//       if (!inviteCode) return null;
      
//       const upline = await SubAdmin.findOne({ code: inviteCode })
//         .select('userName name role')
//         .lean();
      
//       return upline ? {
//         userName: upline.userName,
//         name: upline.name,
//         role: upline.role
//       } : null;
//     };

//     // ✅ 10. Enhance users with upline information
//     const enhancedUsers = await Promise.all(
//       allUsers.map(async (user) => {
//         const upline = await getUplineInfo(user.invite);
        
//         // Calculate additional stats for non-user roles
//         let downlineStats = {};
//         if (user.role !== "user") {
//           const directDownlinesCount = await SubAdmin.countDocuments({ 
//             invite: user.code, 
//             status: { $ne: "delete" } 
//           });
          
//           downlineStats = {
//             directDownlinesCount,
//             totalDownlineBalance: user.totalBalance || 0,
//             totalDownlineAvBalance: user.agentAvbalance || 0
//           };
//         }

//         return {
//           ...user,
//           upline,
//           downlineStats: user.role !== "user" ? downlineStats : null,
//           // Format financial data
//           financialSummary: {
//             balance: user.balance || 0,
//             avbalance: user.avbalance || 0,
//             creditReference: user.creditReference || 0,
//             profitLoss: user.profitLoss || 0,
//             exposure: user.exposure || 0
//           }
//         };
//       })
//     );

//     // ✅ 11. Calculate summary statistics
//     const summaryStats = {
//       totalUsers,
//       byRole: {
//         admin: await SubAdmin.countDocuments({ ...filter, role: 'admin' }),
//         subadmin: await SubAdmin.countDocuments({ ...filter, role: 'subadmin' }),
//         seniorSuper: await SubAdmin.countDocuments({ ...filter, role: 'seniorSuper' }),
//         superAgent: await SubAdmin.countDocuments({ ...filter, role: 'superAgent' }),
//         agent: await SubAdmin.countDocuments({ ...filter, role: 'agent' }),
//         user: await SubAdmin.countDocuments({ ...filter, role: 'user' })
//       },
//       byStatus: {
//         active: await SubAdmin.countDocuments({ ...filter, status: 'active' }),
//         locked: await SubAdmin.countDocuments({ ...filter, status: 'locked' }),
//         suspended: await SubAdmin.countDocuments({ ...filter, status: 'suspended' }),
//         cheater: await SubAdmin.countDocuments({ ...filter, status: 'cheater' })
//       },
//       totalBalance: enhancedUsers.reduce((sum, user) => sum + (user.balance || 0), 0),
//       totalAvBalance: enhancedUsers.reduce((sum, user) => sum + (user.avbalance || 0), 0)
//     };

//     return res.status(200).json({
//       success: true,
//       message: "All users and sub-admins retrieved successfully",
//       summary: summaryStats,
//       pagination: {
//         totalUsers,
//         totalPages: Math.ceil(totalUsers / limitNum),
//         currentPage: pageNum,
//         hasNext: pageNum < Math.ceil(totalUsers / limitNum),
//         hasPrev: pageNum > 1
//       },
//       data: enhancedUsers,
//       loggedInUser: {
//         userName: loggedInUser.userName,
//         role: loggedInUser.role,
//         code: loggedInUser.code
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error in getAllUsersIncludingSubAdmins:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       details: error.message,
//     });
//   }
// };

export const getAllUsersIncludingSubAdmins = async (req, res) => {
  try {
    console.log("📡 getAllUsersIncludingSubAdmins called - Only Downlines");

    const { page = 1, limit = 10, searchQuery = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // ✅ 1. Fetch logged-in user
    const loggedInUser = await SubAdmin.findById(req.id).lean();
    if (!loggedInUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log("👤 Logged-in user:", loggedInUser.userName, "Role:", loggedInUser.role, "Code:", loggedInUser.code);

    // ✅ 2. Recursive helper to fetch ALL nested downlines
    const getAllDownlines = async (inviteCode) => {
      const directDownlines = await SubAdmin.find({ 
        invite: inviteCode, 
        status: { $ne: "delete" } 
      }).select("_id code").lean();
      
      let allDownlineIds = [...directDownlines.map((u) => u._id)];

      // Recursively find ALL sub-downlines
      for (const downline of directDownlines) {
        const subDownlineIds = await getAllDownlines(downline.code);
        allDownlineIds = [...allDownlineIds, ...subDownlineIds];
      }

      return allDownlineIds;
    };

    // ✅ 3. Sirf logged-in user ke PURE downlines (self include nahi)
    const downlineIds = await getAllDownlines(loggedInUser.code);
    
    console.log(`📊 Total downlines found: ${downlineIds.length} for user: ${loggedInUser.userName}`);

    if (downlineIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No downline users found",
        data: [],
        pagination: {
          totalUsers: 0,
          totalPages: 0,
          currentPage: pageNum,
          hasNext: false,
          hasPrev: false
        },
        loggedInUser: {
          userName: loggedInUser.userName,
          role: loggedInUser.role,
          code: loggedInUser.code
        }
      });
    }

    // ✅ 4. Build filter - sirf downlines ke liye
    let filter = { 
      _id: { $in: downlineIds }
    };

    // ✅ 5. Apply search filter if provided
    if (searchQuery && searchQuery.trim() !== "") {
      filter.$or = [
        { userName: { $regex: searchQuery.trim(), $options: "i" } },
        { name: { $regex: searchQuery.trim(), $options: "i" } }
      ];
    }

    // ✅ 6. Fetch paginated downline users
    const downlineUsers = await SubAdmin.find(filter)
      .select('-password -masterPassword -sessionToken')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // ✅ 7. Get total count
    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: `All downline users retrieved successfully`,
      data: downlineUsers,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limitNum),
        currentPage: pageNum,
        hasNext: pageNum < Math.ceil(totalUsers / limitNum),
        hasPrev: pageNum > 1
      },
      loggedInUser: {
        userName: loggedInUser.userName,
        role: loggedInUser.role,
        code: loggedInUser.code,
        totalDownlines: downlineIds.length
      }
    });

  } catch (error) {
    console.error("❌ Error in getAllUsersIncludingSubAdmins:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};
export const getUsersByProfitLoss = async (req, res) => {
  try {
    const { page = 1, limit = 10, searchQuery = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
     const loggedInUser = await SubAdmin.findById(req.id).lean();
    if (!loggedInUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log("👤 Logged-in user:", loggedInUser.userName, "Role:", loggedInUser.role, "Code:", loggedInUser.code);

    // ✅ 2. Recursive helper to fetch ALL nested downlines
    const getAllDownlines = async (inviteCode) => {
      const directDownlines = await SubAdmin.find({ 
        invite: inviteCode, 
        status: { $ne: "delete" } 
      }).select("_id code").lean();
      
      let allDownlineIds = [...directDownlines.map((u) => u._id)];

      // Recursively find ALL sub-downlines
      for (const downline of directDownlines) {
        const subDownlineIds = await getAllDownlines(downline.code);
        allDownlineIds = [...allDownlineIds, ...subDownlineIds];
      }

      return allDownlineIds;
    };

    // ✅ 3. Sirf logged-in user ke PURE downlines (self include nahi)
    const downlineIds = await getAllDownlines(loggedInUser.code);
    
    console.log(`📊 Total downlines found: ${downlineIds.length} for user: ${loggedInUser.userName}`);

    if (downlineIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No downline users found",
        data: [],
        pagination: {
          totalUsers: 0,
          totalPages: 0,
          currentPage: pageNum,
          hasNext: false,
          hasPrev: false
        },
        loggedInUser: {
          userName: loggedInUser.userName,
          role: loggedInUser.role,
          code: loggedInUser.code
        }
      });
    }

    // ✅ 4. Build filter - sirf downlines ke liye
    let filter = { 
      _id: { $in: downlineIds },
      role: "user",
      status: { $ne: "delete" }
    };



    // Add search filter if provided
    if (searchQuery && searchQuery.trim() !== "") {
      filter.$or = [
        { userName: { $regex: searchQuery.trim(), $options: "i" } },
        { name: { $regex: searchQuery.trim(), $options: "i" } }
      ];
    }

    // Fetch users sorted by profitLoss in descending order
    const users = await SubAdmin.find(filter)
      .select('-password -masterPassword -sessionToken')
      .sort({ profitLoss: -1 }) // -1 for descending order
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalUsers = await SubAdmin.countDocuments(filter);

    // Calculate statistics
    const totalProfitLoss = users.reduce((sum, user) => sum + (user.profitLoss || 0), 0);
    const averageProfitLoss = totalUsers > 0 ? totalProfitLoss / totalUsers : 0;

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully by profit loss (descending)",
      data: users,
      statistics: {
        totalUsers,
        totalProfitLoss,
        averageProfitLoss,
        highestProfitLoss: users.length > 0 ? users[0].profitLoss : 0,
        lowestProfitLoss: users.length > 0 ? users[users.length - 1].profitLoss : 0
      },
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limitNum),
        currentPage: pageNum,
        hasNext: pageNum < Math.ceil(totalUsers / limitNum),
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error("❌ Error fetching users by profit loss:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};

export const getUsersByTotalExposure = async (req, res) => {
  try {
    const { page = 1, limit = 10, searchQuery = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

     const loggedInUser = await SubAdmin.findById(req.id).lean();
    if (!loggedInUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log("👤 Logged-in user:", loggedInUser.userName, "Role:", loggedInUser.role, "Code:", loggedInUser.code);

    // ✅ 2. Recursive helper to fetch ALL nested downlines
    const getAllDownlines = async (inviteCode) => {
      const directDownlines = await SubAdmin.find({ 
        invite: inviteCode, 
        status: { $ne: "delete" } 
      }).select("_id code").lean();
      
      let allDownlineIds = [...directDownlines.map((u) => u._id)];

      // Recursively find ALL sub-downlines
      for (const downline of directDownlines) {
        const subDownlineIds = await getAllDownlines(downline.code);
        allDownlineIds = [...allDownlineIds, ...subDownlineIds];
      }

      return allDownlineIds;
    };

    // ✅ 3. Sirf logged-in user ke PURE downlines (self include nahi)
    const downlineIds = await getAllDownlines(loggedInUser.code);
    
    console.log(`📊 Total downlines found: ${downlineIds.length} for user: ${loggedInUser.userName}`);

    if (downlineIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No downline users found",
        data: [],
        pagination: {
          totalUsers: 0,
          totalPages: 0,
          currentPage: pageNum,
          hasNext: false,
          hasPrev: false
        },
        loggedInUser: {
          userName: loggedInUser.userName,
          role: loggedInUser.role,
          code: loggedInUser.code
        }
      });
    }

    // ✅ 4. Build filter - sirf downlines ke liye
    let filter = { 
      _id: { $in: downlineIds },
      role: "user",
      status: { $ne: "delete" }
    };


    // // Build filter - only users with role "user"
    // let filter = { 
    //   role: "user",
    //   status: { $ne: "delete" }
    // };

    // Add search filter if provided
    if (searchQuery && searchQuery.trim() !== "") {
      filter.$or = [
        { userName: { $regex: searchQuery.trim(), $options: "i" } },
        { name: { $regex: searchQuery.trim(), $options: "i" } }
      ];
    }

    // Fetch users sorted by totalExposure in descending order
    const users = await SubAdmin.find(filter)
      .select('-password -masterPassword -sessionToken')
      .sort({ totalExposure: -1 }) // -1 for descending order
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalUsers = await SubAdmin.countDocuments(filter);

    // Calculate statistics
    const totalExposure = users.reduce((sum, user) => sum + (user.totalExposure || 0), 0);
    const averageExposure = totalUsers > 0 ? totalExposure / totalUsers : 0;

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully by total exposure (descending)",
      data: users,
      statistics: {
        totalUsers,
        totalExposure,
        averageExposure,
        highestExposure: users.length > 0 ? users[0].totalExposure : 0,
        lowestExposure: users.length > 0 ? users[users.length - 1].totalExposure : 0
      },
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limitNum),
        currentPage: pageNum,
        hasNext: pageNum < Math.ceil(totalUsers / limitNum),
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error("❌ Error fetching users by total exposure:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};



export const updateUserStatus = async (req, res) => {
  try {
    const { status,id } = req.body; // new status from request body

    const validStatuses = ["active", "locked", "suspended"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const user = await SubAdmin.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User status updated successfully to '${status}'`,
      data: user,
    });
  } catch (error) {
    console.error("❌ Error updating user status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};


export const getAllUsersWithUpperline = async (req, res) => {
  try {
    console.log("📡 getAllUsersWithUpperline called");

    // 1️⃣ Fetch all users (non-deleted)
    const allUsers = await SubAdmin.find({ role: "user"  })
      .select("_id userName role invite code")
      .lean();

    // 2️⃣ Helper function to build upperline chain
    const getUpperlineChain = async (inviteCode) => {
      const chain = [];
      let currentInvite = inviteCode;

      while (currentInvite) {
        const parent = await SubAdmin.findOne({ code: currentInvite })
          .select("_id userName role invite code")
          .lean();

        if (!parent) break; // top-level reached

        chain.push(parent);
        currentInvite = parent.invite; // move to next upperline
      }

      return chain;
    };

    // 3️⃣ Attach upperline for each user
    const usersWithUpperline = await Promise.all(
      allUsers.map(async (user) => {
        const upperline = await getUpperlineChain(user.invite);
        return { ...user, upperline };
      })
    );

    return res.status(200).json({
      success: true,
      message: "All users with upperline hierarchy fetched successfully",
      data: usersWithUpperline,
      totalUsers: usersWithUpperline.length,
    });
  } catch (error) {
    console.error("❌ Error fetching users with upperline:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};

export const getLockedUsersWithUpperline = async (req, res) => {
  try {
    console.log("📡 getLockedUsersWithUpperline called");

    const { page = 1, limit = 10, searchQuery = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    console.log("search query is:",searchQuery);

    // 1️⃣ Base filter: Only locked users
    let filter= { status: "locked" };

    // 2️⃣ Add search filter (case-insensitive)
    if (searchQuery.trim() !== "") {
      filter.userName = { $regex: searchQuery, $options: "i" };
    }

    // 3️⃣ Count total locked users matching filter
    const totalUsers = await SubAdmin.countDocuments(filter);

    // 4️⃣ Fetch locked users (paginated)
    const lockedUsers = await SubAdmin.find(filter)
      .select("_id userName role invite code status")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // 5️⃣ Helper function to get full upperline chain
    const getUpperlineChain = async (inviteCode) => {
      const chain = [];
      let currentInvite = inviteCode;

      while (currentInvite) {
        const parent = await SubAdmin.findOne({ code: currentInvite })
          .select("_id userName role invite code")
          .lean();

        if (!parent) break;

        chain.push(parent);
        currentInvite = parent.invite;
      }

      return chain;
    };

    // 6️⃣ Attach upperline hierarchy to each locked user
    const usersWithUpperline = await Promise.all(
      lockedUsers.map(async (user) => {
        const upperline = await getUpperlineChain(user.invite);
        return { ...user, upperline };
      })
    );

    // 7️⃣ Final response
    return res.status(200).json({
      success: true,
      message: "Locked users with upperline hierarchy fetched successfully",
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
      data: usersWithUpperline,
    });
  } catch (error) {
    console.error("❌ Error fetching locked users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      details: error.message,
    });
  }
};


export const getDuplicateIPUsers = async (req, res) => {
  try {
    const { id, role } = req;
    
  
    const allowedRoles = ["superadmin", "admin","subadmin", "seniorSuper"];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied - You don't have permission to view this data" 
      });
    }

    // Fetch all end users
    const allEndUsers = await SubAdmin.find({
      role: "user",
      status: { $ne: "delete" }
    }).select("userName lastIP _id role lastLogin createdAt");

    // Build IP map
    const ipMap = new Map();
    
    for (const user of allEndUsers) {
      if (user.lastIP && user.lastIP !== "IP not found") {
        const userIPs = user.lastIP.split(',').map(ip => ip.trim()).filter(ip => ip);
        
        for (const ip of userIPs) {
          if (!ipMap.has(ip)) {
            ipMap.set(ip, []);
          }
          if (!ipMap.get(ip).some(u => u._id.toString() === user._id.toString())) {
            ipMap.get(ip).push({
              _id: user._id,
              userName: user.userName,
              role: user.role,
              lastLogin: user.lastLogin,
              createdAt: user.createdAt,
              fullIP: user.lastIP
            });
          }
        }
      }
    }

 
    const duplicateIPs = [];
    for (const [ip, users] of ipMap.entries()) {
      if (users.length > 1) {
        duplicateIPs.push({
          ip,
          users,
          count: users.length
        });
      }
    }

  
    duplicateIPs.sort((a, b) => b.count - a.count);

    return res.status(200).json({
      success: true,
      data: duplicateIPs,
      totalDuplicateIPs: duplicateIPs.length,
      totalAffectedUsers: duplicateIPs.reduce((sum, item) => sum + item.count, 0)
    });

  } catch (error) {
    console.error("Error fetching duplicate IPs:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};