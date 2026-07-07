import crypto from 'crypto';

import AgentCommission from '../models/agentCommissionModel.js';
import SubAdmin from '../models/subAdminModel.js';
import { getAppSettingsDoc } from '../models/appSettingsModel.js';
import {
  getWeekStart,
  getWeekEnd,
  getAffiliateSettings,
} from '../utils/affiliateCommission.js';
import { buildUserRegisterReferralLink } from '../utils/frontendUrl.js';

const ADMIN_ROLES = new Set(['superadmin', 'admin', 'subadmin', 'seniorSuper']);
const AGENT_ROLES = new Set(['agent', 'superAgent']);

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

export async function createAffiliateAgent(req, res) {
  try {
    if (!ADMIN_ROLES.has(req.role)) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const {
      name,
      email,
      userName,
      password,
      phone,
      commissionPercent,
    } = req.body;

    if (!name || !email || !userName || !password) {
      return res.status(400).json({ message: 'Name, email, username and password are required.' });
    }

    const existing = await SubAdmin.findOne({
      $or: [{ email }, { userName }],
    });
    if (existing) {
      return res.status(400).json({ message: 'Email or username already exists.' });
    }

    const parent = await SubAdmin.findById(req.id).select('code role');
    if (!parent?.code) {
      return res.status(500).json({ message: 'Parent account not found.' });
    }

    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const pct =
      commissionPercent != null && commissionPercent !== ''
        ? Math.min(100, Math.max(0, Number(commissionPercent)))
        : null;

    const agent = await SubAdmin.create({
      name: String(name).trim(),
      email: String(email).trim(),
      userName: String(userName).trim(),
      password,
      account: 'agent',
      code,
      invite: parent.code,
      role: 'agent',
      phone: phone != null && phone !== '' ? Number(phone) : undefined,
      agentCommissionPercent: pct,
      balance: 0,
      avbalance: 0,
      baseBalance: 0,
      exposureLimit: 0,
    });

    return res.status(201).json({
      success: true,
      data: {
        _id: agent._id,
        userName: agent.userName,
        code: agent.code,
        role: agent.role,
        agentCommissionPercent: agent.agentCommissionPercent,
        referralLink: buildReferralLink(agent.code, req),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create agent' });
  }
}

export async function updateAgentCommission(req, res) {
  try {
    if (!ADMIN_ROLES.has(req.role)) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const { commissionPercent, globalCommissionPercent, affiliateModuleEnabled } = req.body;

    if (globalCommissionPercent !== undefined || affiliateModuleEnabled !== undefined) {
      const doc = await getAppSettingsDoc();
      if (affiliateModuleEnabled !== undefined) {
        doc.affiliateModuleEnabled = Boolean(affiliateModuleEnabled);
      }
      if (globalCommissionPercent !== undefined) {
        const pct = Number(globalCommissionPercent);
        if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
          return res.status(400).json({ message: 'Commission must be between 0 and 100.' });
        }
        doc.affiliateCommissionPercent = pct;
      }
      await doc.save();
    }

    if (req.params.agentId && commissionPercent !== undefined) {
      const pct = Number(commissionPercent);
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        return res.status(400).json({ message: 'Commission must be between 0 and 100.' });
      }
      const agent = await SubAdmin.findOneAndUpdate(
        { _id: req.params.agentId, role: { $in: ['agent', 'superAgent'] } },
        { $set: { agentCommissionPercent: pct } },
        { new: true }
      ).select('userName code agentCommissionPercent role');
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found.' });
      }
      return res.json({ success: true, data: agent });
    }

    const settings = await getAffiliateSettings();
    return res.json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update commission' });
  }
}

function buildReferralLink(agentCode, req) {
  return buildUserRegisterReferralLink(agentCode, req);
}

export async function getAgentReferralLink(req, res) {
  try {
    if (!AGENT_ROLES.has(req.role)) {
      return res.status(403).json({ message: 'Agents only.' });
    }
    const agent = await SubAdmin.findById(req.id).select('code userName');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found.' });
    }
    return res.json({
      success: true,
      data: {
        code: agent.code,
        referralLink: buildReferralLink(agent.code, req),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to get referral link' });
  }
}

export async function getAgentDownline(req, res) {
  try {
    if (!AGENT_ROLES.has(req.role)) {
      return res.status(403).json({ message: 'Agents only.' });
    }
    const agent = await SubAdmin.findById(req.id).select('code');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found.' });
    }

    const downline = await SubAdmin.find({
      invite: agent.code,
      role: 'user',
      status: { $ne: 'delete' },
    })
      .select('userName name balance avbalance bettingProfitLoss createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: downline });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch downline' });
  }
}

