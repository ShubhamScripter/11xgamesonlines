import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  IoBan,
  IoClose,
  IoRefresh,
  IoSearch,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
} from 'react-icons/io5';
import axiosInstance from '../../utils/axiosInstance';
import { formatIST } from '../../utils/time';

const ALLOWED_ROLES = ['superadmin', 'admin', 'subadmin', 'seniorSuper'];

const SIGNAL_STYLES = {
  'Same IP': 'bg-red-500/20 text-red-300 border-red-500/40',
  'Same device': 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  'Same phone': 'bg-pink-500/20 text-pink-300 border-pink-500/40',
};

function initials(name) {
  const parts = String(name || '?').split(/[_\s]+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

function RiskBadge({ score, label }) {
  const tone =
    label === 'High'
      ? 'text-red-400'
      : label === 'Med'
        ? 'text-amber-400'
        : 'text-emerald-400';
  return (
    <span className={`font-bold ${tone}`}>
      {score} <span className="text-xs font-semibold">{label}</span>
    </span>
  );
}

function BlockModal({ target, onClose, onBlocked }) {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('suspended');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!password) {
      toast.error('Please enter your master password');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.put('/user-setting', {
        masterPassword: password,
        status,
        userId: target._id,
      });
      toast.success(`${target.userName} updated`);
      onBlocked?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-start pt-16 z-50 p-4">
      <div className="bg-[#1a2228] border border-[#2d3740] rounded-xl w-full max-w-md text-white shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d3740]">
          <h3 className="font-bold flex items-center gap-2">
            <IoBan /> Manage account — {target.userName}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
            <IoClose size={20} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-[#0f1419] border border-[#2d3740] rounded-lg px-3 py-2 text-sm"
          >
            <option value="suspended">Suspend</option>
            <option value="locked">Lock</option>
            <option value="active">Activate</option>
          </select>
          <input
            type="password"
            placeholder="Master password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0f1419] border border-[#2d3740] rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 rounded-lg py-2.5 font-semibold text-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RiskFraud() {
  const { user } = useSelector((state) => state.auth);
  const canView = ALLOWED_ROLES.includes(user?.role);

  const [clusters, setClusters] = useState([]);
  const [stats, setStats] = useState({
    flaggedClusters: 0,
    accountsUnderReview: 0,
    suspendedInClusters: 0,
    sharedIpSignals: 0,
  });
  const [latestAlert, setLatestAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [reviewCluster, setReviewCluster] = useState(null);
  const [blockTarget, setBlockTarget] = useState(null);

  const fetchClusters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/fraud-clusters', {
        params: { search: search.trim() || undefined },
      });
      setClusters(Array.isArray(res?.data?.data) ? res.data.data : []);
      setStats(res?.data?.stats || {});
      setLatestAlert(res?.data?.latestAlert || null);
      setAlertDismissed(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load fraud data');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (canView) fetchClusters();
  }, [canView, fetchClusters]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const alertText = useMemo(() => {
    if (!latestAlert) return '';
    const parts = [];
    if (latestAlert.primaryDevice) {
      parts.push(`device ${latestAlert.primaryDevice.slice(0, 12)}…`);
    }
    if (latestAlert.primaryIp) {
      parts.push(`IP ${latestAlert.primaryIp}`);
    }
    const detail = parts.length ? ` — shared ${parts.join(' & ')}` : '';
    return `${latestAlert.accountCount} betting IDs linked${detail}.`;
  }, [latestAlert]);

  if (!canView) {
    return (
      <div className="p-4 text-red-500">
        You do not have permission to view Risk &amp; Fraud.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e11] text-gray-100 p-4 md:p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <IoShieldCheckmarkOutline className="text-[#19A044]" />
            Risk &amp; Fraud
          </h1>
          <p className="text-sm text-gray-500 mt-1">Multi-account detection</p>
        </div>
        <form onSubmit={onSearchSubmit} className="flex gap-2 w-full lg:max-w-md">
          <div className="relative flex-1">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by IP, phone, email, device, username..."
              className="w-full bg-[#141a1f] border border-[#252b31] rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-[#19A044]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#19A044] text-white text-sm font-semibold hover:bg-[#15803d]"
          >
            Search
          </button>
          <button
            type="button"
            onClick={fetchClusters}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#252b31] text-gray-400 hover:text-white disabled:opacity-50"
            title="Refresh"
          >
            <IoRefresh className={loading ? 'animate-spin' : ''} size={20} />
          </button>
        </form>
      </div>

      {/* Alert banner */}
      {latestAlert && !alertDismissed && (
        <div className="mb-5 rounded-xl border border-red-500/40 bg-red-950/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <IoWarningOutline className="text-red-400 shrink-0 mt-0.5" size={22} />
            <div>
              <p className="text-red-300 font-semibold text-sm">
                New multi-account alert · review needed
              </p>
              <p className="text-red-200/80 text-xs mt-1">{alertText}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAlertDismissed(true)}
              className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => {
                const c = clusters.find((x) => x.clusterId === latestAlert.clusterId);
                if (c) setReviewCluster(c);
              }}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
            >
              Review cluster →
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Flagged clusters',
            value: stats.flaggedClusters ?? 0,
            sub: 'groups with 2+ linked accounts',
          },
          {
            label: 'Accounts under review',
            value: stats.accountsUnderReview ?? 0,
            sub: 'unique users in clusters',
          },
          {
            label: 'Suspended in clusters',
            value: stats.suspendedInClusters ?? 0,
            sub: 'already blocked / suspended',
          },
          {
            label: 'Shared-IP signals',
            value: stats.sharedIpSignals ?? 0,
            sub: 'duplicate IP groups detected',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-[#141a1f] border border-[#252b31] rounded-xl p-4"
          >
            <p className="text-[11px] uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
            <p className="text-[10px] text-gray-600 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Clusters table */}
      <div className="bg-[#141a1f] border border-[#252b31] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#252b31] flex items-center justify-between">
          <h2 className="font-semibold text-white">Clusters</h2>
          <span className="text-xs text-gray-500">{clusters.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500 border-b border-[#252b31]">
                <th className="px-4 py-3">Cluster</th>
                <th className="px-4 py-3">Shared signals</th>
                <th className="px-4 py-3">Accounts</th>
                <th className="px-4 py-3">Deposits</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Loading clusters...
                  </td>
                </tr>
              ) : clusters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-emerald-400 font-medium">No suspicious clusters found</p>
                    <p className="text-gray-600 text-xs mt-1">
                      Users sharing same IP, device, or phone will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                clusters.map((cluster) => (
                  <tr
                    key={cluster.clusterId}
                    className="border-b border-[#252b31]/80 hover:bg-[#1a2228]/80"
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-[#19A044]">{cluster.clusterId}</p>
                      <p className="text-white font-medium mt-0.5">
                        {cluster.primaryUserName}
                        {cluster.extraCount > 0 && (
                          <span className="text-gray-500"> +{cluster.extraCount}</span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {cluster.sharedSignals.map((sig) => (
                          <span
                            key={sig}
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                              SIGNAL_STYLES[sig] || 'bg-gray-700 text-gray-300 border-gray-600'
                            }`}
                          >
                            {sig}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center -space-x-2">
                        {cluster.accounts.slice(0, 4).map((acc) => (
                          <span
                            key={acc._id}
                            title={acc.userName}
                            className="w-8 h-8 rounded-full bg-[#243a48] border-2 border-[#141a1f] flex items-center justify-center text-[10px] font-bold text-white"
                          >
                            {initials(acc.userName)}
                          </span>
                        ))}
                        {cluster.accountCount > 4 && (
                          <span className="w-8 h-8 rounded-full bg-[#19A044] border-2 border-[#141a1f] flex items-center justify-center text-[10px] font-bold">
                            +{cluster.accountCount - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      ৳{Number(cluster.totalDeposits || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge score={cluster.riskScore} label={cluster.riskLabel} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setReviewCluster(cluster)}
                        className="px-3 py-1.5 rounded-lg bg-[#19A044]/20 text-[#19A044] border border-[#19A044]/40 text-xs font-semibold hover:bg-[#19A044]/30"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review panel */}
      {reviewCluster && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <div className="w-full max-w-lg bg-[#141a1f] border-l border-[#252b31] h-full overflow-y-auto">
            <div className="sticky top-0 bg-[#141a1f] border-b border-[#252b31] px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#19A044] font-mono">{reviewCluster.clusterId}</p>
                <h3 className="font-bold text-white">Cluster review</h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewCluster(null)}
                className="text-gray-400 hover:text-white"
              >
                <IoClose size={22} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {reviewCluster.sharedSignals.map((sig) => (
                  <span
                    key={sig}
                    className={`text-xs px-2 py-1 rounded-full border ${
                      SIGNAL_STYLES[sig] || 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {sig}
                  </span>
                ))}
              </div>
              {reviewCluster.primaryIp && (
                <p className="text-xs text-gray-400">
                  <span className="text-gray-500">IP:</span>{' '}
                  <span className="font-mono text-gray-300">{reviewCluster.primaryIp}</span>
                </p>
              )}
              {reviewCluster.primaryDevice && (
                <p className="text-xs text-gray-400 break-all">
                  <span className="text-gray-500">Device:</span>{' '}
                  <span className="font-mono text-gray-300">{reviewCluster.primaryDevice}</span>
                </p>
              )}
              <p className="text-sm text-gray-400">
                Total approved deposits:{' '}
                <span className="text-white font-semibold">
                  ৳{Number(reviewCluster.totalDeposits || 0).toLocaleString()}
                </span>
              </p>
              <div className="space-y-2">
                {reviewCluster.accounts.map((acc) => (
                  <div
                    key={acc._id}
                    className="flex items-center justify-between gap-2 bg-[#0b0e11] border border-[#252b31] rounded-lg p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{acc.userName}</p>
                      <p className="text-[11px] text-gray-500 truncate">{acc.email}</p>
                      <p className="text-[11px] text-gray-600">
                        Last login: {acc.lastLogin ? formatIST(acc.lastLogin) : 'Never'}
                      </p>
                      {acc.lastIP && (
                        <p className="text-[10px] font-mono text-gray-600 truncate">
                          {acc.lastIP}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setBlockTarget(acc)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-xs font-semibold"
                    >
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {blockTarget && (
        <BlockModal
          target={blockTarget}
          onClose={() => setBlockTarget(null)}
          onBlocked={fetchClusters}
        />
      )}
    </div>
  );
}

export default RiskFraud;
