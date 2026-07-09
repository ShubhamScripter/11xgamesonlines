/**
 * Groups users who share IP, device fingerprint, or phone into fraud clusters.
 */

function normalizePhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (digits.length < 10) return '';
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.startsWith('880')) return digits.slice(3);
  return digits;
}

function parseUserIps(lastIP) {
  if (!lastIP || lastIP === 'IP not found') return [];
  return String(lastIP)
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
}

function collectDeviceIds(user) {
  const ids = new Set();
  for (const id of user.deviceIds || []) {
    const v = String(id || '').trim();
    if (v && v !== 'unknown-device') ids.add(v);
  }
  const last = String(user.lastDevice || '').trim();
  if (last && last !== 'unknown-device') ids.add(last);
  return [...ids];
}

class UnionFind {
  constructor(size) {
    this.parent = Array.from({ length: size }, (_, i) => i);
  }

  find(i) {
    let root = i;
    while (this.parent[root] !== root) {
      this.parent[root] = this.parent[this.parent[root]];
      root = this.parent[root];
    }
    return root;
  }

  union(a, b) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) this.parent[rootB] = rootA;
  }
}

function linkBucket(uf, indexByUserId, users) {
  if (users.length < 2) return;
  const firstIdx = indexByUserId.get(String(users[0]._id));
  for (let i = 1; i < users.length; i += 1) {
    const idx = indexByUserId.get(String(users[i]._id));
    if (firstIdx !== undefined && idx !== undefined) uf.union(firstIdx, idx);
  }
}

function riskLabel(score) {
  if (score >= 85) return 'High';
  if (score >= 60) return 'Med';
  return 'Low';
}

function computeRiskScore(userCount, signals) {
  let score = Math.min(40, (userCount - 1) * 18);
  if (signals.includes('Same IP')) score += 28;
  if (signals.includes('Same device')) score += 22;
  if (signals.includes('Same phone')) score += 15;
  if (userCount >= 4) score += 12;
  if (userCount >= 3) score += 6;
  return Math.min(100, score);
}

function shortClusterId(userIds) {
  const tail = userIds
    .slice()
    .sort()
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-4)
    .toUpperCase();
  return `CLS-${tail || '0000'}`;
}

/**
 * @param {Array} users lean user docs
 * @param {Map<string, number>} depositByUserId
 */
