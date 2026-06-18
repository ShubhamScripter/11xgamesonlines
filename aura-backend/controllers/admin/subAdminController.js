import axios from 'axios';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import createToken from '../../config/tokenCreate.js';
import betHistoryModel from '../../models/betHistoryModel.js';
import betModel from '../../models/betModel.js';
import creditRefHistory from '../../models/creditRefHistory.js';
import DepositHistory from '../../models/depositeHistoryModel.js';
import LoginHistory from '../../models/loginHistory.js';
import passwordHistory from '../../models/passwordHistory.js';
import SubAdmin from '../../models/subAdminModel.js';
import TransactionHistory from '../../models/transtionHistoryModel.js';
import WithdrawalHistory from '../../models/withdrawalHistoryModel.js';
import { calculateAllExposure } from '../../utils/exposureUtils.js';
import { formatLoginDateTime } from '../../utils/appTime.js';
import {
  amountToAdminBdt,
  getUsdtToBdtRate,
  mapSportsBetHistoryForAdmin,
  mapTransactionsForAdmin,
  mapUserFinancialsForAdmin,
} from '../../utils/adminCurrency.js';

const countUplines = async (user) => {
  let count = 0;
  let currentUser = user;

  while (currentUser && currentUser.invite) {
    const upline = await SubAdmin.findOne({ code: currentUser.invite });
    if (!upline) break;

    count++;
    currentUser = upline;
  }

  return count;
};

const updateAdmin = async (id) => {
  try {
    const admin = await SubAdmin.findById(id);
    if (!admin) {
      throw new Error('Admin not found');
    }

    // Include ALL downlines (including deleted) for financial calculations.
    // Deleted users should still count in hierarchy calculations to prevent
    // sub-admins from hiding losses by deleting users.
    const directDownlines = await SubAdmin.find({
      invite: admin.code,
    });

    //  CLEAN SEPARATION: Calculate each type separately
    let DownlineTotalExposure = 0;
    let DownlineTotalBettingProfitLoss = 0;
    const DownlineTotalBaseBalance = directDownlines.reduce(
      (sum, user) => sum + (user.baseBalance || 0),
      0
    );

    // Calculate correct exposure and bettingProfitLoss for each downline
    for (const user of directDownlines) {
      try {
        // FIX: If downline is NOT a 'user' role (i.e., it's an agent/admin),
        // use their stored totalExposure which was already calculated recursively.
        // Only calculate from bets for actual end-users who place bets.
        if (user.role !== 'user') {
          DownlineTotalExposure += user.totalExposure || user.exposure || 0;
          DownlineTotalBettingProfitLoss += user.bettingProfitLoss || 0;
          // console.log(
          //   `[UPDATE ADMIN] Agent/Admin ${user.userName}: using stored totalExposure=${user.totalExposure || user.exposure || 0}`
          // );
          continue;
        }

        // For actual users, recalculate bettingProfitLoss from betHistoryModel
        // (single source of truth - stores each individual bet with original values)
        const plResult = await betHistoryModel.aggregate([
          {
            $match: {
              userId: user._id.toString(),
              status: { $in: [1, 2] },
            },
          },
          {
            $group: {
              _id: null,
              totalPL: { $sum: '$profitLossChange' },
            },
          },
        ]);
        const userBettingPL = plResult.length > 0 ? plResult[0].totalPL : 0;

        // Update user's stored bettingProfitLoss if it drifted from betHistoryModel
        if (user.bettingProfitLoss !== userBettingPL) {
          // console.log(
          //   `[UPDATE ADMIN] User ${user.userName}: correcting bettingProfitLoss from ${user.bettingProfitLoss} to ${userBettingPL}`
          // );
          user.bettingProfitLoss = userBettingPL;
          await user.save();
        }
        DownlineTotalBettingProfitLoss += userBettingPL;

        // For actual users, get all pending bets
        const updatedPendingBets = await betModel.find({
          userId: user._id,
          status: 0,
        });

        // Market-based exposure calculation (handles fancy + non-fancy + offsetting)
        const userExposure = calculateAllExposure(updatedPendingBets);
        DownlineTotalExposure += userExposure;
        // console.log(
        //   `[UPDATE ADMIN] User ${user.userName}: exposure=${userExposure} bettingPL=${userBettingPL}`
        // );
      } catch (error) {
        // console.error(
        //   `[UPDATE ADMIN] Error calculating exposure for user ${user.userName}:`,
        //   error.message
        // );
        // Fallback to user's stored values
        DownlineTotalExposure += user.exposure || 0;
        DownlineTotalBettingProfitLoss += user.bettingProfitLoss || 0;
      }
    }

    // CLEAN SEPARATION: Update admin with separate fields
    admin.bettingProfitLoss = DownlineTotalBettingProfitLoss; // Sum of downlines' betting P/L
    admin.uplineBettingProfitLoss = DownlineTotalBettingProfitLoss; // Same for upline calculation

    // Calculate totalBalance using clean separation
    admin.totalBalance =
      DownlineTotalBaseBalance + admin.uplineBettingProfitLoss;
    admin.exposure = DownlineTotalExposure;
    admin.totalExposure = DownlineTotalExposure;
    admin.agentAvbalance = admin.totalBalance - admin.totalExposure; // Available Balance in dashboard
    admin.totalAvbalance = admin.totalBalance + admin.avbalance; // Total Balance in dashboard

    await admin.save();

    return {
      success: true,
      message: 'Admin updated with downline data',
      admin,
    };
  } catch (error) {
    console.error('updateAdmin error:', error);
    return { success: false, message: error.message };
  }
};

export const updateAllUplines = async (userIdOrArray) => {
  try {
    const userIds = Array.isArray(userIdOrArray)
      ? userIdOrArray
      : [userIdOrArray];

    for (const userId of userIds) {
      let currentUser = await SubAdmin.findById(userId);
      if (!currentUser) {
        console.log(` [UPDATE UPLINES] User not found: ${userId}`);
        continue;
      }

      console.log(
        ` [UPDATE UPLINES] Starting from user: ${currentUser.userName} (${currentUser.code})`
      );

      while (currentUser && currentUser.invite) {
        const uplineAdmin = await SubAdmin.findOne({
          code: currentUser.invite,
        });
        if (uplineAdmin) {
          console.log(
            ` [UPDATE UPLINES] Updating upline: ${uplineAdmin.userName} (${uplineAdmin.code})`
          );
          await updateAdmin(uplineAdmin._id);
          currentUser = uplineAdmin;
        } else {
          console.log(
            ` [UPDATE UPLINES] No higher upline found for ${currentUser.userName}`
          );
          break;
        }
      }
    }

    console.log(` [UPDATE UPLINES] Completed all upline updates\n`);
  } catch (error) {
    console.error(` [UPDATE UPLINES] Error:`, error);
  }
};

