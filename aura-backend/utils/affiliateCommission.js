import AgentCommission from '../models/agentCommissionModel.js';
import SubAdmin from '../models/subAdminModel.js';
import { getAppSettingsDoc } from '../models/appSettingsModel.js';

const AGENT_ROLES = new Set(['agent', 'superAgent']);

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

export async function getAffiliateSettings() {
  const doc = await getAppSettingsDoc();
  return {
    enabled: Boolean(doc.affiliateModuleEnabled),
    globalCommissionPercent: Math.min(
      100,
      Math.max(0, Number(doc.affiliateCommissionPercent) || 0)
    ),
  };
}

/**
 * Walk invite chain to find the nearest upline with agent role.
 */
export async function resolveReferringAgent(user) {
  if (!user?.invite) return null;
  let code = String(user.invite).trim().toUpperCase();
  const visited = new Set();
  for (let depth = 0; depth < 20 && code && !visited.has(code); depth++) {
    visited.add(code);
    const parent = await SubAdmin.findOne({
      code,
      status: { $ne: 'delete' },
    }).select('_id role code invite agentCommissionPercent userName');
    if (!parent) return null;
    if (AGENT_ROLES.has(parent.role)) return parent;
    code = parent.invite ? String(parent.invite).trim().toUpperCase() : '';
  }
  return null;
}

export async function getAgentCommissionPercent(agent) {
  const perAgent = agent?.agentCommissionPercent;
  if (perAgent != null && perAgent !== '' && Number(perAgent) >= 0) {
    return Math.min(100, Number(perAgent));
  }
  const settings = await getAffiliateSettings();
  return settings.globalCommissionPercent;
}

/**
 * Credit agent commission when a referred user loses on settlement.
 */
export async function creditAgentCommissionOnUserLoss(
  userId,
  lossAmount,
  { betId = '', source = 'bet_settlement' } = {}
) {
  const loss = round2(Math.abs(Number(lossAmount)));
  if (!userId || loss <= 0) return null;

  const settings = await getAffiliateSettings();
  if (!settings.enabled) return null;

  const user = await SubAdmin.findById(userId).select('invite role userName');
  if (!user || user.role !== 'user') return null;

  const agent = await resolveReferringAgent(user);
  if (!agent) return null;

  const percent = await getAgentCommissionPercent(agent);
  if (percent <= 0) return null;

  const commissionAmount = round2((loss * percent) / 100);
  if (commissionAmount <= 0) return null;

  if (betId) {
    const existing = await AgentCommission.findOne({
      agentId: agent._id,
      userId: user._id,
      betId: String(betId),
      source,
    }).select('_id');
    if (existing) return null;
  }

  await SubAdmin.findByIdAndUpdate(agent._id, {
    $inc: { affiliateCommissionBalance: commissionAmount },
  });

  const log = await AgentCommission.create({
    agentId: agent._id,
    userId: user._id,
    userLossAmount: loss,
    commissionPercent: percent,
    commissionAmount,
    source,
    betId: String(betId || ''),
  });

  return { agent, commissionAmount, log };
}

/** Start of current ISO week (Monday 00:00 UTC). */
export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(weekStart) {
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 7);
  return end;
}
