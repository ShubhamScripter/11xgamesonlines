import DepositHistory from '../models/depositeHistoryModel.js';
import ManualDepositAccount from '../models/manualDepositAccountModel.js';
import ManualDepositRequest from '../models/manualDepositRequestModel.js';
import SubAdmin from '../models/subAdminModel.js';
import { sendBalanceUpdates, sendToUser, sendUserRefresh } from '../socket/bettingSocket.js';
import TransactionHistory from '../models/transtionHistoryModel.js';
import WithdrawalHistory from '../models/withdrawalHistoryModel.js';

const VALID_METHODS = ['bank', 'upi', 'crypto', 'whatsapp'];

const parseDetailsPayload = (details) => {
  if (!details) return {};
  if (typeof details === 'string') {
    try {
      return JSON.parse(details);
    } catch {
      return {};
    }
  }
  return details;
};

/** Always store in DB as `/uploads/...` only (no host). Strip full URLs on save/read. */
const toUploadPathOnly = (value) => {
  if (value == null || value === '') return value;
  const s = String(value).trim();
  if (!s) return s;
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      const p = u.pathname || '';
      return p.startsWith('/') ? p : `/${p}`;
    } catch {
      return s;
    }
  }
  return s.startsWith('/') ? s : `/${s}`;
};

/** API response: path only (`/uploads/...`) so clients can prepend their own static host. */
const withResolvedAccountImage = (_req, accountDoc) => {
  if (!accountDoc) return accountDoc;
  const account = accountDoc.toObject ? accountDoc.toObject() : { ...accountDoc };
  if (account?.details?.qrCodeUrl) {
    account.details = {
      ...account.details,
      qrCodeUrl: toUploadPathOnly(account.details.qrCodeUrl),
    };
  }
  return account;
};

const parseIsActive = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  // multipart/form-data me boolean aksar "true"/"false" string me aata hai
  const s = String(value).trim().toLowerCase();
  if (s === 'true' || s === '1') return true;
  if (s === 'false' || s === '0') return false;
  // fallback: numeric
  return Boolean(Number(s));
};

