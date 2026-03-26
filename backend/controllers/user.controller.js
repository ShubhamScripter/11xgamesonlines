const jwt = require('jsonwebtoken');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');



// const User = require('../models/user.model');

// const buildHierarchy = async (parentId) => {
//   const children = await User.find({ createdBy: parentId }).lean();

//   // Recursively build their children
//   for (let child of children) {
//     child.downlines = await buildHierarchy(child._id);
//   }

//   return children;
// };

// exports.getMyDownlineTree = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     // const userId = req.user.id;
//     const downlines = await buildHierarchy(userId);
//     res.json({ downlines });
//   } catch (err) {
//     console.error('Error fetching downline:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };
// controllers/userController.js
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');

const LoginLog = require('../models/loginLog.model');
const bcrypt= require('bcrypt')
// const getDownlineTree = async (parentId) => {
//   const children = await User.find({ createdBy: parentId }).lean();

//   for (const child of children) {
//     child.downlines = await getDownlineTree(child._id);
//   }

//   return children;
// };
const getDownlineTree = async (parentId) => {
  const children = await User.find({ parentId }).lean();  // use parentId now

  for (const child of children) {
    child.downlines = await getDownlineTree(child._id);
  }

  return children;
};

exports.getUserDownlines = async (req, res) => {
  const roleHierarchy = {
    admin: 1,
    subadmin: 2,
    seniorSuper: 3,
    superAgent: 4,
    agent: 5,
    user: 6,
  };

  try {
    const { userId } = req.params;
    const requesterRole = req.user.role;

    const user = await User.findById(userId).lean(); // full requester data
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (roleHierarchy[requesterRole] > roleHierarchy[user.role]) {
      return res.status(403).json({ error: 'You cannot access information of higher role' });
    }

    const tree = await getDownlineTree(userId);

    res.json({ ...user, downlines: tree }); // Merge full user data with downlines

  } catch (err) {
    console.error('Error in getUserDownlines:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAccountSummary= async(req,res)=>{
  const roleHierarchy = {
    admin: 1,
    subadmin: 2,
    seniorSuper: 3,
    superAgent: 4,
    agent: 5,
    user: 6,
  };
  try{
    const { userId } = req.params;
    const requesterRole = req.user.role;
    const user =await User.findById(userId)
    if(!user) return res.status(404).json({message: 'User not found'})

    if (roleHierarchy[requesterRole] > roleHierarchy[user.role]) {
      return res.status(403).json({ error: 'You cannot access information of higher role' });
    }
    res.json({user})
  }catch(err){
    console.error('Error in getting Account Summary:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.updateUserPassword = async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;
  const requesterId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Allow only if requester is self, creator, or parent
    const isSelf = user._id.toString() === requesterId;
    const isCreator = user.createdBy?.toString() === requesterId;
    const isParent = user.parentId?.toString() === requesterId;

    if (!isSelf && !isCreator && !isParent) {
      return res.status(403).json({ error: "You are not authorized to change this password" });
    }

    // If requester is not self, we skip password check (force reset)
    if (isSelf) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Update password (auto-hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getUserLoginLogs = async (req, res) => {
  const { userId } = req.params;

  try {
    const logs = await LoginLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100); 

    res.json({ logs });
  } catch (err) {
    console.error("Login log fetch error:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

exports.changeUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { status, password } = req.body;
  const requesterId = req.user.id;

  try {
    // 1. Get the requester (logged-in user)
    const requester = await User.findById(requesterId);
    if (!requester) {
      return res.status(404).json({ error: "Requester not found" });
    }

    // 2. Verify password of the requester
    const isMatch = await bcrypt.compare(password, requester.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // 3. Get the target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: "Target user not found" });
    }

    // 4. Authorization check
    const isSelf = targetUser._id.toString() === requesterId;
    const isCreator = targetUser.createdBy?.toString() === requesterId;
    const isParent = targetUser.parentId?.toString() === requesterId;

    if (!isSelf && !isCreator && !isParent) {
      return res.status(403).json({ error: "Not authorized to change status" });
    }

    // 5. Validate status
    const validStatuses = ['active', 'suspended', 'locked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // 6. Update status
    targetUser.status = status;
    await targetUser.save();

    res.status(200).json({
      message: "User status updated successfully",
      user: {
        _id: targetUser._id,
        username: targetUser.username,
        status: targetUser.status,
      },
    });
  } catch (error) {
    console.log(error)
    console.error("Change status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// controllers/userController.js

exports.addSubadmin = async (req, res) => {
  try {
    const requester = req.user; // logged-in user
    const { username, email, password, timezone, siteTag } = req.body;

    // Only admin can create subadmin
    if (requester.role !== "admin") {
      return res.status(403).json({ error: "Only admin can create subadmins" });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    const newSubadmin = new User({
      username,
      email,
      password, // will be hashed by pre-save hook
      role: "subadmin",
      timezone,
      siteTag,
      createdBy: requester.id,
      creatorRole: requester.role,
      parentId: requester.id,
      parentRole: requester.role,
    });

    await newSubadmin.save();

    res.status(201).json({
      message: "Subadmin created successfully",
      subadmin: {
        id: newSubadmin._id,
        username: newSubadmin.username,
        email: newSubadmin.email,
        role: newSubadmin.role,
        siteTag: newSubadmin.siteTag,
        timezone: newSubadmin.timezone,
      },
    });
  } catch (err) {
    console.error("Error creating subadmin:", err);
    res.status(500).json({ error: "Server error" });
  }
};

//  Downline Subadmin Login Controller
exports.subadminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Check if user exists with role = subadmin
    const subadmin = await User.findOne({ username, role: "subadmin" });
    if (!subadmin) {
      return res.status(404).json({ error: "Subadmin not found" });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, subadmin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 3. Check account status
    if (subadmin.status !== "active") {
      return res.status(403).json({ error: `Account is ${subadmin.status}` });
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: subadmin._id, role: subadmin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Return response
    res.status(200).json({
      message: "Subadmin login successful",
      token,
      subadmin: {
        id: subadmin._id,
        username: subadmin.username,
        email: subadmin.email,
        role: subadmin.role,
        siteTag: subadmin.siteTag,
        timezone: subadmin.timezone,
      },
    });
  } catch (err) {
    console.error("Subadmin login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
// controllers/userController.js

//  Helper: Recursive Downline Subadmin Finder
const getSubadminTree = async (parentId) => {
  // Only fetch users with role=subadmin under the parent
  const children = await User.find({ parentId, role: "subadmin" })
    .select("_id username email role siteTag timezone status createdAt")
    .lean();

  for (const child of children) {
    child.downlines = await getSubadminTree(child._id); // recursive
  }

  return children;
};

//  Controller: View Downline Subadmins
exports.viewDownlineSubadmins = async (req, res) => {
  try {
    const { subadminId } = req.params;

    // 1. Find the root subadmin
    const rootSubadmin = await User.findOne({ _id: subadminId, role: "subadmin" })
      .select("_id username email role siteTag timezone status createdAt")
      .lean();

    if (!rootSubadmin) {
      return res.status(404).json({ error: "Subadmin not found" });
    }

    // 2. Build recursive tree
    const downlines = await getSubadminTree(subadminId);

    // 3. Return result
    res.status(200).json({
      message: "Downline subadmin list fetched successfully",
      subadmin: {
        ...rootSubadmin,
        downlines,
      },
    });
  } catch (err) {
    console.error("Error fetching downline subadmins:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.changeAccountStatus = async (req, res) => {
  const { targetUserId } = req.params;// user/subadmin whose status needs to change
  const { status, password } = req.body;
  const requesterId = req.user.id; // logged-in user ID

  try {
    // 1. Validate status
    const validStatuses = ["active", "suspended", "locked"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // 2. Find requester
    const requester = await User.findById(requesterId);
    if (!requester) {
      return res.status(404).json({ error: "Requester not found" });
    }

    // 3. Verify requester password for security
    const isMatch = await bcrypt.compare(password, requester.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // 4. Find target user/subadmin
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: "Target user not found" });
    }

    // 5. Authorization check (self OR parent OR creator)
    const isSelf = targetUser._id.toString() === requesterId;
    const isCreator = targetUser.createdBy?.toString() === requesterId;
    const isParent = targetUser.parentId?.toString() === requesterId;

    if (!isSelf && !isCreator && !isParent) {
      return res.status(403).json({ error: "Not authorized to change this account status" });
    }

    // 6. Update status
    targetUser.status = status;
    await targetUser.save();

    res.status(200).json({
      message: "Account status updated successfully",
      user: {
        id: targetUser._id,
        username: targetUser.username,
        role: targetUser.role,
        status: targetUser.status,
      },
    });
  } catch (err) {
    console.error("Error changing account status:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// controllers/userController.js

exports.getAccountSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    // 1. Find the target user
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Authorization check (self OR parent OR creator)
    const isSelf = user._id.toString() === requesterId;
    const isCreator = user.createdBy?.toString() === requesterId;
    const isParent = user.parentId?.toString() === requesterId;

    if (!isSelf && !isCreator && !isParent && requesterRole !== "admin") {
      return res.status(403).json({ error: "Not authorized to view this account summary" });
    }

    // 3. Mask password (never return plain hashed password)
    const maskedPassword = "********"; // or show first/last 2 chars of hash if needed

    // 4. Wallet info
    const walletInfo = {
      balance: user.balance,
      availableBalance: user.availableBalance,
      totalBalance: user.totalBalance,
      totalAvailableBalance: user.totalAvailableBalance,
      totalExposure: user.totalExposure,
      totalPlayerBalance: user.totalPlayerBalance,
    };

    // 5. Return account summary
    res.status(200).json({
      message: "Account summary fetched successfully",
      accountSummary: {
        email: user.email,
        password: maskedPassword,
        wallet: walletInfo,
      },
    });
  } catch (err) {
    console.error("Error in getAccountSummary:", err);
    res.status(500).json({ error: "Server error" });
  }
};



exports.editDownlineSubadminPassword = async (req, res) => {
  const { subadminId } = req.params; // target subadmin
  const { newPassword } = req.body;
  const requesterId = req.user.id;
  const requesterRole = req.user.role;

  try {
    // 1. Check if requester is allowed (only admin or subadmin)
    if (!["admin", "subadmin"].includes(requesterRole)) {
      return res.status(403).json({ error: "Only admin or subadmin can reset subadmin password" });
    }

    // 2. Find target subadmin
    const targetSubadmin = await User.findOne({ _id: subadminId, role: "subadmin" });
    if (!targetSubadmin) {
      return res.status(404).json({ error: "Subadmin not found" });
    }

    // 3. Ensure requester is above target in hierarchy (creator or parent)
    const isCreator = targetSubadmin.createdBy?.toString() === requesterId;
    const isParent = targetSubadmin.parentId?.toString() === requesterId;

    if (!isCreator && !isParent && requesterRole !== "admin") {
      return res.status(403).json({ error: "Not authorized to change this subadmin's password" });
    }

    // 4. Update password (will be auto-hashed by pre-save hook)
    targetSubadmin.password = newPassword;
    await targetSubadmin.save();

    res.status(200).json({
      message: "Subadmin password updated successfully",
      subadmin: {
        id: targetSubadmin._id,
        username: targetSubadmin.username,
        email: targetSubadmin.email,
      },
    });
  } catch (err) {
    console.error("Error editing subadmin password:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getActivityLog = async (req, res) => {
  try {
    const { userId } = req.params; // whose logs we want
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    // 1. Find target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Authorization (self OR parent OR creator OR admin)
    const isSelf = targetUser._id.toString() === requesterId;
    const isCreator = targetUser.createdBy?.toString() === requesterId;
    const isParent = targetUser.parentId?.toString() === requesterId;

    if (!isSelf && !isCreator && !isParent && requesterRole !== "admin") {
      return res.status(403).json({ error: "Not authorized to view activity log" });
    }

    // 3. Fetch login logs (latest 50 for example)
    const logs = await LoginLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      message: "Activity log fetched successfully",
      user: {
        id: targetUser._id,
        username: targetUser.username,
        role: targetUser.role,
      },
      logs: logs.map(log => ({
        status: log.status,
        ip: log.ip,
        userAgent: log.userAgent,
        location: log.location,
        time: log.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error fetching activity log:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.depositToSubadmin = async (req, res) => {
  const { subadminId } = req.params;
  const { amount } = req.body;
  const requesterId = req.user.id;

  try {
    // 1. Basic validation
    if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });

    // 2. Check target subadmin
    const subadmin = await User.findOne({ _id: subadminId, role: 'subadmin', parentId: requesterId });
    if (!subadmin) {
      return res.status(403).json({ error: 'Target subadmin not found or not your direct downline' });
    }

    // 3. Update target balance
    subadmin.balance += amount;
    await subadmin.save();

    // 4. Record transaction
    const tx = new Transaction({ from: requesterId, to: subadminId, amount, type: 'deposit' });
    await tx.save();

    res.status(200).json({
      message: 'Deposit successful',
      subadmin: { id: subadmin._id, balance: subadmin.balance },
      transaction: tx
    });
  } catch (err) {
    console.error('Deposit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.withdrawFromSubadmin = async (req, res) => {
  const { subadminId } = req.params;
  const { amount } = req.body;
  const requesterId = req.user.id;

  try {
    // 1. Basic validation
    if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });

    // 2. Check target subadmin
    const subadmin = await User.findOne({ _id: subadminId, role: 'subadmin', parentId: requesterId });
    if (!subadmin) {
      return res.status(403).json({ error: 'Target subadmin not found or not your direct downline' });
    }

    // 3. Check balance
    if (subadmin.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance in subadmin account' });
    }

    // 4. Update target balance
    subadmin.balance -= amount;
    await subadmin.save();

    // 5. Record transaction
    const tx = new Transaction({ from: requesterId, to: subadminId, amount, type: 'withdraw' });
    await tx.save();

    res.status(200).json({
      message: 'Withdraw successful',
      subadmin: { id: subadmin._id, balance: subadmin.balance },
      transaction: tx
    });
  } catch (err) {
    console.error('Withdraw error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.getSubadminTransactions = async (req, res) => {
  const requesterId = req.user.id;

  try {
    // get all subadmins created by this requester
    const subadmins = await User.find({ parentId: requesterId, role: 'subadmin' }).select('_id username');
    const subadminIds = subadmins.map(s => s._id);

    const transactions = await Transaction.find({ to: { $in: subadminIds } })
      .populate('to', 'username')
      .populate('from', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      message: 'Transaction history fetched',
      transactions 
    });
  } catch (err) {
    console.error('Transaction history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};