export const getAllUsersWithCompleteInfo = async (req, res) => {
  try {
    const { id, role } = req;
    const { page = 1, limit = 10, searchQuery } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    let filter =
      role === 'superadmin'
        ? { _id: { $ne: id }, status: { $ne: 'delete' } }
        : { invite: admin.code, status: { $ne: 'delete' } };

    if (searchQuery) {
      filter = {
        ...filter,
        userName: { $regex: searchQuery, $options: 'i' },
      };
    }

    const allUsers = await SubAdmin.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const usdtToBdtRate = await getUsdtToBdtRate();

    // Add both upline totalBalance and direct user info
    const usersWithCompleteInfo = await Promise.all(
      allUsers.map(async (user) => {
        // Get upline's totalBalance
        const upline = await SubAdmin.findOne({ code: user.invite });

        // Count uplines to determine if direct user
        const uplineCount = await countUplines(user);

        const mapped = mapUserFinancialsForAdmin(user, usdtToBdtRate);
        return {
          ...mapped,
          uplineTotalBalance: upline
            ? amountToAdminBdt(upline.totalBalance, upline.currency, usdtToBdtRate)
            : 0,
          uplineCount: uplineCount,
          isDirectUser: uplineCount === 1,
        };
      })
    );

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      message: 'Users with complete info retrieved successfully',
      data: usersWithCompleteInfo,
      usdtToBdtRate,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error('Error fetching users with complete info:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
};

export const createSubAdmin = async (req, res) => {
  try {
   console.log("my request body is",req.body);
    const {
      name,
      userName,
      accountType,
      commission,
       balance=0,
      exposureLimit=0,
      creditReference=0,
      rollingCommission=0,
      phone,
      password,
      partnership=0,
      id,
      email
    } = req.body;

    const commition=commission;

    console.log("my request body is",email);

    const masterPassword=password;

    // Generate a Unique Code for Referral
    const uniqueCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Parent account (downline attaches under this node)
    const parent = await SubAdmin.findById(id);
    if (!parent) {
      return res.status(400).json({ message: 'Admin not found' });
    }
    const role = parent.role;

    if (parent.secret === 0) {
      return res.status(403).json({
        message: 'Admin account is not authorized to create users',
      });
    }

    // Helper: verify a target account is within caller's downline tree
    const isWithinDownline = async (rootCode, targetCode) => {
      if (!rootCode || !targetCode) return false;
      if (String(rootCode) === String(targetCode)) return true;

      const visited = new Set();
      let frontier = [String(rootCode)];
      let safety = 0;

      while (frontier.length && safety < 5000) {
        safety += 1;
        const batch = frontier.filter((c) => c && !visited.has(c));
        if (!batch.length) break;
        batch.forEach((c) => visited.add(c));

        const rows = await SubAdmin.find(
          { invite: { $in: batch }, status: { $ne: 'delete' } },
          { code: 1 }
        ).lean();

        const next = [];
        for (const r of rows) {
          const c = r?.code ? String(r.code) : '';
          if (!c) continue;
          if (c === String(targetCode)) return true;
          if (!visited.has(c)) next.push(c);
        }
        frontier = next;
      }
      return false;
    };

    /**
     * Parent selection rules:
     * - admin can only create under self
     * - superadmin can create:
     *   - admin under self (top-level)
     *   - user under ANY downline admin (so user attaches under that admin)
     */
    if (req.role === 'admin' && String(req.id) !== String(id)) {
      return res.status(403).json({
        message: 'You can only create accounts under your own profile.',
      });
    }
    if (req.role === 'superadmin') {
      const creatingAdmin = accountType === 'admin';
      const creatingUser = accountType === 'user';

      if (creatingAdmin && String(req.id) !== String(id)) {
        return res.status(403).json({
          message: 'You can only create admin under your own profile.',
        });
      }

      if (creatingUser) {
        // user must be created under an admin node (as requested)
        if (parent.role !== 'admin') {
          return res.status(403).json({
            message: 'Superadmin can create user only under an admin node.',
          });
        }

        const superSelf = await SubAdmin.findById(req.id).select('code role status');
        if (!superSelf || superSelf.role !== 'superadmin') {
          return res.status(403).json({ message: 'Unauthorized.' });
        }
        const ok = await isWithinDownline(superSelf.code, parent.code);
        if (!ok) {
          return res.status(403).json({
            message: 'Selected parent admin is not in your downline.',
          });
        }
      }
    }

    const roleHierarchy = {
      // Requested: superadmin can create both admin and user
      superadmin: ['admin', 'user'],
      // Requested: admin can create user
      admin: ['user'],
      subadmin: ['seniorSuper'],
      seniorSuper: ['superAgent'],
      superAgent: ['agent'],
      agent: ['user'],
    };

    const allowedForParent = roleHierarchy[role]?.includes(accountType);
    if (!roleHierarchy[role] || !allowedForParent) {
      return res.status(403).json({
        message: `${role} can only create ${(roleHierarchy[role] || []).join(', ')} accounts.`,
      });
    }

    // Balance validation
    // if (['superadmin', 'admin', 'subadmin', 'seniorSuper', 'superAgent', 'agent'].includes(role)) {
    //   if (isNaN(balance) || balance === undefined || balance < 0) {
    //     return res.status(400).json({ message: 'Invalid balance amount' });
    //   }

    //   if (balance > admin.balance || admin.balance < 1) {
    //     return res.status(400).json({ message: 'Insufficient balance' });
    //   }
    // }

    // Password Regex: must contain letters AND numbers, NO special characters
    // const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;
    // if (!passwordRegex.test(password)) {
    //   return res.status(400).json({
    //     message:
    //       'Password must be at least 8 characters with both letters and numbers. Special characters are not allowed.',
    //   });
    // }

    // Check if userName already exists
    const existingSubAdmin = await SubAdmin.findOne({
      $or: [
        { userName: userName.toLowerCase() }
      ]
    });
    if (existingSubAdmin) {
      return res.status(400).json({ message: `${userName} or ${email} already exists` });
    }

    const creditReferenceProfitLoss = balance - creditReference;

    // Partnership validation (required for non-user accounts, 1-100)
    let parsedPartnership = 0;
    // if (accountType !== 'user') {
    //   parsedPartnership = Number(partnership);
    //   if (
    //     !partnership ||
    //     isNaN(parsedPartnership) ||
    //     parsedPartnership <= 0 ||
    //     parsedPartnership > 100
    //   ) {
    //     return res.status(400).json({
    //       message: 'Partnership is required and must be between 1 and 100.',
    //     });
    //   }
    // }
    // if (admin.avbalance - balance < 0) {
    //   return res.status(400).json({ message: 'Insufficient balance' });
    // }

    console.log("email just before creating subadmin is",email);

    const subAdmin = new SubAdmin({
      name,
      userName: userName.toLowerCase(),
      account: accountType,
      commition,
      balance,
      baseBalance: balance, // Set baseBalance to initial balance given
      exposureLimit,
      creditReference,
      profitLoss: 0,
      bettingProfitLoss: 0,
      creditReferenceProfitLoss: creditReferenceProfitLoss,
      avbalance: balance,
      totalAvbalance: balance,
      rollingCommission,
      code: uniqueCode,
      invite: parent.code,
      password,
      role: accountType,
      masterPassword,
      partnership: parsedPartnership,
      totalBalance: 0,
      email,
    });
    await subAdmin.save();

    await TransactionHistory.create({
      userId: subAdmin._id,
      userName: subAdmin.userName,
      withdrawl: 0,
      deposite: balance,
      amount: balance,
      remark: 'Opening Balance',
      from: parent.userName,
      to: subAdmin.userName,
      invite: parent.code,
    });

    // Downline calculations (exclude deleted users)
    const downlineUser = await SubAdmin.find({
      invite: parent.code,
      status: { $ne: 'delete' },
    });
    const DownlineTotalExposure = downlineUser.reduce(
      (sum, user) => sum + (user.exposure || 0),
      0
    );
    const DownlineTotalBettingProfitLoss = downlineUser.reduce(
      (sum, user) => sum + (user.bettingProfitLoss || 0),
      0
    );
    const DownlineTotalBaseBalance = downlineUser.reduce(
      (sum, user) => sum + (user.baseBalance || 0),
      0
    );

    //  CLEAN SEPARATION: Update admin with separate fields (same as updateAdmin)
    parent.avbalance -= balance;
    parent.bettingProfitLoss = DownlineTotalBettingProfitLoss; // Sum of downlines' betting P/L
    parent.uplineBettingProfitLoss = DownlineTotalBettingProfitLoss; // Same for upline calculation

    // Calculate totalBalance using clean separation
    parent.totalBalance =
    DownlineTotalBaseBalance + parent.uplineBettingProfitLoss;
    parent.totalAvbalance = parent.avbalance + parent.totalBalance;
    parent.exposure = DownlineTotalExposure;
    parent.totalExposure = DownlineTotalExposure;
    parent.agentAvbalance = parent.totalBalance - parent.totalExposure;

    await parent.save();
    console.log('The admin is updated', parent);

    // Generate token
    const token = await createToken({
      id: subAdmin._id,
      role: subAdmin.role,
      user: subAdmin,
    });

    return res.status(201).json({
      success: true,
      message: `${accountType} created successfully`,
      token,
      user: subAdmin,
    });
  } catch (error) {
    console.error('Create SubAdmin Error:', error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export const deleteSubAdmin = async (req, res) => {
  const { id, role } = req;
  const { page = 1, limit = 10 } = req.query;
  try {
    const { userId } = req.params; // Sub-admin ID to delete

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const subAdmin = await SubAdmin.findById(userId);
    if (!subAdmin) {
      return res.status(404).json({ message: 'user not found' });
    }

    //  Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (editUser.avbalance > 0) {
      return res
        .status(400)
        .json({ message: 'User has pending withdrawl balance' });
    }
    if (!editUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    editUser.status = 'delete';

    await editUser.save();

    const filter =
      role === 'superadmin'
        ? { _id: { $ne: id }, role: { $ne: 'user' }, status: { $ne: 'delete' } }
        : {
            invite: editUser.code,
            role: { $ne: 'user' },
            status: { $ne: 'delete' },
          };

    const allUsers = await SubAdmin.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);
    const usdtToBdtRate = await getUsdtToBdtRate();

    return res.status(200).json({
      success: true,
      message: 'Sub-admin deleted successfully',
      usdtToBdtRate,
      data: allUsers.map((u) => mapUserFinancialsForAdmin(u, usdtToBdtRate)),
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error('Delete SubAdmin Error:', error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

const saveLoginHistory = async (userName, id, status, req, role = null) => {
  try {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      'IP not found';

    let city = null;
    let region = null;
    let country = null;
    let isp = null;

    try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
        timeout: 4000,
      });
      city = response.data?.city ?? null;
      region = response.data?.region ?? null;
      country = response.data?.country_name ?? null;
      isp = response.data?.org ?? null;
    } catch {
      // Still save login row when geo lookup fails (localhost, rate limit, etc.)
    }

    const formattedDateTime = formatLoginDateTime(new Date());
    const normalizedStatus =
      status === 'Success' ||
      (typeof status === 'string' && status.toLowerCase().includes('success'))
        ? 'Login Successful'
        : 'Login Failed';

    await LoginHistory.create({
      userName,
      userId: String(id),
      role,
      status: normalizedStatus,
      dateTime: formattedDateTime,
      ip,
      isp,
      city,
      region,
      country,
    });
  } catch (error) {
    console.error(' Login history error:', error.message);
  }
};

export const loginSubAdmin = async (req, res) => {
  try {
    const { userName, password } = req.body;

    //  Check if userName and password are provided
    if (!userName || !password) {
      await saveLoginHistory(
        'null',
        'null',
        'Please provide both username and password',
        req
      );
      return res
        .status(400)
        .json({ message: 'Please provide both username and password.' });
    }

    //  Find sub-admin by userName (case-insensitive)
    const subAdmin = await SubAdmin.findOne({
      userName: userName.toLowerCase(),
    });
    console.log("my subAdmin is",subAdmin);

    if (!subAdmin) {
      await saveLoginHistory(userName, userName, 'UserName Wrong', req);
      return res.status(400).json({ message: 'Sub-admin not found.' });
    }

    // Prevent end-users from logging into admin panel
    if (subAdmin.role === 'user') {
      await saveLoginHistory(
        userName,
        subAdmin._id,
        'User tried admin login',
        req,
        subAdmin?.role
      );
      return res.status(403).json({
        message: 'Users cannot login to admin panel.',
      });
    }

    //  Compare password
    const isMatch = await bcrypt.compare(password, subAdmin.password);

    if (!isMatch) {
    await saveLoginHistory(userName, subAdmin._id, 'Password Wrong', req, subAdmin?.role);
      return res.status(400).json({ message: 'Password Wrong !' });
    }

    if (subAdmin.status !== 'active') {
      await saveLoginHistory(userName, subAdmin._id, 'Account Inactive', req, subAdmin?.role);
      return res
        .status(400)
        .json({ message: `Your Account has been ${subAdmin.status} !` });
    }

    // Unique session id per login. Keep ALL still-valid ids: previous `sessionToken` must be
    // merged into `sessionTokens` — otherwise only $push(new) leaves old JWTs unmatched after $set(sessionToken).
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const deviceId = req.headers['user-agent'] || 'unknown-device';
    const ipAddress =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const previousSingle = subAdmin.sessionToken;
    const fromArray = Array.isArray(subAdmin.sessionTokens)
      ? [...subAdmin.sessionTokens]
      : [];
    const merged = new Set(fromArray);
    if (previousSingle) merged.add(previousSingle);
    merged.add(sessionToken);

    await SubAdmin.findByIdAndUpdate(subAdmin._id, {
      $set: {
        sessionTokens: [...merged],
        sessionToken,
        lastLogin: new Date(),
        lastDevice: deviceId,
        lastIP: ipAddress,
      },
    });

    //  Generate JWT Token with session token
    const token = jwt.sign(
      {
        id: subAdmin._id,
        role: subAdmin.role,
        sessionToken: sessionToken,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    await saveLoginHistory(userName, subAdmin._id, 'Success', req, subAdmin?.role);

    //  Set token in HTTP-only cookie
    res.cookie('auth', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    //  Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: subAdmin,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message, error: error.message });
  }
};

export const changePasswordBySubAdmin = async (req, res) => {
  const { id } = req; // Sub-admin ID (admin making the change)
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New Password and Password Confirmation should be same',
      });
    }

    // Validate new password: must contain letters AND numbers, NO special characters
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters with both letters and numbers. Special characters are not allowed.',
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old Password Has Not Matched!' });
    }
    subAdmin.password = newPassword;

    if (!subAdmin.isPasswordChanged) {
      subAdmin.isPasswordChanged = true;
    }

    await subAdmin.save();

    await passwordHistory.create({
      userName: subAdmin.userName,
      remark: 'Password Changed By SubAdmin.',
      userId: id,
    });
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',

      data: subAdmin,
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.id;

    let token =
      req.headers.authorization?.startsWith('Bearer') &&
      req.headers.authorization.split(' ')[1];
    if (!token && req.cookies?.auth) token = req.cookies.auth;

    let sessionToRemove = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        sessionToRemove = decoded.sessionToken;
      } catch {
        // token invalid — still clear cookie below
      }
    }

    if (sessionToRemove) {
      await SubAdmin.findByIdAndUpdate(userId, {
        $pull: { sessionTokens: sessionToRemove },
      });
      const u = await SubAdmin.findById(userId).select('sessionToken sessionTokens');
      const remaining = u?.sessionTokens || [];
      if (remaining.length === 0) {
        await SubAdmin.findByIdAndUpdate(userId, {
          $set: { sessionToken: null },
        });
      } else if (u?.sessionToken === sessionToRemove) {
        await SubAdmin.findByIdAndUpdate(userId, {
          $set: { sessionToken: remaining[remaining.length - 1] },
        });
      }
    } else {
      await SubAdmin.findByIdAndUpdate(userId, {
        $set: { sessionToken: null, sessionTokens: [] },
      });
    }

    res.clearCookie('auth', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Logout success',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: error.message,
    });
  }
};

export const forceLogoutUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify admin permissions
    if (req.role !== 'admin' && req.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await SubAdmin.findByIdAndUpdate(userId, {
      $set: { sessionToken: null, sessionTokens: [] },
    });

    res.status(200).json({
      success: true,
      message: 'User logged out from all devices',
    });
  } catch (error) {
    console.error('Force logout error:', error);
    res.status(500).json({ message: 'Operation failed', error: error.message });
  }
};