export const createManualDepositAccount = async (req, res) => {
  try {
    const { method, title, isActive = true } = req.body;
    const details = parseDetailsPayload(req.body.details);
    const uploadedImage = req.file;

    if (!VALID_METHODS.includes(method)) {
      return res.status(400).json({ message: 'Invalid deposit method.' });
    }
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    if (method === 'upi' && uploadedImage) {
      details.qrCodeUrl = `/uploads/deposit-accounts/${uploadedImage.filename}`;
    } else if (details.qrCodeUrl) {
      details.qrCodeUrl = toUploadPathOnly(details.qrCodeUrl);
    }

    const account = await ManualDepositAccount.create({
      method,
      title: String(title).trim(),
      details,
      isActive: parseIsActive(isActive),
      createdBy: req.admin || 'admin',
      updatedBy: req.admin || 'admin',
    });

    return res.status(201).json({
      success: true,
      message: 'Manual deposit account created.',
      data: withResolvedAccountImage(req, account),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateManualDepositAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { method, title, isActive } = req.body;
    const details = parseDetailsPayload(req.body.details);
    const uploadedImage = req.file;

    const account = await ManualDepositAccount.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Deposit account not found.' });
    }

    if (method !== undefined) {
      if (!VALID_METHODS.includes(method)) {
        return res.status(400).json({ message: 'Invalid deposit method.' });
      }
      account.method = method;
    }
    if (title !== undefined) account.title = String(title).trim();
    if (req.body.details !== undefined) {
      account.details = details;
      if (account.details?.qrCodeUrl && !uploadedImage) {
        account.details.qrCodeUrl = toUploadPathOnly(account.details.qrCodeUrl);
      }
    }
    if (account.method === 'upi' && uploadedImage) {
      account.details = {
        ...(account.details || {}),
        qrCodeUrl: `/uploads/deposit-accounts/${uploadedImage.filename}`,
      };
    }
    if (isActive !== undefined) {
      const parsedIsActive = parseIsActive(isActive);
      account.isActive = parsedIsActive;
    }
    account.updatedBy = req.admin || 'admin';

    await account.save();

    return res.status(200).json({
      success: true,
      message: 'Manual deposit account updated.',
      data: withResolvedAccountImage(req, account),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteManualDepositAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await ManualDepositAccount.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Deposit account not found.' });
    }

    await ManualDepositAccount.findByIdAndDelete(accountId);

    return res.status(200).json({
      success: true,
      message: 'Manual deposit account deleted.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getManualDepositAccountsForAdmin = async (_req, res) => {
  try {
    const accounts = await ManualDepositAccount.find({}).sort({
      method: 1,
      createdAt: -1,
    });

    const resolvedAccounts = accounts.map((account) =>
      withResolvedAccountImage(_req, account)
    );

    return res.status(200).json({
      success: true,
      data: resolvedAccounts,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getManualDepositAccountsForUser = async (req, res) => {
  try {
    const { method } = req.query;
    const filter = { isActive: true };
    if (method) {
      if (!VALID_METHODS.includes(method)) {
        return res.status(400).json({ message: 'Invalid deposit method.' });
      }
      filter.method = method;
    }

    const accounts = await ManualDepositAccount.find(filter).sort({
      method: 1,
      createdAt: -1,
    });

    const resolvedAccounts = accounts.map((account) =>
      withResolvedAccountImage(req, account)
    );

    return res.status(200).json({
      success: true,
      data: resolvedAccounts,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createManualDepositRequest = async (req, res) => {
  try {
    const userId = req.id;
    const {
      requestType = 'deposit',
      amount,
      method,
      accountId,
      referenceId,
      paymentNote,
      bonusType,
      withdrawDetails,
    } = req.body;
    const uploadedImage = req.file;

    const parsedAmount = Number(amount);
    if (!parsedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount.' });
    }
    if (!['deposit', 'withdraw'].includes(requestType)) {
      return res.status(400).json({ message: 'Invalid request type.' });
    }
    const normalizedMethod =
      requestType === 'withdraw' ? String(method || 'bank') : String(method || '');
    if (!VALID_METHODS.includes(normalizedMethod)) {
      return res.status(400).json({ message: 'Invalid deposit method.' });
    }
    if (requestType === 'deposit' && !uploadedImage) {
      return res.status(400).json({ message: 'Payment screenshot is required.' });
    }

    const user = await SubAdmin.findById(userId);
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'User not found.' });
    }

    let finalAccountId = null;
    let accountSnapshot = {};

    if (requestType === 'withdraw') {
      const wd = parseDetailsPayload(withdrawDetails);

      if (normalizedMethod === 'bank') {
        const requiredFields = [
          'accountHolderName',
          'accountNumber',
          'confirmAccountNumber',
          'bankName',
          'ifscCode',
        ];
        for (const field of requiredFields) {
          if (!String(wd?.[field] || '').trim()) {
            return res.status(400).json({
              message: `Please provide ${field}.`,
            });
          }
        }
        if (
          String(wd.accountNumber).trim() !== String(wd.confirmAccountNumber).trim()
        ) {
          return res
            .status(400)
            .json({ message: 'Account number and confirm account number must match.' });
        }
        accountSnapshot = {
          title: 'User Withdraw Bank Details',
          details: {
            method: normalizedMethod,
            accountHolderName: String(wd.accountHolderName).trim(),
            accountNumber: String(wd.accountNumber).trim(),
            bankName: String(wd.bankName).trim(),
            branchName: String(wd.branchName || '').trim(),
            ifscCode: String(wd.ifscCode).trim(),
          },
        };
      } else if (normalizedMethod === 'upi') {
        if (!String(wd?.upiId || '').trim()) {
          return res.status(400).json({ message: 'Please provide upiId.' });
        }
        accountSnapshot = {
          title: 'User Withdraw UPI Details',
          details: {
            method: normalizedMethod,
            upiId: String(wd.upiId).trim(),
          },
        };
      } else if (normalizedMethod === 'crypto') {
        if (!String(wd?.walletAddress || '').trim()) {
          return res.status(400).json({ message: 'Please provide walletAddress.' });
        }
        if (!String(wd?.network || '').trim()) {
          return res.status(400).json({ message: 'Please provide network.' });
        }
        accountSnapshot = {
          title: 'User Withdraw Crypto Details',
          details: {
            method: normalizedMethod,
            walletAddress: String(wd.walletAddress).trim(),
            network: String(wd.network).trim(),
          },
        };
      } else if (normalizedMethod === 'whatsapp') {
        if (!String(wd?.phoneNumber || '').trim()) {
          return res.status(400).json({ message: 'Please provide phoneNumber.' });
        }
        accountSnapshot = {
          title: 'User Withdraw WhatsApp Details',
          details: {
            method: normalizedMethod,
            phoneNumber: String(wd.phoneNumber).trim(),
          },
        };
      }
    } else {
      const account = await ManualDepositAccount.findOne({
        _id: accountId,
        method: normalizedMethod,
        isActive: true,
      });
      if (!account) {
        return res
          .status(400)
          .json({ message: 'Selected account is invalid or inactive.' });
      }
      finalAccountId = account._id;
      accountSnapshot = {
        title: account.title,
        details: account.details,
      };
    }

    const paymentImageUrl =
      requestType === 'deposit' && uploadedImage
        ? `/uploads/deposits/${uploadedImage.filename}`
        : '';

    const request = await ManualDepositRequest.create({
      userId: user._id,
      userName: user.userName,
      requestType,
      amount: parsedAmount,
      method: normalizedMethod,
      accountId: finalAccountId,
      accountSnapshot,
      referenceId,
      paymentNote,
      bonusType,
      paymentImageUrl,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message:
        requestType === 'withdraw'
          ? 'Withdraw request submitted. Please wait for admin approval.'
          : 'Deposit request submitted. Please wait for admin approval.',
      data: request,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyManualDepositRequests = async (req, res) => {
  try {
    const requests = await ManualDepositRequest.find({ userId: req.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getManualDepositRequestsForAdmin = async (req, res) => {
  try {
    const { status, method, userName, requestType } = req.query;
    const filter = {};

    if (status) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter.' });
      }
      filter.status = status;
    }
    if (method) {
      if (!VALID_METHODS.includes(method)) {
        return res.status(400).json({ message: 'Invalid method filter.' });
      }
      filter.method = method;
    }
    if (userName) {
      filter.userName = { $regex: String(userName).trim(), $options: 'i' };
    }
    if (requestType) {
      if (!['deposit', 'withdraw'].includes(requestType)) {
        return res.status(400).json({ message: 'Invalid request type filter.' });
      }
      filter.requestType = requestType;
    }

    const requests = await ManualDepositRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const reviewManualDepositRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, adminRemark } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action.' });
    }

    const requestDoc = await ManualDepositRequest.findById(requestId);
    if (!requestDoc) {
      return res.status(404).json({ message: 'Deposit request not found.' });
    }

    if (requestDoc.status !== 'pending') {
      return res
        .status(400)
        .json({ message: 'This request has already been reviewed.' });
    }

    const adminUser = await SubAdmin.findById(req.id).lean();
    const adminUserName = adminUser?.userName || req.admin || 'admin';

    if (action === 'reject') {
      requestDoc.status = 'rejected';
      requestDoc.adminRemark = adminRemark || 'Rejected by admin';
      requestDoc.approvedById = req.id;
      requestDoc.approvedByUserName = adminUserName;
      requestDoc.reviewedAt = new Date();
      await requestDoc.save();

      return res.status(200).json({
        success: true,
        message: 'Deposit request rejected.',
        data: requestDoc,
      });
    }

    const user = await SubAdmin.findById(requestDoc.userId);
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'Requested user does not exist.' });
    }

    const amount = Number(requestDoc.amount);
    const isWithdraw = requestDoc.requestType === 'withdraw';

    if (isWithdraw) {
      if (Number(user.avbalance || 0) < amount || Number(user.balance || 0) < amount) {
        return res.status(400).json({ message: 'Insufficient user balance for withdrawal.' });
      }
      user.balance -= amount;
      user.avbalance = Math.max(0, Number(user.avbalance || 0) - amount);
      user.baseBalance -= amount;
      user.creditReferenceProfitLoss = user.baseBalance - user.creditReference;
    } else {
      user.balance += amount;
      user.avbalance += amount;
      user.baseBalance += amount;
      user.creditReferenceProfitLoss = user.baseBalance - user.creditReference;
    }
    await user.save();

    // Push realtime wallet update to user's websocket clients
    const wsUserId = String(user._id);
    sendBalanceUpdates(wsUserId, Number(user.avbalance || 0));
    sendUserRefresh(wsUserId);
    // Extra direct push for robustness across different WS registration styles.
    sendToUser(wsUserId, {
      type: 'balance_update',
      userId: wsUserId,
      newBalance: Number(user.avbalance || 0),
    });
    sendToUser(wsUserId, {
      type: 'user_refresh_needed',
      userId: wsUserId,
    });

    if (isWithdraw) {
      await WithdrawalHistory.create({
        userName: user.userName,
        amount,
        remark: `Manual self withdraw approved (${requestDoc.method})`,
        invite: user.invite,
      });
      await TransactionHistory.create({
        userId: user._id,
        userName: user.userName,
        withdrawl: amount,
        deposite: 0,
        amount: user.avbalance,
        remark: `Manual self withdraw approved (${requestDoc.method})`,
        from: user.userName,
        to: 'self-withdraw',
        invite: user.invite,
      });
    } else {
      await DepositHistory.create({
        userName: user.userName,
        amount,
        remark: `Manual self deposit approved (${requestDoc.method})`,
        invite: user.invite,
      });
      await TransactionHistory.create({
        userId: user._id,
        userName: user.userName,
        withdrawl: 0,
        deposite: amount,
        amount: user.avbalance,
        remark: `Manual self deposit approved (${requestDoc.method})`,
        from: 'self-deposit',
        to: user.userName,
        invite: user.invite,
      });
    }

    requestDoc.status = 'approved';
    requestDoc.adminRemark = adminRemark || 'Approved by admin';
    requestDoc.approvedById = req.id;
    requestDoc.approvedByUserName = adminUserName;
    requestDoc.reviewedAt = new Date();
    await requestDoc.save();

    return res.status(200).json({
      success: true,
      message: isWithdraw
        ? 'Withdraw approved and wallet debited.'
        : 'Deposit approved and wallet credited.',
      data: requestDoc,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