export function buildFraudClusters(users, depositByUserId = new Map()) {
  if (!users.length) {
    return {
      clusters: [],
      stats: {
        flaggedClusters: 0,
        accountsUnderReview: 0,
        suspendedInClusters: 0,
        sharedIpSignals: 0,
      },
    };
  }

  const indexByUserId = new Map(users.map((u, i) => [String(u._id), i]));
  const uf = new UnionFind(users.length);

  const ipMap = new Map();
  const deviceMap = new Map();
  const phoneMap = new Map();

  for (const user of users) {
    for (const ip of parseUserIps(user.lastIP)) {
      if (!ipMap.has(ip)) ipMap.set(ip, []);
      ipMap.get(ip).push(user);
    }
    for (const deviceId of collectDeviceIds(user)) {
      if (!deviceMap.has(deviceId)) deviceMap.set(deviceId, []);
      deviceMap.get(deviceId).push(user);
    }
    const phone = normalizePhone(user.phone);
    if (phone) {
      if (!phoneMap.has(phone)) phoneMap.set(phone, []);
      phoneMap.get(phone).push(user);
    }
  }

  for (const bucket of ipMap.values()) linkBucket(uf, indexByUserId, bucket);
  for (const bucket of deviceMap.values()) linkBucket(uf, indexByUserId, bucket);
  for (const bucket of phoneMap.values()) linkBucket(uf, indexByUserId, bucket);

  const groups = new Map();
  users.forEach((user, idx) => {
    const root = uf.find(idx);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(user);
  });

  let sharedIpSignals = 0;
  for (const [, bucket] of ipMap.entries()) {
    if (bucket.length > 1) sharedIpSignals += 1;
  }

  const clusters = [];

  for (const group of groups.values()) {
    if (group.length < 2) continue;

    const userIds = group.map((u) => String(u._id));
    const userIdSet = new Set(userIds);
    const signals = new Set();

    for (const [ip, bucket] of ipMap.entries()) {
      const matched = bucket.filter((u) => userIdSet.has(String(u._id)));
      if (matched.length > 1) signals.add('Same IP');
    }
    for (const [deviceId, bucket] of deviceMap.entries()) {
      const matched = bucket.filter((u) => userIdSet.has(String(u._id)));
      if (matched.length > 1) {
        signals.add('Same device');
        if (!signals.has('Device')) {
          // store first shared device for display via separate field
        }
      }
    }
    for (const [, bucket] of phoneMap.entries()) {
      const matched = bucket.filter((u) => userIdSet.has(String(u._id)));
      if (matched.length > 1) signals.add('Same phone');
    }

    const sharedSignals = [...signals];
    const riskScore = computeRiskScore(group.length, sharedSignals);

    let primaryIp = '';
    for (const [ip, bucket] of ipMap.entries()) {
      if (bucket.filter((u) => userIdSet.has(String(u._id))).length > 1) {
        primaryIp = ip;
        break;
      }
    }

    let primaryDevice = '';
    for (const [deviceId, bucket] of deviceMap.entries()) {
      if (bucket.filter((u) => userIdSet.has(String(u._id))).length > 1) {
        primaryDevice = deviceId;
        break;
      }
    }

    const totalDeposits = group.reduce(
      (sum, u) => sum + (depositByUserId.get(String(u._id)) || 0),
      0
    );

    const sortedUsers = [...group].sort(
      (a, b) => new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0)
    );

    clusters.push({
      clusterId: shortClusterId(userIds),
      primaryUserName: sortedUsers[0]?.userName || 'unknown',
      primaryUserId: String(sortedUsers[0]?._id || ''),
      primaryUserCode: sortedUsers[0]?.code || '',
      extraCount: group.length - 1,
      sharedSignals,
      primaryIp,
      primaryDevice,
      accounts: sortedUsers.map((u) => ({
        _id: u._id,
        userName: u.userName,
        code: u.code,
        email: u.email,
        phone: u.phone,
        status: u.status,
        lastLogin: u.lastLogin,
        lastIP: u.lastIP,
      })),
      accountCount: group.length,
      totalDeposits: Math.round(totalDeposits * 100) / 100,
      riskScore,
      riskLabel: riskLabel(riskScore),
      lastActivity: sortedUsers[0]?.lastLogin || null,
    });
  }

  clusters.sort((a, b) => b.riskScore - a.riskScore || b.accountCount - a.accountCount);

  const uniqueAccounts = new Set();
  let suspendedInClusters = 0;
  for (const cluster of clusters) {
    for (const acc of cluster.accounts) {
      uniqueAccounts.add(String(acc._id));
      if (String(acc.status || '').toLowerCase() !== 'active') {
        suspendedInClusters += 1;
      }
    }
  }

  return {
    clusters,
    stats: {
      flaggedClusters: clusters.length,
      accountsUnderReview: uniqueAccounts.size,
      suspendedInClusters,
      sharedIpSignals,
    },
  };
}

export function filterClusters(clusters, search = '') {
  const q = String(search || '').trim().toLowerCase();
  if (!q) return clusters;

  return clusters.filter((cluster) => {
    if (cluster.clusterId.toLowerCase().includes(q)) return true;
    if (cluster.primaryIp.toLowerCase().includes(q)) return true;
    if (cluster.primaryDevice.toLowerCase().includes(q)) return true;
    return cluster.accounts.some((acc) => {
      return (
        String(acc._id || '').toLowerCase().includes(q) ||
        String(acc.userName || '').toLowerCase().includes(q) ||
        String(acc.code || '').toLowerCase().includes(q) ||
        String(acc.email || '').toLowerCase().includes(q) ||
        String(acc.phone || '').includes(q) ||
        String(acc.lastIP || '').toLowerCase().includes(q)
      );
    });
  });
}
