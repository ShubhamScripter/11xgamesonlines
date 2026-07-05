import DepositHistory from '../models/depositeHistoryModel.js';
import ManualDepositAccount from '../models/manualDepositAccountModel.js';
import ManualDepositRequest from '../models/manualDepositRequestModel.js';
import SubAdmin from '../models/subAdminModel.js';
import mongoose from 'mongoose';
import { sendBalanceUpdates, sendToUser, sendUserRefresh } from '../socket/bettingSocket.js';
import TransactionHistory from '../models/transtionHistoryModel.js';
import WithdrawalHistory from '../models/withdrawalHistoryModel.js';
import { persistUploadedImage } from '../services/cloudinaryService.js';
import {
  resolveAdminUploadUrl,
  resolvePublicUploadUrl,
  toUploadPathOnly,
} from '../utils/uploadUrl.js';
import {
  amountToAdminBdt,
  getUsdtToBdtRate,
} from '../utils/adminCurrency.js';
import {
  MAX_ACCOUNTS_PER_METHOD,
  VALID_DEPOSIT_METHODS,
  depositScreenshotRequired,
  isMobileBankingMethod,
  validateAdminAccountDetails,
  validateDepositReferenceId,
  validateUserDepositRequest,
  validateUserWithdrawRequest,
} from '../constants/manualDepositConstants.js';
import {
  buildOwnerAdminAccountFilter,
  countDepositAccounts,
  pickRandomDepositAccount,
} from '../utils/depositAccountDistribution.js';
import {
  claimFirstDepositBonusFlag,
  computeFirstDepositBonus,
  getFirstDepositBonusSettings,
  isFirstDepositEligible,
} from '../utils/firstDepositBonus.js';

const VALID_METHODS = VALID_DEPOSIT_METHODS;

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pipelineCreditBalance(amt) {
  return [
    {
      $set: {
        balance: { $add: ['$balance', amt] },
        baseBalance: { $add: ['$baseBalance', amt] },
        avbalance: { $add: ['$avbalance', amt] },
        exposureLimit: { $add: [{ $ifNull: ['$exposureLimit', 0] }, amt] },
        creditReferenceProfitLoss: {
          $subtract: [
            { $add: ['$baseBalance', amt] },
            { $ifNull: ['$creditReference', 0] },
          ],
        },
      },
    },
  ];
}

function pipelineDebitBalance(amt) {
  return [
    {
      $set: {
        balance: { $subtract: ['$balance', amt] },
        baseBalance: { $subtract: ['$baseBalance', amt] },
        avbalance: { $subtract: ['$avbalance', amt] },
        creditReferenceProfitLoss: {
          $subtract: [
            { $subtract: ['$baseBalance', amt] },
            { $ifNull: ['$creditReference', 0] },
          ],
        },
      },
    },
  ];
}

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

/** API response: full image URLs so user & admin apps on different hosts still work. */
const withResolvedAccountImage = (req, accountDoc) => {
  if (!accountDoc) return accountDoc;
  const account = accountDoc.toObject ? accountDoc.toObject() : { ...accountDoc };
  if (account?.details?.qrCodeUrl) {
    account.details = {
      ...account.details,
      qrCodeUrl: resolveAdminUploadUrl(account.details.qrCodeUrl, req),
    };
  }
  return account;
};

