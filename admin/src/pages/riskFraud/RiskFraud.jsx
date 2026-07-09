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
  'Same IP': 'bg-red-100 text-red-800 border-red-200',
  'Same device': 'bg-orange-100 text-orange-800 border-orange-200',
  'Same phone': 'bg-pink-100 text-pink-800 border-pink-200',
};

function initials(name) {
  const parts = String(name || '?').split(/[_\s]+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

const formatUserId = (id) => String(id || '').trim();

function RiskBadge({ score, label }) {
  const tone =
    label === 'High'
      ? 'text-red-600'
      : label === 'Med'
        ? 'text-amber-600'
        : 'text-emerald-600';
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
    <div className="fixed inset-0 bg-[rgba(17,17,17,0.55)] flex justify-center items-start pt-16 z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl font-['Times_New_Roman'] overflow-hidden border border-[#e5e7eb]">
        <div className="flex items-center justify-between bg-[#243a48] text-white px-4 py-3">
          <h3 className="font-bold flex items-center gap-2 text-[15px]">
            <IoBan /> Manage account — {target.userName}
          </h3>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white">
            <IoClose size={20} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm bg-white"
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
            className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 font-semibold text-sm disabled:opacity-50"
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
      <div className="p-4 text-red-600 font-['Times_New_Roman']">
        You do not have permission to view Risk &amp; Fraud.
      </div>
    );
  }

  return (
    <div className="mt-4 p-2 md:p-4 font-['Times_New_Roman'] max-w-6xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#243a48] flex items-center gap-2">
            <IoShieldCheckmarkOutline className="text-[#2563eb]" />
            Risk &amp; Fraud
          </h1>
          <p className="text-sm text-gray-500 mt-1">Multi-account detection</p>
        </div>
        <form onSubmit={onSearchSubmit} className="flex gap-2 w-full lg:max-w-lg">
          <div className="relative flex-1">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by IP, phone, email, device, username..."
              className="w-full bg-white border border-[#d1d5db] rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8]"
          >
            Search
          </button>
          <button
            type="button"
            onClick={fetchClusters}
            disabled={loading}
            className="p-2.5 rounded-lg border border-[#d1d5db] bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            title="Refresh"
          >
            <IoRefresh className={loading ? 'animate-spin' : ''} size={20} />
          </button>
        </form>
      </div>

      {/* Alert banner */}
      {latestAlert && !alertDismissed && (
        <div className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <IoWarningOutline className="text-red-600 shrink-0 mt-0.5" size={22} />
            <div>
              <p className="text-red-800 font-semibold text-sm">
                New multi-account alert · review needed
              </p>
              <p className="text-red-700/80 text-xs mt-1">{alertText}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAlertDismissed(true)}
              className="px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:text-gray-900"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => {
                const c = clusters.find((x) => x.clusterId === latestAlert.clusterId);
                if (c) setReviewCluster(c);
              }}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              Review cluster →
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: 'Flagged clusters',
            value: stats.flaggedClusters ?? 0,
            sub: 'groups with 2+ linked accounts',
            accent: 'text-red-600',
          },
          {
            label: 'Accounts under review',
            value: stats.accountsUnderReview ?? 0,
            sub: 'unique users in clusters',
            accent: 'text-[#243a48]',
          },
          {
            label: 'Suspended in clusters',
            value: stats.suspendedInClusters ?? 0,
            sub: 'already blocked / suspended',
            accent: 'text-amber-600',
          },
          {
            label: 'Shared-IP signals',
            value: stats.sharedIpSignals ?? 0,
            sub: 'duplicate IP groups detected',
            accent: 'text-[#2563eb]',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-[#e5e7eb] rounded-xl p-4 shadow-sm"
          >
            <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
              {card.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${card.accent}`}>{card.value}</p>
            <p className="text-[10px] text-gray-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Clusters table */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center justify-between">
          <h2 className="font-bold text-[#243a48]">Clusters</h2>
          <span className="text-xs text-gray-500">{clusters.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500 border-b border-[#e5e7eb] bg-gray-50">
                <th className="px-4 py-3 font-semibold">Cluster</th>
                <th className="px-4 py-3 font-semibold">Shared signals</th>
                <th className="px-4 py-3 font-semibold">Accounts</th>
                <th className="px-4 py-3 font-semibold">Deposits</th>
                <th className="px-4 py-3 font-semibold">Risk</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Loading clusters...
                  </td>
                </tr>
              ) : clusters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-emerald-600 font-medium">No suspicious clusters found</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Users sharing same IP, device, or phone will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                clusters.map((cluster) => (
                  <tr key={cluster.clusterId} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-[#2563eb] font-semibold">
                        {cluster.clusterId}
                      </p>
                      <p className="text-[#111827] font-medium mt-0.5 font-mono text-xs break-all">
                        {formatUserId(cluster.primaryUserId || cluster.accounts?.[0]?._id) ||
                          cluster.primaryUserName}
                        {cluster.extraCount > 0 && (
                          <span className="text-gray-500"> +{cluster.extraCount}</span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-500">{cluster.primaryUserName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {cluster.sharedSignals.map((sig) => (
                          <span
                            key={sig}
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                              SIGNAL_STYLES[sig] || 'bg-gray-100 text-gray-700 border-gray-200'
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
                            title={formatUserId(acc._id)}
                            className="w-8 h-8 rounded-full bg-[#243a48] border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                          >
                            {initials(acc.userName)}
                          </span>
                        ))}
                        {cluster.accountCount > 4 && (
                          <span className="w-8 h-8 rounded-full bg-[#2563eb] border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                            +{cluster.accountCount - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#111827] font-medium">
                      ৳{Number(cluster.totalDeposits || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge score={cluster.riskScore} label={cluster.riskLabel} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setReviewCluster(cluster)}
                        className="px-3 py-1.5 rounded-lg bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8]"
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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="w-full max-w-lg bg-white border-l border-[#e5e7eb] h-full overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-[#243a48] text-white px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-200 font-mono">{reviewCluster.clusterId}</p>
                <h3 className="font-bold">Cluster review</h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewCluster(null)}
                className="text-white/80 hover:text-white"
              >
                <IoClose size={22} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {reviewCluster.sharedSignals.map((sig) => (
                  <span
                    key={sig}
                    className={`text-xs px-2 py-1 rounded-full border font-semibold ${
                      SIGNAL_STYLES[sig] || 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {sig}
                  </span>
                ))}
              </div>
              {reviewCluster.primaryIp && (
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-700">IP:</span>{' '}
                  <span className="font-mono">{reviewCluster.primaryIp}</span>
                </p>
              )}
              {reviewCluster.primaryDevice && (
                <p className="text-xs text-gray-600 break-all">
                  <span className="font-semibold text-gray-700">Device:</span>{' '}
                  <span className="font-mono">{reviewCluster.primaryDevice}</span>
                </p>
              )}
              <p className="text-sm text-gray-600">
                Total approved deposits:{' '}
                <span className="text-[#111827] font-semibold">
                  ৳{Number(reviewCluster.totalDeposits || 0).toLocaleString()}
                </span>
              </p>
              <div className="space-y-2">
                {reviewCluster.accounts.map((acc) => (
                  <div
                    key={acc._id}
                    className="flex items-center justify-between gap-2 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                        User ID
                      </p>
                      <p className="font-semibold text-[#243a48] break-all font-mono text-xs">
                        {formatUserId(acc._id)}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate mt-1">{acc.userName}</p>
                      <p className="text-[11px] text-gray-500 truncate">{acc.email}</p>
                      <p className="text-[11px] text-gray-500">
                        Last login: {acc.lastLogin ? formatIST(acc.lastLogin) : 'Never'}
                      </p>
                      {acc.lastIP && (
                        <p className="text-[10px] font-mono text-gray-400 truncate">
                          {acc.lastIP}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setBlockTarget(acc)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
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
