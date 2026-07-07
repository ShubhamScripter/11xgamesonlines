import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from '../../utils/axiosInstance';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

function GiftCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [claimsFor, setClaimsFor] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [form, setForm] = useState({
    couponCode: '',
    valueAmount: '',
    maxValids: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/admin/coupons');
      setCoupons(data?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/admin/coupons', {
        couponCode: form.couponCode,
        valueAmount: Number(form.valueAmount),
        maxValids: Number(form.maxValids),
      });
      setForm({ couponCode: '', valueAmount: '', maxValids: '' });
      await load();
      toast.success('Coupon created.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await axios.patch(`/admin/coupons/${id}`, { isActive: !isActive });
      await load();
      toast.success(isActive ? 'Coupon deactivated.' : 'Coupon activated.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await axios.delete(`/admin/coupons/${id}`);
      await load();
      if (claimsFor === id) setClaimsFor(null);
      toast.success('Coupon deleted.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  const viewClaims = async (coupon) => {
    if (claimsFor === coupon._id) {
      setClaimsFor(null);
      return;
    }
    setClaimsFor(coupon._id);
    setLoadingClaims(true);
    try {
      const { data } = await axios.get(`/admin/coupons/${coupon._id}/claims`);
      setClaims(data?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load claims');
      setClaims([]);
    } finally {
      setLoadingClaims(false);
    }
  };

  const totalClaimed = coupons.reduce((sum, c) => sum + (c.currentUses || 0), 0);
  const totalValue = coupons.reduce(
    (sum, c) => sum + (c.currentUses || 0) * (c.valueAmount || 0),
    0
  );

  return (
    <div className="mt-4 p-2 font-['Times_New_Roman'] max-w-5xl">
      <h1 className="text-[#243a48] text-[16px] font-[700]">Gift Coupons</h1>
      <p className="text-sm text-gray-600 mt-1">
        Create promotional coupons. Each user can claim a coupon only once.
      </p>

      <div className="grid md:grid-cols-3 gap-3 mt-4">
        <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-3">
          <p className="text-xs text-gray-600">Total Coupons</p>
          <p className="text-xl font-bold text-[#243a48]">{coupons.length}</p>
        </div>
        <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-3">
          <p className="text-xs text-gray-600">Total Claims</p>
          <p className="text-xl font-bold text-[#243a48]">{totalClaimed}</p>
        </div>
        <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-3">
          <p className="text-xs text-gray-600">Total Value Redeemed</p>
          <p className="text-xl font-bold text-[#243a48]">{totalValue.toLocaleString()}</p>
        </div>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-4 mt-4 grid md:grid-cols-4 gap-3"
      >
        <input
          className="border border-[#aaa] px-3 py-2 rounded text-sm bg-white"
          placeholder="Coupon code"
          value={form.couponCode}
          onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
          required
        />
        <input
          className="border border-[#aaa] px-3 py-2 rounded text-sm bg-white"
          type="number"
          min="1"
          placeholder="Value amount"
          value={form.valueAmount}
          onChange={(e) => setForm({ ...form, valueAmount: e.target.value })}
          required
        />
        <input
          className="border border-[#aaa] px-3 py-2 rounded text-sm bg-white"
          type="number"
          min="1"
          placeholder="Max uses"
          value={form.maxValids}
          onChange={(e) => setForm({ ...form, maxValids: e.target.value })}
          required
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-[#243a48] text-white rounded px-4 py-2 font-semibold text-sm disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Create Coupon'}
        </button>
      </form>

      {loading ? (
        <p className="mt-4 text-[#243a48]">Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-[#7e97a7] mt-4">
          <table className="w-full text-sm">
            <thead className="bg-[#e0e6e6]">
              <tr>
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Value</th>
                <th className="text-left p-2">Uses</th>
                <th className="text-left p-2">Remaining</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Created</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <React.Fragment key={c._id}>
                  <tr className="border-t border-[#e0e6e6]">
                    <td className="p-2 font-mono font-semibold">{c.couponCode}</td>
                    <td className="p-2">{c.valueAmount}</td>
                    <td className="p-2">
                      {c.currentUses}/{c.maxValids}
                    </td>
                    <td className="p-2">
                      {c.remainingSlots ?? Math.max(0, c.maxValids - c.currentUses)}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-2 text-xs">{formatDate(c.createdAt)}</td>
                    <td className="p-2 space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        className="text-[#243a48] underline text-xs font-semibold"
                        onClick={() => viewClaims(c)}
                      >
                        {claimsFor === c._id ? 'Hide' : 'Claims'}
                      </button>
                      <button
                        type="button"
                        className="text-blue-700 underline text-xs"
                        onClick={() => toggleActive(c._id, c.isActive)}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className="text-red-700 underline text-xs"
                        onClick={() => remove(c._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {claimsFor === c._id && (
                    <tr className="bg-[#f8f9fa]">
                      <td colSpan={7} className="p-3">
                        {loadingClaims ? (
                          <p className="text-sm text-gray-500">Loading claims...</p>
                        ) : claims.length ? (
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-gray-600">
                                <th className="pb-1 pr-4">User</th>
                                <th className="pb-1 pr-4">Amount</th>
                                <th className="pb-1">Claimed At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {claims.map((cl) => (
                                <tr key={cl._id} className="border-t border-gray-200">
                                  <td className="py-1 pr-4 font-mono">{cl.userName}</td>
                                  <td className="py-1 pr-4">{cl.valueAmount}</td>
                                  <td className="py-1">{formatDate(cl.claimedAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-sm text-gray-500">No claims yet for this coupon.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {!coupons.length && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No coupons yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GiftCoupons;