const withResolvedDepositRequest = (req, requestDoc) => {
  if (!requestDoc) return requestDoc;
  const row = requestDoc.toObject ? requestDoc.toObject() : { ...requestDoc };
  if (row.paymentImageUrl) {
    row.paymentImageUrl = resolvePublicUploadUrl(row.paymentImageUrl, req);
  }
  if (row.accountSnapshot?.details?.qrCodeUrl) {
    row.accountSnapshot = {
      ...row.accountSnapshot,
      details: {
        ...row.accountSnapshot.details,
        qrCodeUrl: resolveAdminUploadUrl(
          row.accountSnapshot.details.qrCodeUrl,
          req
        ),
      },
    };
  }
  return row;
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

    const existingCount = await ManualDepositAccount.countDocuments({
      method,
      $or: [{ createdById: req.id }, { createdById: null, createdBy: req.admin }],
    });
    if (existingCount >= MAX_ACCOUNTS_PER_METHOD) {
      return res.status(400).json({
        message: `Maximum ${MAX_ACCOUNTS_PER_METHOD} accounts allowed for ${method}.`,
      });
    }

    if (method === 'crypto' && uploadedImage) {
      details.qrCodeUrl = await persistUploadedImage(
        uploadedImage,
        'deposit-accounts'
      );
    } else if (details.qrCodeUrl) {
      details.qrCodeUrl = toUploadPathOnly(details.qrCodeUrl);
    }

    const validated = validateAdminAccountDetails(method, details, {
      hasQrImage: Boolean(uploadedImage),
      existingQrUrl: '',
    });
    if (!validated.ok) {
      return res.status(400).json({ message: validated.message });
    }

    const account = await ManualDepositAccount.create({
      method,
      title: String(title).trim(),
      details: validated.details,
      isActive: parseIsActive(isActive),
      createdBy: req.admin || 'admin',
      updatedBy: req.admin || 'admin',
      createdById: req.id || null,
      updatedById: req.id || null,
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
    if (
      (account.createdById && String(account.createdById) !== String(req.id)) ||
      (!account.createdById && account.createdBy && String(account.createdBy) !== String(req.admin))
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (method !== undefined) {
      if (!VALID_METHODS.includes(method)) {
        return res.status(400).json({ message: 'Invalid deposit method.' });
      }
      account.method = method;
    }
    if (title !== undefined) account.title = String(title).trim();
    if (req.body.details !== undefined) {
      const validated = validateAdminAccountDetails(
        account.method,
        { ...(account.details?.toObject?.() || account.details || {}), ...details },
        {
          hasQrImage: Boolean(uploadedImage),
          existingQrUrl: account.details?.qrCodeUrl || '',
        }
      );
      if (!validated.ok) {
        return res.status(400).json({ message: validated.message });
      }
      account.details = validated.details;
      if (account.details?.qrCodeUrl && !uploadedImage) {
        account.details.qrCodeUrl = toUploadPathOnly(account.details.qrCodeUrl);
      }
    }
    if (account.method === 'crypto' && uploadedImage) {
      account.details = {
        ...(account.details || {}),
        qrCodeUrl: await persistUploadedImage(
          uploadedImage,
          'deposit-accounts'
        ),
      };
    }
    if (isActive !== undefined) {
      const parsedIsActive = parseIsActive(isActive);
      account.isActive = parsedIsActive;
    }
    account.updatedBy = req.admin || 'admin';
    account.updatedById = req.id || null;

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
    if (
      (account.createdById && String(account.createdById) !== String(req.id)) ||
      (!account.createdById && account.createdBy && String(account.createdBy) !== String(req.admin))
    ) {
      return res.status(403).json({ message: 'Access denied.' });
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

export const getManualDepositAccountsForAdmin = async (req, res) => {
  try {
    const filter = {
      $or: [{ createdById: req.id }, { createdById: null, createdBy: req.admin }],
      method: { $in: VALID_DEPOSIT_METHODS },
    };
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

export const getManualDepositAccountsForUser = async (req, res) => {
  try {
    const { method } = req.query;
    const user = await SubAdmin.findById(req.id).lean();
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'User not found.' });
    }
    const ownerAdmin =
      user.invite ? await SubAdmin.findOne({ code: user.invite }).lean() : null;
    if (!ownerAdmin) {
      return res.status(400).json({ message: 'User upline admin not found.' });
    }

    if (method) {
      if (!VALID_METHODS.includes(method)) {
        return res.status(400).json({ message: 'Invalid deposit method.' });
      }

      const methodFilter = buildOwnerAdminAccountFilter(ownerAdmin, { method });
      const poolSize = await countDepositAccounts(ManualDepositAccount, methodFilter);
      const picked = await pickRandomDepositAccount(ManualDepositAccount, methodFilter);

      const resolvedAccounts = picked
        ? [withResolvedAccountImage(req, picked)]
        : [];

      return res.status(200).json({
        success: true,
        data: resolvedAccounts,
        meta: {
          pickMode: 'random',
          method,
          poolSize,
        },
      });
    }

    const filter = buildOwnerAdminAccountFilter(ownerAdmin);
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
      accountPassword,
      senderPhone,
    } = req.body;
    const uploadedImage = req.file;

    const parsedAmount = Number(amount);
    if (!parsedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount.' });
    }
    const amt = round2(parsedAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount.' });
    }
    if (!['deposit', 'withdraw'].includes(requestType)) {
      return res.status(400).json({ message: 'Invalid request type.' });
    }
    const normalizedMethod =
      requestType === 'withdraw'
        ? String(method || 'bkash')
        : String(method || '');
    if (!VALID_METHODS.includes(normalizedMethod)) {
      return res.status(400).json({ message: 'Invalid deposit method.' });
    }
    if (depositScreenshotRequired(normalizedMethod, requestType) && !uploadedImage) {
      return res.status(400).json({ message: 'Payment screenshot is required.' });
    }

    const user = await SubAdmin.findById(userId);
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'User not found.' });
    }
    const ownerAdmin =
      user.invite ? await SubAdmin.findOne({ code: user.invite }) : null;
    if (!ownerAdmin) {
      return res.status(400).json({ message: 'User upline admin not found.' });
    }

    let finalAccountId = null;
    let accountSnapshot = {};
    let trimmedDepositRef = '';

    if (requestType === 'withdraw') {
      if (!String(accountPassword || '').trim()) {
        return res.status(400).json({ message: 'Account password is required.' });
      }
      const passwordOk = await user.comparePassword(String(accountPassword));
      if (!passwordOk) {
        return res.status(401).json({ message: 'Invalid account password.' });
      }

      const wd = parseDetailsPayload(withdrawDetails);

      if (isMobileBankingMethod(normalizedMethod)) {
        const withdrawCheck = validateUserWithdrawRequest({
          method: normalizedMethod,
          amount: amt,
          withdrawable: user.avbalance,
          phoneNumber: wd?.phoneNumber,
          hasPassword: true,
        });
        if (!withdrawCheck.ok) {
          return res.status(400).json({ message: withdrawCheck.message });
        }
        accountSnapshot = {
          title: `User Withdraw ${normalizedMethod.toUpperCase()} Details`,
          details: {
            method: normalizedMethod,
            phoneNumber: withdrawCheck.phoneNumber,
            accountHolderName: String(wd?.accountHolderName || user.userName || '').trim(),
          },
        };
      } else {
        return res.status(400).json({
          message: 'Withdraw is only available via bKash, Nagad, or Rocket.',
        });
      }
    } else {
      const methodFilter = buildOwnerAdminAccountFilter(ownerAdmin, {
        method: normalizedMethod,
      });

      let account = null;
      if (accountId) {
        account = await ManualDepositAccount.findOne({
          ...methodFilter,
          _id: accountId,
        });
      }
      if (!account) {
        account = await pickRandomDepositAccount(ManualDepositAccount, methodFilter);
      }
      if (!account) {
        return res.status(400).json({
          message: `No active ${normalizedMethod} deposit account is configured.`,
        });
      }
      finalAccountId = account._id;
      accountSnapshot = {
        title: account.title,
        details: account.details,
      };

      const depositCheck = validateUserDepositRequest({
        method: normalizedMethod,
        amount: amt,
        referenceId,
        senderPhone,
        accountDetails: account.details,
        hasScreenshot: Boolean(uploadedImage),
      });
      if (!depositCheck.ok) {
        return res.status(400).json({ message: depositCheck.message });
      }
      trimmedDepositRef = depositCheck.referenceId;
    }

    if (requestType === 'deposit' && trimmedDepositRef) {
      const dup = await ManualDepositRequest.findOne({
        requestType: 'deposit',
        status: { $in: ['pending', 'approved'] },
        referenceId: new RegExp(`^${escapeRegex(trimmedDepositRef)}$`, 'i'),
      }).lean();
      if (dup) {
        return res.status(400).json({
          message:
            'Duplicate transaction ID. This reference is already used in a pending or approved deposit request.',
        });
      }
    }

    const mergedNote = [
      paymentNote,
      senderPhone && isMobileBankingMethod(normalizedMethod)
        ? `Sender: +${String(senderPhone).replace(/\D/g, '')}`
        : '',
    ]
      .filter(Boolean)
      .join(' | ')
      .trim();

    const paymentImageUrl =
      requestType === 'deposit' && uploadedImage
        ? await persistUploadedImage(uploadedImage, 'deposits')
        : '';

    // If withdraw request: debit wallet immediately (even while request stays pending).
    let debitedUser = null;
    if (requestType === 'withdraw') {
      debitedUser = await SubAdmin.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(String(userId)),
          role: 'user',
          status: 'active',
          avbalance: { $gte: amt },
          balance: { $gte: amt },
        },
        pipelineDebitBalance(amt),
        { new: true }
      );

      if (!debitedUser) {
        return res.status(400).json({ message: 'Insufficient balance for withdrawal.' });
      }
    }

    let request;
    try {
      request = await ManualDepositRequest.create({
        userId: user._id,
        userName: user.userName,
        requestType,
        amount: amt,
        method: normalizedMethod,
        accountId: finalAccountId,
        accountSnapshot,
        referenceId:
          requestType === 'deposit' ? trimmedDepositRef : referenceId,
        paymentNote: mergedNote || paymentNote,
        bonusType,
        paymentImageUrl,
        status: 'pending',
        ownerAdminId: ownerAdmin._id,
        ownerAdminUserName: ownerAdmin.userName,
        ownerAdminCode: ownerAdmin.code,
      });
    } catch (err) {
      // If request create fails after debit, rollback the wallet.
      if (debitedUser) {
        await SubAdmin.findOneAndUpdate(
          { _id: debitedUser._id },
          pipelineCreditBalance(amt),
          { new: true }
        );
      }
      throw err;
    }

    // Record history now for withdraw request (money already deducted).
    if (requestType === 'withdraw') {
      const latest = debitedUser || (await SubAdmin.findById(userId));
      try {
        await TransactionHistory.create({
          userId: latest._id,
          userName: latest.userName,
          withdrawl: amt,
          deposite: 0,
          amount: Number(latest.avbalance || 0),
          remark: `Manual self withdraw request submitted (${normalizedMethod})`,
          from: latest.userName,
          to: 'withdraw-request',
          invite: latest.invite,
        });
      } catch (histErr) {
        console.error('Withdraw request history write failed:', histErr);
      }

      try {
        // Push realtime wallet update to user's websocket clients
        const wsUserId = String(latest._id);
        sendBalanceUpdates(wsUserId, Number(latest.avbalance || 0));
        sendUserRefresh(wsUserId);
        sendToUser(wsUserId, {
          type: 'balance_update',
          userId: wsUserId,
          newBalance: Number(latest.avbalance || 0),
        });
        sendToUser(wsUserId, {
          type: 'user_refresh_needed',
          userId: wsUserId,
        });
      } catch (wsErr) {
        console.error('Withdraw request WS push failed:', wsErr);
      }
    }

    return res.status(201).json({
      success: true,
      message:
        requestType === 'withdraw'
          ? 'Withdraw request submitted. Please wait for admin approval.'
          : 'Deposit request submitted. Please wait for admin approval.',
      data: withResolvedDepositRequest(req, request),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFirstDepositBonusInfo = async (req, res) => {
  try {
    const user = await SubAdmin.findById(req.id).lean();
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'User not found.' });
    }

    const settings = await getFirstDepositBonusSettings();
    const eligible = settings.enabled
      ? await isFirstDepositEligible(user)
      : false;

    return res.status(200).json({
      success: true,
      data: {
        enabled: settings.enabled,
        percent: settings.percent,
        eligible,
        claimed: Boolean(user.firstDepositBonusClaimed),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyManualDepositRequests = async (req, res) => {
  try {
    const requests = await ManualDepositRequest.find({
      userId: req.id,
      method: { $in: VALID_DEPOSIT_METHODS },
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: requests.map((r) => withResolvedDepositRequest(req, r)),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getManualDepositRequestsForAdmin = async (req, res) => {
  try {
    const { status, method, userName, requestType } = req.query;
    const filter = {
      ownerAdminId: req.id,
      method: { $in: VALID_DEPOSIT_METHODS },
    };

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

    // Backward compatibility: old requests without ownerAdminId -> derive ownership from user.invite
    const legacyRequests = [];
    try {
      const admin = await SubAdmin.findById(req.id).lean();
      if (admin?.code) {
        const downlineUsers = await SubAdmin.find({
          invite: admin.code,
          role: 'user',
        })
          .select('_id')
          .lean();
        const ids = downlineUsers.map((u) => u._id);
        if (ids.length) {
          const legacy = await ManualDepositRequest.find({
            ownerAdminId: null,
            userId: { $in: ids },
            method: { $in: VALID_DEPOSIT_METHODS },
            ...(filter.status ? { status: filter.status } : {}),
            ...(filter.method ? { method: filter.method } : {}),
            ...(filter.requestType ? { requestType: filter.requestType } : {}),
            ...(filter.userName ? { userName: filter.userName } : {}),
          })
            .sort({ createdAt: -1 })
            .lean();
          legacyRequests.push(...legacy);
        }
      }
    } catch {
      // ignore legacy fetch failures
    }

    const merged = [...requests, ...legacyRequests].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const usdtToBdtRate = await getUsdtToBdtRate();
    const userIds = [
      ...new Set(merged.map((r) => String(r.userId || '')).filter(Boolean)),
    ];
    const users = userIds.length
      ? await SubAdmin.find({ _id: { $in: userIds } })
          .select('currency')
          .lean()
      : [];
    const currencyById = new Map(
      users.map((u) => [String(u._id), u.currency || 'BDT'])
    );

    return res.status(200).json({
      success: true,
      usdtToBdtRate,
      data: merged.map((r) => {
        const resolved = withResolvedDepositRequest(req, r);
        const c = currencyById.get(String(r.userId)) || 'BDT';
        return {
          ...resolved,
          currency: c,
          amount: amountToAdminBdt(resolved.amount, c, usdtToBdtRate),
        };
      }),
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
    if (requestDoc.ownerAdminId && String(requestDoc.ownerAdminId) !== String(req.id)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (requestDoc.status !== 'pending') {
      return res
        .status(400)
        .json({ message: 'This request has already been reviewed.' });
    }

    const adminUser = await SubAdmin.findById(req.id).lean();
    const adminUserName = adminUser?.userName || req.admin || 'admin';

    if (action === 'reject') {
      const isWithdraw = requestDoc.requestType === 'withdraw';
      // If withdraw was already debited on submission, refund on reject.
      if (isWithdraw) {
        const amountToRefund = round2(Number(requestDoc.amount));
        const refundedUser = await SubAdmin.findOneAndUpdate(
          {
            _id: requestDoc.userId,
            role: 'user',
          },
          pipelineCreditBalance(amountToRefund),
          { new: true }
        );

        if (refundedUser) {
          await TransactionHistory.create({
            userId: refundedUser._id,
            userName: refundedUser.userName,
            withdrawl: 0,
            deposite: amountToRefund,
            amount: Number(refundedUser.avbalance || 0),
            remark: `Manual self withdraw request rejected - refund (${requestDoc.method})`,
            from: 'withdraw-reject',
            to: refundedUser.userName,
            invite: refundedUser.invite,
          });

          const wsUserId = String(refundedUser._id);
          sendBalanceUpdates(wsUserId, Number(refundedUser.avbalance || 0));
          sendUserRefresh(wsUserId);
          sendToUser(wsUserId, {
            type: 'balance_update',
            userId: wsUserId,
            newBalance: Number(refundedUser.avbalance || 0),
          });
          sendToUser(wsUserId, {
            type: 'user_refresh_needed',
            userId: wsUserId,
          });
        }
      } else {
        // Deposit reject: no wallet movement; still log on account statement.
        const depositUser = await SubAdmin.findById(requestDoc.userId).lean();
        if (depositUser && depositUser.role === 'user') {
          const reqAmt = round2(Number(requestDoc.amount));
          const utr = String(requestDoc.referenceId || '').trim();
          try {
            await TransactionHistory.create({
              userId: depositUser._id,
              userName: depositUser.userName,
              withdrawl: 0,
              deposite: 0,
              amount: Number(depositUser.avbalance || 0),
              remark: `Manual self deposit rejected (${requestDoc.method}) — requested ₹${reqAmt}${utr ? ` | UTR ${utr}` : ''}`,
              from: 'deposit-reject',
              to: depositUser.userName,
              invite: depositUser.invite,
            });
          } catch (histErr) {
            console.error('Deposit reject history write failed:', histErr);
          }
        }
      }

      requestDoc.status = 'rejected';
      requestDoc.adminRemark = adminRemark || 'Rejected by admin';
      requestDoc.approvedById = req.id;
      requestDoc.approvedByUserName = adminUserName;
      requestDoc.reviewedAt = new Date();
      await requestDoc.save();

      return res.status(200).json({
        success: true,
        message: requestDoc.requestType === 'withdraw'
          ? 'Withdraw request rejected and refunded.'
          : 'Deposit request rejected.',
        data: requestDoc,
      });
    }

    const amount = round2(Number(requestDoc.amount));
    const isWithdraw = requestDoc.requestType === 'withdraw';

    const user = await SubAdmin.findById(requestDoc.userId);
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'Requested user does not exist.' });
    }

    let debitedAdmin = null;

    if (!isWithdraw) {
      let bonusAmount = 0;
      const bonusPreview = await computeFirstDepositBonus(user, amount);
      if (bonusPreview.applied && bonusPreview.bonusAmount > 0) {
        if (await claimFirstDepositBonusFlag(user._id)) {
          bonusAmount = bonusPreview.bonusAmount;
        }
      }
      const totalCredit = round2(amount + bonusAmount);

      // Deposit approval: deduct deposit + bonus from approver, credit user.
      debitedAdmin = await SubAdmin.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(String(req.id)),
          status: 'active',
          avbalance: { $gte: totalCredit },
          balance: { $gte: totalCredit },
          role: { $ne: 'user' },
        },
        pipelineDebitBalance(totalCredit),
        { new: true }
      );

      if (!debitedAdmin && bonusAmount > 0) {
        // Admin cannot cover bonus — approve deposit only, restore claim flag
        await SubAdmin.findByIdAndUpdate(user._id, {
          $set: { firstDepositBonusClaimed: false },
        });
        bonusAmount = 0;
        debitedAdmin = await SubAdmin.findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(String(req.id)),
            status: 'active',
            avbalance: { $gte: amount },
            balance: { $gte: amount },
            role: { $ne: 'user' },
          },
          pipelineDebitBalance(amount),
          { new: true }
        );
      }

      if (!debitedAdmin) {
        if (bonusAmount > 0) {
          await SubAdmin.findByIdAndUpdate(user._id, {
            $set: { firstDepositBonusClaimed: false },
          });
        }
        return res
          .status(400)
          .json({ message: 'Insufficient admin balance to approve this deposit.' });
      }

      const creditAmount = bonusAmount > 0 ? totalCredit : amount;
      const creditedUser = await SubAdmin.findOneAndUpdate(
        { _id: user._id, role: 'user' },
        pipelineCreditBalance(creditAmount),
        { new: true }
      );

      if (!creditedUser) {
        const rollbackAmt = bonusAmount > 0 ? totalCredit : amount;
        await SubAdmin.findOneAndUpdate(
          { _id: debitedAdmin._id },
          pipelineCreditBalance(rollbackAmt),
          { new: true }
        );
        if (bonusAmount > 0) {
          await SubAdmin.findByIdAndUpdate(user._id, {
            $set: { firstDepositBonusClaimed: false },
          });
        }
        return res.status(500).json({ message: 'Could not credit user for deposit.' });
      }

      requestDoc.bonusAmount = bonusAmount;
      requestDoc.firstDepositBonusApplied = bonusAmount > 0;
      requestDoc.bonusType = bonusAmount > 0 ? 'first_deposit' : requestDoc.bonusType;

      // keep user in sync for WS + history below
      user.balance = creditedUser.balance;
      user.baseBalance = creditedUser.baseBalance;
      user.avbalance = creditedUser.avbalance;
      user.creditReferenceProfitLoss = creditedUser.creditReferenceProfitLoss;
    } else {
      // Withdraw approval: wallet already debited at request submit time.
      // IMPORTANT: do NOT credit admin/subadmin wallet on withdraw approval.
    }

    requestDoc.status = 'approved';
    requestDoc.adminRemark = adminRemark || 'Approved by admin';
    requestDoc.approvedById = req.id;
    requestDoc.approvedByUserName = adminUserName;
    requestDoc.reviewedAt = new Date();
    await requestDoc.save();

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
        withdrawl: 0,
        deposite: 0,
        amount: user.avbalance,
        remark: `Manual self withdraw approved (${requestDoc.method})`,
        from: adminUserName,
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

      const bonusAmt = round2(Number(requestDoc.bonusAmount) || 0);
      if (bonusAmt > 0) {
        await DepositHistory.create({
          userName: user.userName,
          amount: bonusAmt,
          remark: `First deposit bonus (${requestDoc.bonusType || 'first_deposit'})`,
          invite: user.invite,
        });
        await TransactionHistory.create({
          userId: user._id,
          userName: user.userName,
          withdrawl: 0,
          deposite: bonusAmt,
          amount: user.avbalance,
          remark: `First deposit bonus +${bonusAmt}`,
          from: 'first-deposit-bonus',
          to: user.userName,
          invite: user.invite,
        });
      }

      // Record admin-side debit history (optional but useful for audits)
      try {
        const adminDebitTotal = amount + bonusAmt;
        await TransactionHistory.create({
          userId: req.id,
          userName: adminUserName,
          withdrawl: adminDebitTotal,
          deposite: 0,
          amount: Number(debitedAdmin?.avbalance ?? 0),
          remark: `Manual deposit approved for ${user.userName} (${requestDoc.method})${bonusAmt > 0 ? ` incl. bonus ${bonusAmt}` : ''}`,
          from: adminUserName,
          to: user.userName,
          invite: debitedAdmin?.invite,
        });
      } catch (histErr) {
        console.error('Admin debit history write failed:', histErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: isWithdraw
        ? 'Withdraw approved and wallet debited.'
        : requestDoc.bonusAmount > 0
          ? `Deposit approved with first deposit bonus (+${requestDoc.bonusAmount}).`
          : 'Deposit approved, user credited and admin debited.',
      data: requestDoc,
    });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
