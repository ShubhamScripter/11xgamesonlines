import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaLink, FaMicrophone, FaUsers } from 'react-icons/fa';
import { IoMdRefresh } from 'react-icons/io';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axios from '../../utils/axiosInstance';
import BalanceCard from '../../components/downListComp/admin/BalanceCard';
import { formatIST } from '../../utils/time';

const AGENT_ROLES = ['agent', 'superAgent'];

function fmtMoney(n, currency = 'BDT') {
  const v = Number(n) || 0;
  return currency === 'USDT' ? `$${v.toFixed(2)}` : `BDT ${v.toFixed(2)}`;
}

function weekLabel(start, end) {
  if (!start || !end) return 'Current week';
  return `${formatIST(start, '')} — ${formatIST(end, '')}`;
}

function AgentDashboard() {
  const user = useSelector((state) => state.auth.user);
  const isAgent = AGENT_ROLES.includes(user?.role);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/agent/affiliate/dashboard');
      setData(res?.data?.data || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAgent) load();
  }, [isAgent, load]);

  const copyLink = () => {
    const link = data?.referralLink;
    if (!link) return;
    navigator.clipboard.writeText(link).then(
      () => toast.success('Referral link copied'),
      () => toast.error('Could not copy')
    );
  };

  const summary = data?.summary || {};
  const downline = data?.downline || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return downline;
    return downline.filter(
      (u) =>
        String(u.userName || '').toLowerCase().includes(q) ||
        String(u.name || '').toLowerCase().includes(q)
    );
  }, [downline, search]);

  const balanceCards = useMemo(
    () => [
      { label: 'Total Commission Earned', value: fmtMoney(summary.totalCommission) },
      {
        label: 'This Week Commission',
        value: fmtMoney(summary.weeklyCommission),
        highlight: true,
      },
      { label: 'Referred Users', value: String(summary.referredUsersCount ?? 0) },
      { label: 'Downline Total Balance', value: fmtMoney(summary.totalDownlineBalance) },
      { label: 'Downline Avail. Balance', value: fmtMoney(summary.totalDownlineAvBalance) },
    ],
    [summary]
  );

  if (!isAgent) {
    return (
      <div className="p-4 text-[#243a48] font-['Times_New_Roman']">
        Agent dashboard is only for affiliate agents.
      </div>
    );
  }

  if (loading && !data) {
    return <div className="p-4 text-[#243a48]">Loading agent dashboard...</div>;
  }

  return (
    <div className="font-['Times_New_Roman']">
      <div className="p-1 rounded-lg flex items-center justify-start gap-1 bg-gradient-to-b from-[#2a3a43] via-[#2a3a43] to-[#1c282d]">
        <FaMicrophone className="text-white text-sm" />
        <span className="text-white text-sm">Agent Dashboard</span>
      </div>

      <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
        <div>
          <h1 className="text-[#243a48] text-[16px] font-[700] flex items-center gap-2">
            <FaUsers className="text-[#243a48]" />
            Welcome, {data?.agent?.userName || user?.userName}
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Commission rate: {data?.agent?.commissionPercent ?? 0}% on referred user losses
            {summary.moduleEnabled === false ? (
              <span className="text-amber-700 font-semibold ml-2">
                (Affiliate module is currently disabled by admin)
              </span>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-sm p-1 border border-[#bbb] shadow-[inset_0_2px_0_0_#ffffff80] bg-gradient-to-b from-white to-[#eee] cursor-pointer disabled:opacity-50"
          title="Refresh"
        >
          <IoMdRefresh className={`font-bold text-xl ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <section className="mt-3 bg-[#e0e6e6] border border-[#7e97a7] p-4">
        <h2 className="text-[#243a48] font-[700] text-sm flex items-center gap-2">
          <FaLink /> Your Referral Link
        </h2>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <code className="text-xs bg-white border border-[#aaa] px-3 py-2 rounded flex-1 min-w-0 break-all">
            {data?.referralLink || '—'}
          </code>
          <button
            type="button"
            onClick={copyLink}
            className="bg-[#243a48] text-white px-4 py-2 rounded text-sm font-semibold shrink-0"
          >
            Copy Link
          </button>
        </div>
        <p className="text-[11px] text-gray-600 mt-2">
          Agent code: <span className="font-mono font-semibold">{data?.agent?.code}</span> — share
          the link so new users register under your downline.
        </p>
      </section>

      <BalanceCard balanceData={balanceCards} />

      <p className="text-xs text-gray-500 mt-2 px-1">
        Weekly period: {weekLabel(summary.weekStart, summary.weekEnd)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search referred user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-[#aaa] px-3 py-1.5 text-sm bg-white rounded outline-none w-56"
        />
        <span className="text-xs text-gray-600">
          Showing {filtered.length} of {downline.length} referred users
        </span>
      </div>

      <div className="mt-2 bg-white border border-[#7e97a7] overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-[#e0e6e6]">
            <tr>
              <th className="text-left p-2 font-semibold text-[#243a48]">#</th>
              <th className="text-left p-2 font-semibold text-[#243a48]">Referred User</th>
              <th className="text-left p-2 font-semibold text-[#243a48]">Joined</th>
              <th className="text-right p-2 font-semibold text-[#243a48]">Balance</th>
              <th className="text-right p-2 font-semibold text-[#243a48]">Avail. Balance</th>
              <th className="text-right p-2 font-semibold text-[#243a48]">Betting P/L</th>
              <th className="text-right p-2 font-semibold text-[#243a48]">User Loss</th>
              <th className="text-right p-2 font-semibold text-[#243a48]">Your Commission</th>
              <th className="text-right p-2 font-semibold text-[#243a48]">This Week</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr key={row._id} className="border-t border-[#e0e6e6] hover:bg-[#f8f9fa]">
                <td className="p-2 text-gray-500">{idx + 1}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#14805e] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      CL
                    </span>
                    <div>
                      <p className="font-semibold text-[#243a48]">{row.userName}</p>
                      {row.name && row.name !== row.userName ? (
                        <p className="text-[11px] text-gray-500">{row.name}</p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="p-2 text-xs text-gray-600 whitespace-nowrap">
                  {formatIST(row.joinedAt)}
                </td>
                <td className="p-2 text-right font-medium">{fmtMoney(row.balance, row.currency)}</td>
                <td className="p-2 text-right">{fmtMoney(row.avbalance, row.currency)}</td>
                <td
                  className={`p-2 text-right font-medium ${
                    row.bettingProfitLoss < 0 ? 'text-red-600' : 'text-green-700'
                  }`}
                >
                  {fmtMoney(row.bettingProfitLoss, row.currency)}
                </td>
                <td className="p-2 text-right text-red-600">{fmtMoney(row.totalUserLoss)}</td>
                <td className="p-2 text-right font-bold text-[#14805e]">
                  {fmtMoney(row.totalCommission)}
                </td>
                <td className="p-2 text-right font-semibold text-[#243a48]">
                  {fmtMoney(row.weeklyCommission)}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-500">
                  {downline.length
                    ? 'No users match your search.'
                    : 'No referred users yet. Share your referral link to onboard players.'}
                </td>
              </tr>
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot className="bg-[#f3f4f6] border-t-2 border-[#7e97a7] font-semibold text-[#243a48]">
              <tr>
                <td colSpan={3} className="p-2 text-right">
                  Totals ({filtered.length} users)
                </td>
                <td className="p-2 text-right">
                  {fmtMoney(filtered.reduce((s, r) => s + r.balance, 0))}
                </td>
                <td className="p-2 text-right">
                  {fmtMoney(filtered.reduce((s, r) => s + r.avbalance, 0))}
                </td>
                <td className="p-2 text-right">
                  {fmtMoney(filtered.reduce((s, r) => s + r.bettingProfitLoss, 0))}
                </td>
                <td className="p-2 text-right text-red-600">
                  {fmtMoney(filtered.reduce((s, r) => s + r.totalUserLoss, 0))}
                </td>
                <td className="p-2 text-right text-[#14805e]">
                  {fmtMoney(filtered.reduce((s, r) => s + r.totalCommission, 0))}
                </td>
                <td className="p-2 text-right">
                  {fmtMoney(filtered.reduce((s, r) => s + r.weeklyCommission, 0))}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default AgentDashboard;
