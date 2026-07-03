import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  IoPhonePortraitOutline,
  IoWarningOutline,
  IoRefresh,
  IoPersonOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoBan,
  IoClose,
} from 'react-icons/io5';
import axiosInstance from '../../utils/axiosInstance';
import { formatIST } from '../../utils/time';

const STATUS_STYLES = {
  active: 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]',
  suspended: 'bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]',
  locked: 'bg-[#e5e7eb] text-[#374151] border-[#d1d5db]',
};

function StatusBadge({ status }) {
  const s = (status || 'active').toLowerCase();
  const cls = STATUS_STYLES[s] || STATUS_STYLES.locked;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${cls}`}
    >
      {s}
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
      toast.success(`${target.userName} ${status} successfully`);
      onBlocked?.();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to update user status'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(17,17,17,0.55)] flex justify-center items-start pt-16 z-50 overflow-auto">
      <div className="bg-white rounded-xl w-[420px] max-w-[92vw] relative shadow-2xl font-['Times_New_Roman'] overflow-hidden">
        <div className="flex items-center justify-between bg-[#243a48] text-white px-4 py-3">
          <h2 className="text-[15px] font-[700] flex items-center gap-2">
            <IoBan /> Block User
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <IoClose size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between border-b border-[#eee] pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#568bc8] rounded-sm px-2 py-0.5 text-white text-xs">
                {target.role}
              </span>
              <span className="font-semibold text-[#243a48]">
                {target.userName}
              </span>
            </div>
            <StatusBadge status={target.status} />
          </div>

          <p className="text-sm text-gray-600 mt-3">
            Choose a new status for this account. Blocking prevents the user
            from logging in / betting.
          </p>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { id: 'active', label: 'Active', cls: 'from-[#4cbb17] to-[#3a9212]' },
              { id: 'suspended', label: 'Suspend', cls: 'from-[#db2828] to-[#921313]' },
              { id: 'locked', label: 'Lock', cls: 'from-[#9ab6ce] to-[#536174]' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatus(opt.id)}
                className={`rounded-lg py-2 text-sm font-semibold border transition-all ${
                  status === opt.id
                    ? `bg-gradient-to-b ${opt.cls} text-white border-transparent`
                    : 'bg-[#f3f4f6] text-[#374151] border-[#d9d9d9]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="text-xs text-gray-600">Master Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password to confirm"
              className="w-full mt-1 p-2 outline-none border border-[#aaa] rounded text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm font-semibold border border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6]"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="px-4 py-2 rounded text-sm font-semibold bg-[#dc3545] text-white hover:bg-[#b91c1c] disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeviceAlerts() {
  const user = useSelector((state) => state.auth.user);
  const allowedRoles = ['superadmin', 'admin', 'subadmin', 'seniorSuper'];
  const canView = allowedRoles.includes(user?.role);

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blockTarget, setBlockTarget] = useState(null);

  const fetchDuplicateDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get('/duplicate-device-users');
      if (data.success) {
        setDevices(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Failed to fetch device alerts';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) fetchDuplicateDevices();
  }, [canView]);

  if (!canView) {
    return (
      <div className="mt-4 p-4 font-['Times_New_Roman']">
        <p className="text-red-600">
          You do not have permission to view device alerts.
        </p>
      </div>
    );
  }

  const totalAffected = devices.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="mt-4 p-3 font-['Times_New_Roman'] max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center bg-[#243a48] text-white rounded-t-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <IoPhonePortraitOutline size={22} />
          <div>
            <h2 className="text-[16px] font-[700] leading-tight">
              Device Alerts
            </h2>
            <p className="text-[11px] text-white/70">
              Multiple accounts logged in from one device
            </p>
          </div>
        </div>
        <button
          onClick={fetchDuplicateDevices}
          disabled={loading}
          className="flex items-center gap-1 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded text-sm disabled:opacity-50"
        >
          <IoRefresh className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#f8fafc] border-x border-[#e2e8f0] p-4">
        <div className="bg-white rounded-lg border border-[#e2e8f0] p-3">
          <p className="text-[11px] text-gray-500 uppercase">Flagged Devices</p>
          <p className="text-2xl font-[700] text-[#dc3545]">{devices.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#e2e8f0] p-3">
          <p className="text-[11px] text-gray-500 uppercase">Accounts Involved</p>
          <p className="text-2xl font-[700] text-[#243a48]">{totalAffected}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#e2e8f0] p-3 col-span-2 sm:col-span-1">
          <p className="text-[11px] text-gray-500 uppercase">Status</p>
          <p className="text-sm font-[700] mt-1">
            {devices.length === 0 ? (
              <span className="text-green-600">All clear</span>
            ) : (
              <span className="text-[#b45309]">Needs review</span>
            )}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white border border-[#e2e8f0] rounded-b-xl p-4">
        {error ? (
          <p className="text-red-600">❌ {error}</p>
        ) : loading ? (
          <p className="text-gray-500">Loading device alerts...</p>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <IoCheckmarkCircle className="text-green-500" size={40} />
            <p className="text-green-600 font-medium mt-2">
              No devices with multiple accounts detected
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {devices.map((item, index) => (
              <div
                key={item.deviceId}
                className="border border-[#fed7aa] rounded-lg overflow-hidden"
              >
                {/* Device header */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#fff7ed] px-3 py-2 border-b border-[#fed7aa]">
                  <div className="flex items-center gap-2 min-w-0">
                    <IoWarningOutline className="text-[#ea580c] shrink-0" />
                    <span className="text-xs text-gray-500">
                      #{index + 1} Device
                    </span>
                    <span className="font-mono text-xs bg-white border border-[#fed7aa] rounded px-2 py-0.5 break-all">
                      {item.deviceId}
                    </span>
                  </div>
                  <span className="bg-[#dc3545] text-white px-3 py-0.5 rounded-full text-xs font-bold shrink-0">
                    {item.count} accounts
                  </span>
                </div>

                {/* Accounts */}
                <div className="divide-y divide-[#f1f5f9]">
                  {item.users.map((u) => {
                    const isBlocked =
                      (u.status || '').toLowerCase() !== 'active';
                    return (
                      <div
                        key={u._id}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 hover:bg-[#f8fafc]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <IoPersonOutline className="text-gray-400 shrink-0" />
                          <span className="font-semibold text-[#243a48]">
                            {u.userName}
                          </span>
                          <StatusBadge status={u.status} />
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[11px] text-gray-500">
                            <IoTimeOutline />
                            {u.lastLogin ? formatIST(u.lastLogin) : 'Never'}
                          </span>
                          {u.lastIP && (
                            <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
                              {u.lastIP}
                            </span>
                          )}
                          <button
                            onClick={() => setBlockTarget(u)}
                            className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold border ${
                              isBlocked
                                ? 'border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6]'
                                : 'border-[#dc3545] text-white bg-[#dc3545] hover:bg-[#b91c1c]'
                            }`}
                          >
                            <IoBan size={13} />
                            {isBlocked ? 'Manage' : 'Block'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {blockTarget && (
        <BlockModal
          target={blockTarget}
          onClose={() => setBlockTarget(null)}
          onBlocked={fetchDuplicateDevices}
        />
      )}
    </div>
  );
}

export default DeviceAlerts;
