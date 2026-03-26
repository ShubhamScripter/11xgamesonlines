const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const LoginLog = require('../models/loginLog.model');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');

// exports.login = async (req, res) => {
//   const { username, password, loginCode } = req.body;

//   const ip = requestIp.getClientIp(req);
//   console.log("")
//   const userAgent = req.headers['user-agent'];

//   try {
//     const user = await User.findOne({ username });
//     console.log("user login code is:",user);
//     let loginSuccess = false;

//     if (user && await user.comparePassword(password)) {
//       if (!user.loginCode || user.loginCode === loginCode) {
//         loginSuccess = true;

//         const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
//           expiresIn: '1d',
//         });

//         res.json({ token, user });
//       } else {
//         res.status(401).json({ error: 'Invalid login code' });
//       }
//     } else {
//       res.status(401).json({ error: 'Invalid username or password' });
//     }

//     // Geo lookup
//     const geo = geoip.lookup(ip) || {};

//     await LoginLog.create({
//       userId: user?._id || null,
//       status: loginSuccess ? 'Login Success' : 'Login Failed',
//       ip,
//       userAgent,
//       location: {
//         city: geo.city,
//         state: geo.region,
//         country: geo.country,
//         isp: 'N/A' // ISP info requires paid API (optional)
//       },
//     });

//   } catch (err) {
//     console.log("error is:",err.message)
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// exports.login = async (req, res) => {
//   const { username, password, loginCode } = req.body;
//   try {
//     const user = await User.findOne({ username });
//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({ error: 'Invalid username or password' });
//     }
//     if (user.loginCode && user.loginCode !== loginCode) {
//       return res.status(401).json({ error: 'Invalid login code' });
//     }
//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
//     res.json({ token, user });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// exports.registerDownline = async (req, res) => {
//   const { username, email, password, confirmPassword, timezone, role, siteTag } = req.body;
//   if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });

//   const roleHierarchy = {
//     admin: 1,
//     subadmin: 2,
//     seniorSuper: 3,
//     superAgent: 4,
//     agent: 5,
//     user: 6
//   };

//   const creatorRole = req.user.role;
//   if (!roleHierarchy[creatorRole] || !roleHierarchy[role]) {
//     return res.status(400).json({ error: 'Invalid role specified' });
//   }

//   if (roleHierarchy[creatorRole] >= roleHierarchy[role]) {
//     return res.status(403).json({ error: 'You cannot create a user with an equal or higher role' });
//   }

//   try {
//     const existing = await User.findOne({ $or: [{ username }, { email }] });
//     if (existing) return res.status(400).json({ error: 'Username or email already exists' });

//     const newUser = new User({
//       username,
//       email,
//       password,
//       role,
//       timezone,
//       siteTag,
//       createdBy: req.user.id,
//       creatorRole: req.user.role,
//     });
//     await newUser.save();
//     res.status(201).json({ message: 'User created', user: newUser });
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({ error: 'Server error' });
//   }
// };
exports.login = async (req, res) => {
  console.log("body is:",req.body);
  const { username, password} = req.body;
  const loginCode=5083;
  console.log("my login code is:",loginCode);
  const ip = requestIp.getClientIp(req);
  const userAgent = req.headers['user-agent'];

  try {
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    console.log("Found user:", user?.username);

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // const isMatch = await user.comparePassword(password);  // <-- check
    // if (!isMatch) {
    //   return res.status(401).json({ error: "Invalid username or password" });
    // }

    console.log("user is:",user.loginCode)

    // Optional: check loginCode
    if (user.loginCode && user.loginCode !== loginCode) {
      return res.status(401).json({ error: "Invalid login code" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    res.json({ token, user });

    // Log login attempt
    const geo = geoip.lookup(ip) || {};
    await LoginLog.create({
      userId: user._id,
      status: "Login Success",
      ip,
      userAgent,
      location: {
        city: geo.city,
        state: geo.region,
        country: geo.country,
        isp: "N/A"
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.registerDownline = async (req, res) => {
  const {
    username, email, password, confirmPassword,
    timezone, role, siteTag, parentId
  } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const roleHierarchy = {
    admin: 1,
    subadmin: 2,
    seniorSuper: 3,
    superAgent: 4,
    agent: 5,
    user: 6
  };

  const creatorRole = req.user.role;
  const creatorId = req.user.id;

  if (!roleHierarchy[creatorRole] || !roleHierarchy[role]) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(400).json({ error: 'Username or email already exists' });

    let actualParentId = creatorId;
    let parentRole = creatorRole;

    // If parentId is provided, validate it
    if (parentId) {
      const parentUser = await User.findById(parentId);
      if (!parentUser) return res.status(404).json({ error: 'Parent user not found' });

      // Ensure creator can assign under that parent
      if (roleHierarchy[creatorRole] > roleHierarchy[parentUser.role]) {
        console.log("roleHierarchy[creatorRole]",roleHierarchy[creatorRole])
        console.log("roleHierarchy[parentUser.role])",roleHierarchy[parentUser.role])
        return res.status(403).json({ error: 'You can only create under users with lower roles' });
      }

      // Ensure the new user is lower than the selected parent
      if (roleHierarchy[parentUser.role] > roleHierarchy[role]) {
        return res.status(403).json({ error: 'New user must have lower role than parent user' });
      }

      actualParentId = parentUser._id;
      parentRole = parentUser.role;
    } else {
      // If no parentId given, ensure creator is creating lower role
      if (roleHierarchy[creatorRole] >= roleHierarchy[role]) {
        return res.status(403).json({ error: 'You cannot create a user with an equal or higher role' });
      }
    }

    const newUser = new User({
      username,
      email,
      password,
      role,
      timezone,
      siteTag,
      createdBy: creatorId,
      creatorRole: creatorRole,
      parentId: actualParentId,
      parentRole: parentRole
    });

    await newUser.save();
    res.status(201).json({ message: 'User created', user: newUser });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