export const getLoginHistory = async (req, res) => {
  try {
    const userId = String(req.params.userId || '');
    const user = await SubAdmin.findById(userId).select('role userName');

    const orClauses = [{ userId }];
    if (user?.userName) {
      orClauses.push({ userName: user.userName });
    }

    const data = await LoginHistory.find({ $or: orClauses }).sort({
      createdAt: -1,
    });

    const normalizedData = data.map((entry) => ({
      ...entry.toObject(),
      role: entry.role || user?.role || '-',
    }));

    res.status(200).json({
      message: 'Login history fetched successfully',
      data: normalizedData,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching login history:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getSubAdmin = async (req, res) => {
  try {
    const { id } = req; // Get ID from request

    if (!id) {
      return res.status(400).json({ message: 'Admin ID is required' });
    }

    // Find sub-admin & exclude sensitive fields
    const admin = await SubAdmin.findById(id);

    if (!admin) {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }
    await updateAdmin(id);

    //  Fetch the updated admin data after updateAdmin
    const updatedAdmin = await SubAdmin.findById(id);
    const usdtToBdtRate = await getUsdtToBdtRate();

    res.status(200).json({
      message: 'Sub-admin details retrieved successfully',
      data: mapUserFinancialsForAdmin(updatedAdmin, usdtToBdtRate),
      usdtToBdtRate,
    });
  } catch (error) {
    console.error('Error fetching sub-admin:', error);
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params; // passed in route as /credit-ref-history/:userId
    // console.log("userId", userId);
    const data = await SubAdmin.findById(userId);
    const usdtToBdtRate = await getUsdtToBdtRate();
    res.status(200).json({
      message: 'User Profile fetched successfully',
      data: mapUserFinancialsForAdmin(data, usdtToBdtRate),
      usdtToBdtRate,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching User Profile:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getDeleteUser = async (req, res) => {
  try {
    const { id, role } = req;
    const { page = 1, limit = 10 } = req.query;

    // console.log("Admin ID:", id);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const admin = await SubAdmin.findById(id);
    console.log('The Delete User Admin', admin);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const filter =
      role === 'superadmin'
        ? {
            _id: { $ne: id },
            // role: { $ne: "user" },
            status: 'delete',
          }
        : {
            invite: admin.code,
            // role: { $ne: "user" },
            status: 'delete',
          };

    const allUsers = await SubAdmin.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);
    const usdtToBdtRate = await getUsdtToBdtRate();

    return res.status(200).json({
      message: 'All sub-admin details retrieved successfully',
      data: allUsers.map((u) => mapUserFinancialsForAdmin(u, usdtToBdtRate)),
      usdtToBdtRate,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
};

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
      return res.status(404).json({ message: 'Admin not found' });
    }
    // ✅ Verify Master Password
    const isMatch = await bcrypt.compare(masterPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Master password.' });
    }

    let editUser = await SubAdmin.findById(userId);

    if (!editUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    editUser.status = 'active';

    await editUser.save();

    const filter =
      role === 'superadmin'
        ? {
            _id: { $ne: id },
            role: { $ne: 'user' },
            status: 'delete',
          }
        : {
            invite: admin.code,
            role: { $ne: 'user' },
            status: 'delete',
          };

    const allUsers = await SubAdmin.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);
    const usdtToBdtRate = await getUsdtToBdtRate();

    return res.status(200).json({
      success: true,
      message: 'User restored successfully',
      usdtToBdtRate,
      data: allUsers.map((u) => mapUserFinancialsForAdmin(u, usdtToBdtRate)),
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
};
export const getAllUser = async (req, res) => {
  try {
    console.log("get all user1 called");
    const { id: authId, role: authRole } = req;
    // Optional target id from body (used by frontend downline tree view)
    const bodyId = req.body?.id || req.body?.userId;
    const targetId = bodyId || authId;

    console.log("my role is", authRole);
    console.log("authenticated id is", authId);
    console.log("target id for downline is", targetId);
    const { page = 1, limit = 10, searchQuery } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const admin = await SubAdmin.findById(targetId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    console.log("my admin is", admin.name);

    let filter =
      admin.role === 'superadmin'
        ? {
            _id: { $ne: targetId },
            //  role: { $ne: 'user' },
            status: { $ne: 'delete' },
            invite: admin.code,
          }
        : {
            invite: admin.code,
            //  role: { $ne: 'user' },
            status: { $ne: 'delete' },
          };

    if (searchQuery) {
      filter = {
        ...filter,
        userName: { $regex: searchQuery, $options: 'i' },
      };
    }
    const allUsers = await SubAdmin.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    const usdtToBdtRate = await getUsdtToBdtRate();

    // ✅ Correct totals: sum over ALL downline 'user' accounts (BDT equivalent for USDT)
    let totalUserDownlineBalance = 0;
    let totalUserDownlineExposure = 0;

    const queueForTotals = [admin.code];
    while (queueForTotals.length > 0) {
      const currentCode = queueForTotals.shift();

      const downlines = await SubAdmin.find(
        {
          invite: currentCode,
          status: { $ne: 'delete' },
        },
        { code: 1, role: 1, balance: 1, exposure: 1, currency: 1 }
      ).lean();

      for (const dl of downlines) {
        if (dl.role === 'user') {
          totalUserDownlineBalance += amountToAdminBdt(
            dl.balance,
            dl.currency,
            usdtToBdtRate
          );
          totalUserDownlineExposure += amountToAdminBdt(
            dl.exposure,
            dl.currency,
            usdtToBdtRate
          );
        } else if (dl.code) {
          queueForTotals.push(dl.code);
        }
      }
    }

    // For each downline (HR / agent / admin), calculate the sum of balances
    // of all 'user' role accounts in their entire downline tree (in BDT).
    const usersWithDownlineUserBalance = await Promise.all(
      allUsers.map(async (user) => {
        let totalDownlineUserBalance = 0;
        const userCurrency = user.currency || 'BDT';

        // BFS over hierarchy using invite / code chain
        const queue = [user.code];
        while (queue.length > 0) {
          const currentCode = queue.shift();

          const downlines = await SubAdmin.find(
            {
              invite: currentCode,
              status: { $ne: 'delete' },
            },
            { code: 1, role: 1, balance: 1, currency: 1 }
          ).lean();

          for (const dl of downlines) {
            if (dl.role === 'user') {
              totalDownlineUserBalance += amountToAdminBdt(
                dl.balance,
                dl.currency,
                usdtToBdtRate
              );
            } else if (dl.code) {
              queue.push(dl.code);
            }
          }
        }

        return {
          ...mapUserFinancialsForAdmin(user, usdtToBdtRate),
          totalDownlineUserBalance,
          playerbalancee: totalDownlineUserBalance,
        };
      })
    );

    return res.status(200).json({
      message: 'All sub-admin details retrieved successfully',
      data: usersWithDownlineUserBalance,
      selfData: mapUserFinancialsForAdmin(admin, usdtToBdtRate),
      totalUserDownlineBalance,
      totalUserDownlineExposure,
      usdtToBdtRate,
      ipWarnings: null,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
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
      return res.status(404).json({ message: 'Admin not found' });
    }

    //  Base filter
    let filter =
      role === 'superadmin'
        ? {
            _id: { $ne: id },
            role: 'user',
            status: { $ne: 'delete' },
            invite: admin.code,
          }
        : { invite: admin.code, role: 'user', status: { $ne: 'delete' } };

    // 🔍 Add search by userName if searchQuery exists
    if (searchQuery && searchQuery !== undefined) {
      // console.log("dfghjkkkkkkkkkkkkkk")
      filter = {
        ...filter,
        userName: { $regex: searchQuery, $options: 'i' }, // case-insensitive search
      };
    }

    const allUsers = await SubAdmin.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const usdtToBdtRate = await getUsdtToBdtRate();

    // Apply the same exposure calculation logic as getUserById
    const usersWithCorrectExposure = await Promise.all(
      allUsers.map(async (user) => {
        const userCurrency = user.currency || 'BDT';
        try {
          // Get all pending bets for this user
          const updatedPendingBets = await betModel.find({
            userId: user._id,
            status: 0,
          });

          // Market-based exposure calculation (handles fancy + non-fancy + offsetting)
          const currentExposure = calculateAllExposure(updatedPendingBets);

          // Return user with corrected exposure (same as getUserById), in BDT for admin
          return mapUserFinancialsForAdmin(
            { ...user.toObject(), exposure: currentExposure },
            usdtToBdtRate
          );
        } catch (error) {
          console.error(
            `[FANCY EXPOSURE] Error calculating exposure for user ${user.userName}:`,
            error.message
          );
          return mapUserFinancialsForAdmin(user, usdtToBdtRate);
        }
      })
    );

    const totalUsers = await SubAdmin.countDocuments(filter);

    return res.status(200).json({
      message: 'All sub-admin details retrieved successfully',
      data: usersWithCorrectExposure,
      usdtToBdtRate,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
};

export const getUsersByInvite = async (req, res) => {
  const { refCode } = req.body;
  try {
    const { id } = req; // Extracting admin ID from request

    //  Find the logged-in admin
    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    //  Fetch users where `invite` matches the admin's `code`
    const usersData = await SubAdmin.find({
      invite: refCode,
      status: { $ne: 'delete' },
    });

    if (!usersData.length) {
      return res
        .status(404)
        .json({ message: 'No users found for this invite code.' });
    }

    const split = usersData.reduce(
      (acc, row) => {
        const r = row?.role;
        if (r === 'admin') acc.admins.push(row);
        else if (r === 'user') acc.users.push(row);
        else acc.others.push(row);
        return acc;
      },
      { admins: [], users: [], others: [] }
    );

    const usdtToBdtRate = await getUsdtToBdtRate();
    const mapList = (list) =>
      list.map((u) => mapUserFinancialsForAdmin(u, usdtToBdtRate));

    res.status(200).json({
      message: 'Users retrieved successfully',
      usdtToBdtRate,
      data: mapList(usersData),
      admins: mapList(split.admins),
      users: mapList(split.users),
      others: mapList(split.others),
    });
  } catch (error) {
    console.error('Error fetching users by invite code:', error);
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
};

export const getSubAdminuser = async (req, res) => {
  try {
    const { code } = req.body; // Get invite code from request body
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (!code) {
      return res.status(400).json({ message: 'Admin invite code is required' });
    }

    const filter = { invite: code, status: { $ne: 'delete' } };

    const subAdmins = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);
    const usdtToBdtRate = await getUsdtToBdtRate();
    return res.status(200).json({
      message: `Sub-admin details for level  retrieved successfully`,
      usdtToBdtRate,
      data: subAdmins.map((u) => mapUserFinancialsForAdmin(u, usdtToBdtRate)),
    });
  } catch (error) {
    console.error('Error fetching sub-admin:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
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

    const numericCreditReference = parseFloat(creditReference);
    if (isNaN(numericCreditReference)) {
      return res
        .status(400)
        .json({ message: 'Invalid credit reference amount.' });
    }

    //  Find the admin making the change
    let subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }

    //  Verify Master Password
    const isMatch = await bcrypt.compare(masterPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Master password.' });
    }

    //  Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (!editUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const test = await creditRefHistory.create({
      formName: 'uplire',
      userName: editUser.userName,
      oldamount: editUser.creditReference,
      newamount: creditReference,
      remark: 'Credit Reference',
      invite: subAdmin.code,
      userId: userId,
    });

    if (creditReference !== undefined)
      editUser.creditReference = creditReference;

    //Only Recalculate creditReference profit/loss
    editUser.creditReferenceProfitLoss =
      editUser.baseBalance - editUser.creditReference;

    //  Save updated user

    await editUser.save();
    const filter =
      role === 'superadmin'
        ? { _id: { $ne: id }, role: { $ne: 'user' }, status: { $ne: 'delete' } }
        : { invite: subAdmin.code, role: 'user', status: { $ne: 'delete' } };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);
    const usdtToBdtRate = await getUsdtToBdtRate();

    return res.status(200).json({
      success: true,
      message: `Credit ${creditReference} updated successfully`,
      usdtToBdtRate,
      data: allUsers.map((u) => mapUserFinancialsForAdmin(u, usdtToBdtRate)),
    });
  } catch (error) {
    console.error('Update SubAdmin Error:', error);
    return res
      .status(500)
      .json({ message: error.message, error: error.message });
  }
};
export const updateExploserLimit = async (req, res) => {
  try {
    const { id, role } = req; // Sub-admin ID (admin making the change)
    console.log('The role in updateExposureLimit', role);
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const { userId, formData } = req.body;
    const { exposureLimit, masterPassword } = formData;

    //  Find the admin making the change
    let subAdmin = await SubAdmin.findById(id);
    console.log('The subAdmin in updateExposureLimit', subAdmin);
    if (!subAdmin) {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }

    //  Verify Master Password
    const isMatch = await bcrypt.compare(masterPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Master password.' });
    }

    //  Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (!editUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // console.log("creditRef", creditRef);
    //  Update fields
    if (exposureLimit !== undefined) editUser.exposureLimit = exposureLimit;

    //  Recalculate profit/loss
    // editUser.profitLoss = editUser.balance - (editUser.creditReference || 0);

    await editUser.save();
    const filter =
      role === 'superadmin'
        ? { _id: { $ne: id }, role: { $ne: 'user' }, status: { $ne: 'delete' } }
        : { invite: subAdmin.code, role: 'user', status: { $ne: 'delete' } };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);
    const usdtToBdtRate = await getUsdtToBdtRate();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      usdtToBdtRate,
      data: allUsers.map((u) => mapUserFinancialsForAdmin(u, usdtToBdtRate)),
    });
  } catch (error) {
    console.error('Update User Error:', error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export const updatePartnership = async (req, res) => {
  try {
    const { id, role } = req;
    const { userId, formData } = req.body;
    const { partnership, masterPassword } = formData;

    // Find admin making the change
    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify master password
    const isMatch = await bcrypt.compare(masterPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Master password.' });
    }

    // Find the user being updated
    const editUser = await SubAdmin.findById(userId);
    if (!editUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Users excluded from partnership
    if (editUser.role === 'user') {
      return res
        .status(400)
        .json({ message: 'Partnership cannot be set for end users.' });
    }

    // Verify the admin is the direct upline
    if (editUser.invite !== admin.code) {
      return res.status(403).json({
        message: 'You can only update partnership for your direct downline.',
      });
    }

    // Validate range (1-100 required)
    const parsedPartnership = Number(partnership);
    if (
      !partnership ||
      isNaN(parsedPartnership) ||
      parsedPartnership <= 0 ||
      parsedPartnership > 100
    ) {
      return res.status(400).json({
        message: 'Partnership is required and must be between 1 and 100.',
      });
    }

    // Update partnership
    editUser.partnership = parsedPartnership;
    await editUser.save();

    // Return updated user list (same pattern as updateCreditReference)
    const filter =
      role === 'superadmin'
        ? {
            _id: { $ne: id },
            role: { $ne: 'user' },
            status: { $ne: 'delete' },
          }
        : {
            invite: admin.code,
            role: { $ne: 'user' },
            status: { $ne: 'delete' },
          };

    const allUsers = await SubAdmin.find(filter);
    const usdtToBdtRate = await getUsdtToBdtRate();

    return res.status(200).json({
      success: true,
      message: `Partnership updated to ${parsedPartnership} successfully`,
      usdtToBdtRate,
      data: allUsers.map((u) => mapUserFinancialsForAdmin(u, usdtToBdtRate)),
    });
  } catch (error) {
    console.error('Update Partnership Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const getCreditRefHistoryByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // passed in route as /credit-ref-history/:userId
    const { page = 1, limit = 10, searchQuery = '' } = req.query;
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
      message: 'Credit Reference History fetched successfully',
      data,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching creditRefHistory:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      success: false,
    });
  }
};

export const withdrowalAndDeposite = async (req, res) => {
  try {
    const { id, role } = req;

    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const { userId, formData, type } = req.body;
    let { balance, masterPassword, remark } = formData;

    //  Convert balance to a number
    balance = parseFloat(balance);

    if (isNaN(balance) || balance <= 0) {
      return res.status(400).json({ message: 'Invalid balance amount.' });
    }

    // Find the admin making the change
    let subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }

    //  Verify Master Password
    const isMatch = await bcrypt.compare(masterPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Master password.' });
    }

    //  Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (!editUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle Withdrawal
    if (type === 'withdrawal') {
      if (balance > editUser.avbalance || balance > editUser.balance) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      editUser.avbalance = Math.max(0, editUser.avbalance - balance);
      editUser.balance -= balance;
      editUser.baseBalance -= balance; // Update the baseBalance of the user
      // editUser.totalAvbalance -= balance;
      editUser.remark = remark || editUser.remark;

      //  CORRECT: Recalculate creditReferenceProfitLoss after baseBalance change
      // Always use the formula: baseBalance - creditReference
      editUser.creditReferenceProfitLoss =
        editUser.baseBalance - editUser.creditReference;

      // Don't recalculate profit/loss - it should only come from betting results
      // Only return the amount to avbalance (allocated funds coming back). Do NOT
      // add to balance/baseBalance — that would double-count and create phantom funds.
      subAdmin.avbalance += balance;
      await subAdmin.save();

      await editUser.save();
      await WithdrawalHistory.create({
        userName: editUser.userName,
        amount: balance,
        remark: remark || 'Withdrawal',
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
        remark: remark || 'Transaction',
        invite: subAdmin.code,
      });
    }

    //  Handle Deposit
    if (type === 'deposite') {
      if (role === 'superadmin') {
        // Super Admin can deposit without balance restriction
        editUser.balance += balance;
        editUser.avbalance += balance;
        editUser.baseBalance += balance;
        editUser.exposureLimit = (editUser.exposureLimit || 0) + balance;
        // editUser.totalAvbalance += balance;
        editUser.remark = remark || editUser.remark;

        //  CORRECT: Recalculate creditReferenceProfitLoss after baseBalance change
        // Always use the formula: baseBalance - creditReference
        editUser.creditReferenceProfitLoss =
          editUser.baseBalance - editUser.creditReference;

        //Parent update
        subAdmin.balance -= balance;
        // subAdmin.baseBalance -= balance;
        subAdmin.avbalance = Math.max(0, subAdmin.avbalance - balance);
      } else if (balance > subAdmin.avbalance) {
        return res.status(400).json({ message: 'Insufficient balance' });
      } else {
        // Normal admin deposits from their own balance
        editUser.balance += balance;
        editUser.avbalance += balance;
        editUser.baseBalance += balance;
        editUser.exposureLimit = (editUser.exposureLimit || 0) + balance;
        // editUser.totalAvbalance += balance;
        editUser.remark = remark || editUser.remark;

        //  CORRECT: Recalculate creditReferenceProfitLoss after baseBalance change
        // Always use the formula: baseBalance - creditReference
        editUser.creditReferenceProfitLoss =
          editUser.baseBalance - editUser.creditReference;
        // editUser.profitLoss should NOT be updated here - only from betting results!

        // Don't recalculate profit/loss - it should only come from betting results
        subAdmin.balance -= balance;
        // subAdmin.baseBalance -= balance;
        subAdmin.avbalance = Math.max(0, subAdmin.avbalance - balance);
      }
      await subAdmin.save();
      await editUser.save();

      await DepositHistory.create({
        userName: editUser.userName,
        amount: balance,
        remark: remark || 'Deposit',
        invite: subAdmin.code,
      });

      await TransactionHistory.create({
        userId: userId,
        userName: editUser.userName,
        withdrawl: 0,
        deposite: balance,
        amount: editUser.avbalance,
        remark: remark || 'Transaction',
        from: subAdmin.userName,
        to: editUser.userName,
        invite: subAdmin.code,
      });
    }

    await updateAdmin(id);
    await updateAllUplines(userId);

    //  Fetch updated user list
    const filter =
      role === 'superadmin'
        ? { _id: { $ne: id }, role: { $ne: 'user' }, status: { $ne: 'delete' } }
        : { invite: subAdmin.code, role: 'user', status: { $ne: 'delete' } };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);

    const actionLabel = type === 'deposite' ? 'deposit' : 'withdrawal';
    const targetUserName = editUser?.userName || 'user';
    const usdtToBdtRate = await getUsdtToBdtRate();

    return res.status(200).json({
      success: true,
      message: `Amount ${balance} ${actionLabel} completed successfully for user ${targetUserName}`,
      totalUsers,
      usdtToBdtRate,
      data: allUsers.map((u) => mapUserFinancialsForAdmin(u, usdtToBdtRate)),
    });
  } catch (error) {
    console.error('Update SubAdmin Error:', error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};
export const userSetting = async (req, res) => {
  try {
    const { id, role } = req; // Sub-admin ID (admin making the change)

    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const { masterPassword, status, userId } = req.body;

    //  Find the admin making the change
    let subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }

    // console.log("masterPassword", masterPassword)

    //  Verify Master Password
    const isMatch = await bcrypt.compare(masterPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Master password.' });
    }

    //  Find the user being updated
    let editUser = await SubAdmin.findById(userId);
    if (!editUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    editUser.status = status; // Admin receives the withdrawn amount
    await editUser.save();

    //  Fetch updated user list
    const filter =
      role === 'superadmin'
        ? { _id: { $ne: id }, role: { $ne: 'user' }, status: { $ne: 'delete' } }
        : { invite: subAdmin.code, role: 'user', status: { $ne: 'delete' } };

    const allUsers = await SubAdmin.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const totalUsers = await SubAdmin.countDocuments(filter);
    const usdtToBdtRate = await getUsdtToBdtRate();

    return res.status(200).json({
      success: true,
      message: `User ${status} successfully`,
      totalUsers,
      usdtToBdtRate,
      data: allUsers.map((u) => mapUserFinancialsForAdmin(u, usdtToBdtRate)),
    });
  } catch (error) {
    console.error('Update SubAdmin Error:', error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export const changePasswordBySelf = async (req, res) => {
  const { id } = req; // Sub-admin ID (admin making the change)
  try {
    const { oldPassword, newPassword } = req.body;
    const subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }

    // Validate new password: must contain letters AND numbers, NO special characters
    // const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;
    // if (!passwordRegex.test(newPassword)) {
    //   return res.status(400).json({
    //     message:
    //       'Password must be at least 8 characters with both letters and numbers. Special characters are not allowed.',
    //   });
    // }

    const isMatch = await bcrypt.compare(oldPassword, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old Password Wrong !' });
    }
    subAdmin.password = newPassword;
    await subAdmin.save();
    await passwordHistory.create({
      userName: subAdmin.userName,
      remark: 'Password Changed By Self.',
      userId: id,
    });
    return res
      .status(200)
      .json({ message: 'Password changed successfully', data: subAdmin });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};
export const changePasswordByDownline = async (req, res) => {
  const adminId = req.id; // Sub-admin ID (admin making the change)
  try {
    const { oldPassword, newPassword, id } = req.body;
    const Admin = await SubAdmin.findById(adminId);
    const subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }

    // Validate new password: must contain letters AND numbers, NO special characters
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters with both letters and numbers. Special characters are not allowed.',
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, Admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'master Password Wrong !' });
    }
    subAdmin.password = newPassword;
    await subAdmin.save();
    await passwordHistory.create({
      userName: subAdmin.userName,
      remark: `Password Changed By ${Admin.userName}`,
      userId: id,
    });
    return res
      .status(200)
      .json({ message: 'Password changed successfully', data: subAdmin });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res
      .status(500)
      .json({ message: error.message, error: error.message });
  }
};

export const getPasswordHistoryByUserId = async (req, res) => {
  const { id } = req; // Sub-admin ID (admin making the change)
  try {
    // passed in route as /credit-ref-history/:userId
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {
      userId: id,
    };

    const data = await passwordHistory
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await passwordHistory.countDocuments(filter);

    return res.status(200).json({
      message: 'Password History fetched successfully',
      data,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching creditRefHistory:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      success: false,
    });
  }
};

export const getAgentTransactionHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const { id } = req;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'User ID is required' });
    }

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' });
    }

    // Collect all downline invite codes recursively (all levels)
    const allDownlineCodes = new Set([admin.code]);
    const codesToProcess = [admin.code];

    while (codesToProcess.length > 0) {
      const currentCode = codesToProcess.pop();
      const downlines = await SubAdmin.find(
        { invite: currentCode, status: { $ne: 'delete' } },
        { code: 1, role: 1 }
      ).lean();

      for (const dl of downlines) {
        if (dl.code && dl.role !== 'user') {
          allDownlineCodes.add(dl.code);
          codesToProcess.push(dl.code);
        }
      }
    }

    // Match transactions at ALL levels + own transactions from upline
    const filter = {
      $or: [{ invite: { $in: [...allDownlineCodes] } }, { userId: id }],
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lte: end };
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit) || 10), 100);

    const totalCount = await TransactionHistory.countDocuments(filter);

    const transactions = await TransactionHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Privacy: replace from/to with relative labels and strip upline identifiers
    const adminUserName = admin.userName;
    const maskedTransactions = transactions.map((txn) => {
      const masked = { ...txn };

      // Always remove invite code — it reveals upline identity
      delete masked.invite;

      if (masked.from === adminUserName) {
        // Current admin performed this transaction on a downline
        masked.from = 'You';
      } else if (masked.to === adminUserName) {
        // Upline performed this transaction on current admin
        masked.from = 'Upline';
        masked.to = 'You';
      }
      // Otherwise: transaction between downlines — show actual names
      return masked;
    });

    const usdtToBdtRate = await getUsdtToBdtRate();
    const data = await mapTransactionsForAdmin(
      maskedTransactions,
      usdtToBdtRate
    );

    return res.status(200).json({
      success: true,
      data,
      usdtToBdtRate,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalRecords: totalCount,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAgentOwnTransactionHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    console.log("start date is:", startDate);
    console.log("end date is:", endDate);
    const id = req.id || req.body?.id;

    console.log("own id is:", id);

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'User ID is required' });
    }

    const admin = await SubAdmin.findById(id, { userName: 1 }).lean();
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' });
    }

    const filter = {
      $or: [{ from: admin.userName }, { to: admin.userName }],
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit) || 10), 100);

    console.log("filter is:", filter);

    const totalCount = await TransactionHistory.countDocuments(filter);

    const transactions = await TransactionHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const maskedTransactions = transactions.map((txn) => {
      const masked = { ...txn };

      delete masked.invite;

      // Apply masking based on the transaction's from/to fields
      // and the "current user" recorded on that transaction.
      const you = admin.userName;

      if (masked.from === you) {
        masked.from = you;
      } else if (masked.to === you) {
        masked.from = 'Upline';
        masked.to = you;
      }

      return masked;
    });

    const usdtToBdtRate = await getUsdtToBdtRate();
    const data = await mapTransactionsForAdmin(
      maskedTransactions,
      usdtToBdtRate
    );

    return res.status(200).json({
      success: true,
      data,
      usdtToBdtRate,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalRecords: totalCount,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/** Only transactions where target user is from or to (no downline tree). */
export const getUserOwnTransactionHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 100 } = req.query;
    const { userId } = req.params;
    const { id: adminId } = req;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: 'User ID is required' });
    }

    const admin = await SubAdmin.findById(adminId, {
      code: 1,
      userName: 1,
      role: 1,
    }).lean();
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' });
    }

    const targetUser = await SubAdmin.findById(userId, { invite: 1, userName: 1 }).lean();
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (String(userId) !== String(adminId) && admin.role !== 'superadmin') {
      let isDownline = false;
      let currentInvite = targetUser.invite;
      let depth = 0;
      while (currentInvite && depth < 10) {
        if (currentInvite === admin.code) {
          isDownline = true;
          break;
        }
        const parent = await SubAdmin.findOne(
          { code: currentInvite },
          { invite: 1 }
        ).lean();
        if (!parent) break;
        currentInvite = parent.invite;
        depth++;
      }
      if (!isDownline) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const you = targetUser.userName;
    const filter = {
      $or: [{ from: you }, { to: you }],
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit) || 100), 500);
    const totalCount = await TransactionHistory.countDocuments(filter);

    const transactions = await TransactionHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const adminUserName = admin.userName;
    const maskedTransactions = transactions.map((txn) => {
      const masked = { ...txn };
      delete masked.invite;

      if (String(userId) === String(adminId)) {
        if (masked.from === you) {
          masked.from = you;
        } else if (masked.to === you) {
          masked.from = 'Upline';
          masked.to = you;
        }
      } else {
        if (masked.from === adminUserName) masked.from = 'You';
        if (
          masked.to === you &&
          masked.from !== adminUserName &&
          masked.from !== 'deposit-reject'
        ) {
          masked.from = 'Upline';
        }
      }
      return masked;
    });

    const usdtToBdtRate = await getUsdtToBdtRate();
    const data = await mapTransactionsForAdmin(
      maskedTransactions,
      usdtToBdtRate
    );

    return res.status(200).json({
      success: true,
      data,
      usdtToBdtRate,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalRecords: totalCount,
    });
  } catch (error) {
    console.error('Error fetching user own transactions:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getUserTransactionHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const { userId } = req.params;
    const { id } = req; // Authenticated admin ID from middleware

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: 'User ID is required' });
    }

    // Verify the authenticated admin exists
    const admin = await SubAdmin.findById(id, {
      code: 1,
      userName: 1,
      role: 1,
    }).lean();
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' });
    }

    // Verify target user exists and is a downline of the authenticated admin
    const targetUser = await SubAdmin.findById(userId, {
      invite: 1,
      userName: 1,
      code: 1,
      role: 1,
    }).lean();
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // superadmin can view any user; others must prove downline ownership
    if (admin.role !== 'superadmin') {
      // Traverse upward from target user to verify the admin is an ancestor
      let isDownline = false;
      let currentInvite = targetUser.invite;
      const maxDepth = 10; // Safety limit to prevent infinite loops
      let depth = 0;

      while (currentInvite && depth < maxDepth) {
        if (currentInvite === admin.code) {
          isDownline = true;
          break;
        }
        const parent = await SubAdmin.findOne(
          { code: currentInvite },
          { invite: 1, code: 1 }
        ).lean();
        if (!parent) break;
        currentInvite = parent.invite;
        depth++;
      }

      if (!isDownline) {
        return res
          .status(403)
          .json({ success: false, message: 'Access denied' });
      }
    }

    // Collect target user's own code + all downline invite codes recursively
    const allDownlineCodes = new Set([targetUser.code]);
    const codesToProcess = [targetUser.code];

    while (codesToProcess.length > 0) {
      const currentCode = codesToProcess.pop();
      const downlines = await SubAdmin.find(
        { invite: currentCode, status: { $ne: 'delete' } },
        { code: 1, role: 1 }
      ).lean();

      for (const dl of downlines) {
        if (dl.code && dl.role !== 'user') {
          allDownlineCodes.add(dl.code);
          codesToProcess.push(dl.code);
        }
      }
    }

    // Match: target user's own transactions + all downline transactions
    const filter = {
      $or: [{ invite: { $in: [...allDownlineCodes] } }, { userId: userId }],
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit) || 10), 100);

    const totalCount = await TransactionHistory.countDocuments(filter);

    const transactions = await TransactionHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Privacy: mask upline references and strip invite codes
    const adminUserName = admin.userName;
    const targetUserName = targetUser.userName;
    const maskedTransactions = transactions.map((txn) => {
      const masked = { ...txn };

      // Always remove invite code — it reveals upline identity
      delete masked.invite;

      // If someone sent funds TO the target user and it wasn't the viewing admin,
      // mask the sender as 'Upline' to hide superior identity
      if (
        masked.from !== 'deposit-reject' &&
        masked.to === targetUserName &&
        masked.from !== adminUserName
      ) {
        masked.from = 'Upline';
      }

      // If the viewing admin performed the transaction, label as 'You'
      if (masked.from === adminUserName) {
        masked.from = 'You';
      }

      return masked;
    });

    const usdtToBdtRate = await getUsdtToBdtRate();
    const data = await mapTransactionsForAdmin(
      maskedTransactions,
      usdtToBdtRate
    );

    return res.status(200).json({
      success: true,
      data,
      usdtToBdtRate,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalRecords: totalCount,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAllDownlineBets = async (req, res) => {
  try {
    const { id } = req.body;
    const { startDate, endDate, page, limit, selectedGame, selectedVoid } =
      req.query;

  

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' });
    }

console.log("admin is:", admin);


    let queue = [admin.code];
    let userIds = [admin._id];

    while (queue.length > 0) {
      const currentCode = queue.shift();

      const downlineUsers = await SubAdmin.find({
        invite: currentCode,
        status: { $ne: 'delete' },
      });

      for (const user of downlineUsers) {
        if (user.role === 'user') {
          userIds.push(user._id); // Collect user ID for bet query
        } else {
          // Add agent/admin code to queue to go deeper
          queue.push(user.code);
        }
      }
    }

    const filter = { userId: { $in: userIds.map((uid) => String(uid)) } };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lte: end };
    }

    if (selectedGame) {
      filter.gameName = selectedGame;
    }
    // Filter by selectedVoid if provided
    if (selectedVoid === 'settel') {
      filter.status = { $ne: 0 };
    } else if (selectedVoid === 'void') {
      filter.status = 3;
    } else if (selectedVoid === 'unsettel') {
      filter.status = 0;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    console.log("filter is:", filter);

    // Fetch bets for all collected users
    const betData = await betHistoryModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

console.log("betData is:", betData);

    const totalCount = await betHistoryModel.countDocuments(filter);

    const usdtToBdtRate = await getUsdtToBdtRate();
    const betUserIds = [
      ...new Set(betData.map((b) => String(b.userId || '')).filter(Boolean)),
    ];
    const betUsers = betUserIds.length
      ? await SubAdmin.find({ _id: { $in: betUserIds } })
          .select('currency')
          .lean()
      : [];
    const currencyByBetUser = new Map(
      betUsers.map((u) => [String(u._id), u.currency || 'BDT'])
    );

    const data = betData.map((bet) => {
      const plain = typeof bet.toObject === 'function' ? bet.toObject() : bet;
      const c = currencyByBetUser.get(String(plain.userId)) || 'BDT';
      return mapSportsBetHistoryForAdmin(plain, c, usdtToBdtRate);
    });

    return res.status(200).json({
      success: true,
      usdtToBdtRate,
      totalUsers: userIds.length,
      totalBets: betData.length,
      data,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error('Error fetching bets:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

export const parentsDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const beta = await SubAdmin.findById(id);
    if (!beta) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const papa = (await SubAdmin.findOne({ code: beta.invite })) || null;
    const dada = papa ? await SubAdmin.findOne({ code: papa.invite }) : null;

    const dataArray = [beta];
    if (papa) dataArray.push(papa);
    if (dada) dataArray.push(dada);

    const usdtToBdtRate = await getUsdtToBdtRate();

    return res.status(200).json({
      success: true,
      message: 'Parent details fetched successfully',
      usdtToBdtRate,
      data: dataArray.map((u) => mapUserFinancialsForAdmin(u, usdtToBdtRate)),
    });
  } catch (error) {
    console.error('Error fetching parent details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const updateGameLock = async (req, res) => {
  try {
    const { id } = req.params;
    const { game, lock } = req.body;

    // Validate input
    if (typeof lock !== 'boolean' || typeof game !== 'string') {
      return res.status(400).json({
        success: false,
        message:
          "Invalid input. 'game' must be a string and 'lock' must be boolean.",
      });
    }

    const admin = await SubAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const gameIndex = admin.gamelock.findIndex((g) => g.game === game);
    if (gameIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Game not found in user's gamelock list",
      });
    }

    // Server-side parent-lock validation: cannot enable a game the parent has disabled
    if (lock === true && admin.invite) {
      const parent = await SubAdmin.findOne({ code: admin.invite });
      if (parent) {
        const parentGameEntry = parent.gamelock.find((g) => g.game === game);
        if (parentGameEntry && parentGameEntry.lock === false) {
          return res.status(403).json({
            success: false,
            message: `Cannot enable '${game}' because it is locked by a higher-level admin`,
          });
        }
      }
    }

    admin.gamelock[gameIndex].lock = lock;
    admin.markModified('gamelock');
    await admin.save();

    // User-level update
    if (admin.role === 'user') {
      return res.status(200).json({
        success: true,
        message: `Lock status for ${admin.gamelock[gameIndex].game} updated successfully`,
        gamelock: admin.gamelock,
      });
    }
    // Agent/Admin hierarchical update
    else {
      let queue = [admin.code];
      let skippedUsers = 0;
      while (queue.length > 0) {
        const currentCode = queue.shift();

        const downlineUsers = await SubAdmin.find({
          invite: currentCode,
          status: { $ne: 'delete' },
        });

        for (const user of downlineUsers) {
          const userGameIndex = user.gamelock.findIndex((g) => g.game === game);
          if (userGameIndex === -1) {
            // Skip users missing this game entry instead of aborting the whole traversal
            skippedUsers++;
            if (user.code) {
              queue.push(user.code);
            }
            continue;
          }

          if (lock === false) {
            // Locking: always propagate lock down
            user.gamelock[userGameIndex].lock = false;
          } else {
            // Unlocking: only unlock if user's direct parent has the game enabled
            const directParent = await SubAdmin.findOne({ code: user.invite });
            if (directParent) {
              const parentEntry = directParent.gamelock.find(
                (g) => g.game === game
              );
              if (parentEntry && parentEntry.lock === true) {
                user.gamelock[userGameIndex].lock = true;
              }
              // If parent still has it locked, don't unlock this user
            }
          }

          user.markModified('gamelock');
          console.log(
            `🚨 [USER-SAVE] subAdminController saving user ${user.userName}`
          );
          await user.save();

          if (user.code) {
            queue.push(user.code);
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: `Game locked successfully`,
        gamelock: admin.gamelock,
        details: {
          game,
          lock,
          skippedUsers,
        },
      });
    }
  } catch (error) {
    console.error('Error updating game lock:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getUserCompleteInfo = async (req, res) => {
  try {
    console.log("getUserCompleteInfo is called");
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

    const usdtToBdtRate = await getUsdtToBdtRate();
    const userCurrency = user.currency || 'BDT';
    const mappedUser = mapUserFinancialsForAdmin(user, usdtToBdtRate);

    // Get parent/upline information
    const parent = user.invite ? await SubAdmin.findOne({ code: user.invite }) : null;
    const grandParent = parent && parent.invite ? await SubAdmin.findOne({ code: parent.invite }) : null;

    // Get direct downlines
    const directDownlines = await SubAdmin.find({ 
      invite: user.code, 
      status: { $ne: "delete" } 
    });

    const totalUserDownlineBalance = await getTotalUserDownlineBalance(
      user.code,
      usdtToBdtRate
    );

    // Calculate downline statistics (all amounts in BDT for admin)
    const downlineStats = {
      totalDirectDownlines: directDownlines.length,
      activeDownlines: directDownlines.filter(u => u.status === "active").length,
      inactiveDownlines: directDownlines.filter(u => u.status === "inactive").length,
      totalDownlineBalance: directDownlines.reduce(
        (sum, u) => sum + amountToAdminBdt(u.balance, u.currency, usdtToBdtRate),
        0
      ),
      totalDownlineAvBalance: directDownlines.reduce(
        (sum, u) => sum + amountToAdminBdt(u.avbalance, u.currency, usdtToBdtRate),
        0
      ),
      totalDownlineExposure: directDownlines.reduce(
        (sum, u) => sum + amountToAdminBdt(u.exposure, u.currency, usdtToBdtRate),
        0
      ),
      totalUserDownlineBalance,
    };

    //  CALCULATE NEW VALUES (BDT)
    const totalDownlineAvBalanceValue = downlineStats.totalDownlineAvBalance;
    const agentAvbalanceValue =
      amountToAdminBdt(mappedUser.totalAvbalance, userCurrency, usdtToBdtRate) +
      amountToAdminBdt(mappedUser.balance, userCurrency, usdtToBdtRate);

    // Get user's transaction history (last 10)
    const recentTransactionsRaw = await TransactionHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const recentTransactions = await mapTransactionsForAdmin(
      recentTransactionsRaw,
      usdtToBdtRate
    );

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

    // Calculate additional statistics (BDT)
    const financialStats = {
      totalCreditGiven: recentTransactions
        .filter(t => t.deposite > 0)
        .reduce((sum, t) => sum + t.deposite, 0),
      totalCreditTaken: recentTransactions
        .filter(t => t.withdrawl > 0)
        .reduce((sum, t) => sum + t.withdrawl, 0),
      totalBetsPlaced: bettingHistory.length,
      totalBetAmount: bettingHistory.reduce(
        (sum, bet) =>
          sum + amountToAdminBdt(bet.betAmount, userCurrency, usdtToBdtRate),
        0
      ),
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
        currency: userCurrency,
        account: user.account,
        code: user.code,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },

      //  FINANCIAL INFORMATION (amounts in BDT for admin)
      financialInfo: {
        currency: userCurrency,
        balance: mappedUser.balance,
        avbalance: mappedUser.avbalance,
        totalBalance: mappedUser.totalBalance,
        totalAvbalance: totalDownlineAvBalanceValue,
        agentAvbalance: agentAvbalanceValue,
        creditReference: mappedUser.creditReference,
        profitLoss: mappedUser.profitLoss,
        exposure: mappedUser.exposure,
        totalExposure: mappedUser.totalExposure,
        exposureLimit: amountToAdminBdt(
          user.exposureLimit,
          userCurrency,
          usdtToBdtRate
        ),
        commission: user.commission,
        rollingCommission: mappedUser.rollingCommission,
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
        sessionToken:
          (user.sessionTokens && user.sessionTokens.length > 0) || user.sessionToken
            ? 'Active'
            : 'Inactive',
        lastLogin: user.lastLogin,
        lastDevice: user.lastDevice,
        lastIP: user.lastIP,
      },

      // Hierarchy and relationships
      hierarchyInfo,

      // Downline information
      downlineInfo: {
        stats: downlineStats,
        directDownlines: directDownlines.map((d) => {
          const m = mapUserFinancialsForAdmin(d, usdtToBdtRate);
          return {
            id: d._id,
            name: d.name,
            userName: d.userName,
            role: d.role,
            currency: m.currency,
            balance: m.balance,
            avbalance: m.avbalance,
            status: d.status,
            createdAt: d.createdAt,
          };
        }),
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
      usdtToBdtRate,
      data: completeUserInfo,
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

/** Lightweight profile for my-account pages (no updateAdmin / downline aggregation). */
export const getUserProfileLight = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await SubAdmin.findById(userId).select(
      "name userName email phone role balance avbalance totalBalance status currency"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const usdtToBdtRate = await getUsdtToBdtRate();
    const mapped = mapUserFinancialsForAdmin(user, usdtToBdtRate);

    return res.status(200).json({
      success: true,
      usdtToBdtRate,
      data: {
        basicInfo: {
          name: user.name,
          userName: user.userName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          currency: mapped.currency || user.currency || 'BDT',
        },
        financialInfo: {
          balance: mapped.balance,
          avbalance: mapped.avbalance,
          totalBalance: mapped.totalBalance,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching light profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};





const getTotalUserDownlineBalance = async (parentCode, rate = 0) => {
  let total = 0;

  const downlines = await SubAdmin.find({
    invite: parentCode,
    status: { $ne: 'delete' },
  });

  for (const d of downlines) {
    if (d.role === 'user') {
      total += amountToAdminBdt(d.balance, d.currency, rate);
    }
    total += await getTotalUserDownlineBalance(d.code, rate);
  }

  return total;
};

/** Collect invite codes for admin + all non-user downlines (BFS). */
const collectDownlineInviteCodes = async (rootCode) => {
  const codes = new Set([rootCode]);
  const queue = [rootCode];

  while (queue.length > 0) {
    const code = queue.shift();
    const children = await SubAdmin.find(
      { invite: code, status: { $ne: 'delete' }, role: { $ne: 'user' } },
      { code: 1 }
    ).lean();

    for (const child of children) {
      if (child.code && !codes.has(child.code)) {
        codes.add(child.code);
        queue.push(child.code);
      }
    }
  }

  return codes;
};

const buildUpperlineChain = (user, codeToParent) => {
  const upperline = [];
  let invite = user.invite;
  let depth = 0;

  while (invite && depth < 20) {
    const parent = codeToParent.get(invite);
    if (!parent) break;
    upperline.push({ role: parent.role, userName: parent.userName });
    invite = parent.invite;
    depth += 1;
  }

  return upperline;
};

/** Locked end-users (status=locked) for Bet Lock User admin page. */
export const getLockedUsers = async (req, res) => {
  try {
    const { id, role } = req;
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(
      Math.max(1, parseInt(req.query.limit, 10) || 10),
      100
    );

    const admin = await SubAdmin.findById(id, { code: 1, role: 1 }).lean();
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    const filter = {
      status: 'locked',
      role: 'user',
    };

    if (role !== 'superadmin') {
      const codes = await collectDownlineInviteCodes(admin.code);
      filter.invite = { $in: [...codes] };
    }

    const totalRecords = await SubAdmin.countDocuments(filter);
    const lockedUsers = await SubAdmin.find(filter)
      .select(
        'userName name remark invite role status balance avbalance exposure creditReference currency updatedAt createdAt'
      )
      .sort({ updatedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const parents = await SubAdmin.find(
      { status: { $ne: 'delete' }, role: { $ne: 'user' } },
      { code: 1, invite: 1, userName: 1, role: 1 }
    ).lean();

    const codeToParent = new Map();
    for (const p of parents) {
      if (p.code) codeToParent.set(p.code, p);
    }

    const usdtToBdtRate = await getUsdtToBdtRate();
    const data = lockedUsers.map((user) => {
      const m = mapUserFinancialsForAdmin(user, usdtToBdtRate);
      return {
        _id: user._id,
        userName: user.userName,
        name: user.name || '',
        role: user.role,
        status: user.status,
        currency: m.currency,
        balance: m.balance ?? 0,
        avbalance: m.avbalance ?? 0,
        exposure: m.exposure ?? 0,
        creditReference: m.creditReference ?? 0,
        remark: user.remark || '-',
        upperline: buildUpperlineChain(user, codeToParent),
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      usdtToBdtRate,
      data,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalRecords / limitNum) || 1,
      totalRecords,
    });
  } catch (error) {
    console.error('Error fetching locked users:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getDuplicateIPUsers = async (req, res) => {
  try {
    console.log("getDuplicateIPUsers is called");
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