export async function getAgentCommissionReport(req, res) {
  try {
    if (!AGENT_ROLES.has(req.role)) {
      return res.status(403).json({ message: 'Agents only.' });
    }

    const logs = await AgentCommission.aggregate([
      { $match: { agentId: req.id } },
      {
        $group: {
          _id: '$userId',
          totalCommission: { $sum: '$commissionAmount' },
          totalUserLoss: { $sum: '$userLossAmount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'subadmins',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: '$_id',
          userName: '$user.userName',
          name: '$user.name',
          totalCommission: { $round: ['$totalCommission', 2] },
          totalUserLoss: { $round: ['$totalUserLoss', 2] },
          eventCount: '$count',
        },
      },
      { $sort: { totalCommission: -1 } },
    ]);

    const agent = await SubAdmin.findById(req.id).select('affiliateCommissionBalance');
    return res.json({
      success: true,
      data: {
        totalBalance: round2(agent?.affiliateCommissionBalance || 0),
        byUser: logs,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch commission report' });
  }
}

export async function getAgentWeeklyCommission(req, res) {
  try {
    if (!AGENT_ROLES.has(req.role)) {
      return res.status(403).json({ message: 'Agents only.' });
    }

    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd(weekStart);

    const [weeklyTotal] = await AgentCommission.aggregate([
      {
        $match: {
          agentId: req.id,
          createdAt: { $gte: weekStart, $lt: weekEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$commissionAmount' },
        },
      },
    ]);

    return res.json({
      success: true,
      data: {
        weekStart,
        weekEnd,
        weeklyCommission: round2(weeklyTotal?.total || 0),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch weekly commission' });
  }
}

/** Unified agent dashboard: downline + balances + per-user commission + weekly total */
export async function getAgentDashboard(req, res) {
  try {
    if (!AGENT_ROLES.has(req.role)) {
      return res.status(403).json({ message: 'Agents only.' });
    }

    const agent = await SubAdmin.findById(req.id).select(
      'code userName name affiliateCommissionBalance agentCommissionPercent'
    );
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found.' });
    }

    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd(weekStart);
    const settings = await getAffiliateSettings();

    const [downline, commissionByUser, weeklyByUser] = await Promise.all([
      SubAdmin.find({
        invite: agent.code,
        role: 'user',
        status: { $ne: 'delete' },
      })
        .select('userName name balance avbalance bettingProfitLoss createdAt status currency')
        .sort({ createdAt: -1 })
        .lean(),
      AgentCommission.aggregate([
        { $match: { agentId: agent._id } },
        {
          $group: {
            _id: '$userId',
            totalCommission: { $sum: '$commissionAmount' },
            totalUserLoss: { $sum: '$userLossAmount' },
            eventCount: { $sum: 1 },
          },
        },
      ]),
      AgentCommission.aggregate([
        {
          $match: {
            agentId: agent._id,
            createdAt: { $gte: weekStart, $lt: weekEnd },
          },
        },
        {
          $group: {
            _id: '$userId',
            weeklyCommission: { $sum: '$commissionAmount' },
          },
        },
      ]),
    ]);

    const commissionMap = new Map(
      commissionByUser.map((r) => [String(r._id), r])
    );
    const weeklyMap = new Map(
      weeklyByUser.map((r) => [String(r._id), round2(r.weeklyCommission || 0)])
    );

    const rows = downline.map((u) => {
      const comm = commissionMap.get(String(u._id));
      return {
        _id: u._id,
        userName: u.userName,
        name: u.name,
        status: u.status,
        currency: u.currency || 'BDT',
        balance: round2(u.balance || 0),
        avbalance: round2(u.avbalance || 0),
        bettingProfitLoss: round2(u.bettingProfitLoss || 0),
        joinedAt: u.createdAt,
        totalUserLoss: round2(comm?.totalUserLoss || 0),
        totalCommission: round2(comm?.totalCommission || 0),
        weeklyCommission: weeklyMap.get(String(u._id)) || 0,
        eventCount: comm?.eventCount || 0,
      };
    });

    const weeklyCommission = round2(
      weeklyByUser.reduce((sum, r) => sum + (r.weeklyCommission || 0), 0)
    );

    const totalDownlineBalance = round2(
      downline.reduce((sum, u) => sum + (Number(u.balance) || 0), 0)
    );
    const totalDownlineAvBalance = round2(
      downline.reduce((sum, u) => sum + (Number(u.avbalance) || 0), 0)
    );

    return res.json({
      success: true,
      data: {
        agent: {
          userName: agent.userName,
          name: agent.name,
          code: agent.code,
          commissionPercent:
            agent.agentCommissionPercent != null
              ? Number(agent.agentCommissionPercent)
              : settings.globalCommissionPercent,
        },
        referralLink: buildReferralLink(agent.code, req),
        summary: {
          referredUsersCount: rows.length,
          totalCommission: round2(agent.affiliateCommissionBalance || 0),
          weeklyCommission,
          weekStart,
          weekEnd,
          totalDownlineBalance,
          totalDownlineAvBalance,
          moduleEnabled: settings.enabled,
        },
        downline: rows,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load agent dashboard' });
  }
}

export async function listAffiliateAgents(req, res) {
  try {
    if (!ADMIN_ROLES.has(req.role)) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const agents = await SubAdmin.find({
      role: { $in: ['agent', 'superAgent'] },
      status: { $ne: 'delete' },
    })
      .select('userName name code agentCommissionPercent affiliateCommissionBalance createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const settings = await getAffiliateSettings();
    const data = agents.map((a) => ({
      ...a,
      referralLink: buildReferralLink(a.code, req),
    }));

    return res.json({ success: true, data: { settings, agents: data } });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to list agents' });
  }
}
