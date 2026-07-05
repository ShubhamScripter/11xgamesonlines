import SubAdmin from '../../models/subAdminModel.js';
import ManualDepositRequest from '../../models/manualDepositRequestModel.js';
import {
  buildFraudClusters,
  filterClusters,
} from '../../utils/fraudClusterUtils.js';

const ALLOWED_ROLES = ['superadmin', 'admin', 'subadmin', 'seniorSuper'];

export const getFraudClusters = async (req, res) => {
  try {
    if (!ALLOWED_ROLES.includes(req.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - You do not have permission to view fraud clusters.',
      });
    }

    const { search = '' } = req.query;

    const users = await SubAdmin.find({
      role: 'user',
      status: { $ne: 'delete' },
    })
      .select(
        'userName email phone lastIP deviceIds lastDevice status lastLogin createdAt'
      )
      .lean();

    const userIds = users.map((u) => u._id);
    const depositRows = userIds.length
      ? await ManualDepositRequest.aggregate([
          {
            $match: {
              userId: { $in: userIds },
              requestType: 'deposit',
              status: 'approved',
            },
          },
          {
            $group: {
              _id: '$userId',
              total: { $sum: '$amount' },
            },
          },
        ])
      : [];

    const depositByUserId = new Map(
      depositRows.map((row) => [String(row._id), Number(row.total) || 0])
    );

    const { clusters, stats } = buildFraudClusters(users, depositByUserId);
    const filtered = filterClusters(clusters, search);

    const latestAlert =
      filtered.length > 0
        ? {
            clusterId: filtered[0].clusterId,
            message: `${filtered[0].accountCount} betting IDs linked — ${filtered[0].sharedSignals.join(', ') || 'shared signals'} detected.`,
            primaryIp: filtered[0].primaryIp,
            primaryDevice: filtered[0].primaryDevice,
            accountCount: filtered[0].accountCount,
            lastActivity: filtered[0].lastActivity,
          }
        : null;

    return res.status(200).json({
      success: true,
      data: filtered,
      stats,
      latestAlert,
      totalClusters: clusters.length,
    });
  } catch (error) {
    console.error('getFraudClusters error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
