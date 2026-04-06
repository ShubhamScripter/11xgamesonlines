import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import axiosInstance from '../../utils/axiosInstance';

const DEPOSIT_UPLOADS_BASE = 'https://11xgames.online';

function resolveDepositImageUrl(value) {
  let src = String(value || '').trim();
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) {
    try {
      src = new URL(src).pathname || '';
    } catch {
      return src;
    }
  }
  if (!src) return '';
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${DEPOSIT_UPLOADS_BASE.replace(/\/$/, '')}${path}`;
}

const formatKey = (key) =>
  String(key || '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase());

function ManualDepositRequests({ requestType = 'deposit' }) {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState('');
  const [rejectingId, setRejectingId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const statusOptions = ['pending', 'approved', 'rejected'];
  const isWithdrawPage = requestType === 'withdraw';

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/deposit-requests', {
        params: {
          ...(status ? { status } : {}),
          requestType,
        },
      });
      setRequests(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [status, requestType]);

  useEffect(() => {
    let mounted = true;

    const safeFetch = async () => {
      if (!mounted) return;
      await fetchRequests();
    };

    const id = setInterval(safeFetch, 15000);
    window.addEventListener('focus', safeFetch);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') safeFetch();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      mounted = false;
      clearInterval(id);
      window.removeEventListener('focus', safeFetch);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
    // keep it in sync with current filters
  }, [status, requestType]);

  const reviewRequest = async (requestId, action, adminRemarkOverride) => {
    setReviewingId(requestId);
    try {
      await axiosInstance.patch(`/admin/deposit-requests/${requestId}/review`, {
        action,
        adminRemark:
          action === 'approve'
            ? 'Approved by admin'
            : adminRemarkOverride && String(adminRemarkOverride).trim()
              ? String(adminRemarkOverride).trim()
              : 'Rejected by admin',
      });
      toast.success(`Request ${action}d`);
      await fetchRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Review failed');
    } finally {
      setReviewingId('');
    }
  };

  const startReject = (requestId) => {
    setRejectingId(requestId);
    setRejectReason('');
  };

  const cancelReject = () => {
    setRejectingId('');
    setRejectReason('');
  };

  const confirmReject = async (requestId) => {
    await reviewRequest(requestId, 'reject', rejectReason);
    cancelReject();
  };

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700] mb-3">
        {isWithdrawPage ? 'Manual Withdraw Requests' : 'Manual Deposit Requests'}
      </h2>

      <div className="mb-3 bg-white border rounded-lg p-2 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setStatus(opt)}
              className={`px-3 py-2 text-sm rounded-lg font-semibold uppercase ${
                status === opt
                  ? 'bg-[#243a48] text-white'
                  : 'bg-[#f3f4f6] text-[#243a48]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white border rounded-lg overflow-auto shadow-sm">
        <table className="w-full text-xs min-w-[760px]">
          <thead className="bg-[#e4e4e4]">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Method</th>
              {isWithdrawPage ? <th className="p-2 text-left">Bank Details</th> : null}
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Ref</th>
              {!isWithdrawPage ? <th className="p-2 text-left">Screenshot</th> : null}
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3 text-center" colSpan={8}>Loading...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td className="p-3 text-center" colSpan={8}>No requests found</td></tr>
            ) : (
              requests.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-2">{r.userName}</td>
                  <td className="p-2">{r.method}</td>
                  {isWithdrawPage ? (
                    <td className="p-2">
                      {r?.accountSnapshot?.details ? (
                        <div className="space-y-1 text-[11px] leading-4">
                          {Object.entries(r.accountSnapshot.details)
                            .filter(([key, value]) => key !== 'method' && String(value || '').trim())
                            .map(([key, value]) => (
                              <div key={key}>
                                <b>{formatKey(key)}:</b> {String(value)}
                              </div>
                            ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  ) : null}
                  <td className="p-2">{Number(r.amount || 0).toFixed(2)}</td>
                  <td className="p-2">{r.referenceId || '-'}</td>
                  {!isWithdrawPage ? (
                    <td className="p-2">
                      {r.paymentImageUrl ? (
                        <a
                          href={resolveDepositImageUrl(r.paymentImageUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  ) : null}
                  <td className="p-2">{r.status}</td>
                  <td className="p-2">
                    {r.status === 'pending' ? (
                      <div className="flex gap-2">
                        {rejectingId === r._id ? (
                          <div className="flex flex-col gap-1 w-full">
                            <textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Enter reject reason for user"
                              className="border rounded px-2 py-1 text-xs w-full"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                disabled={reviewingId === r._id}
                                className="bg-red-600 text-white px-2 py-1 rounded"
                                onClick={() => confirmReject(r._id)}
                              >
                                Confirm Reject
                              </button>
                              <button
                                disabled={reviewingId === r._id}
                                className="bg-gray-200 text-gray-800 px-2 py-1 rounded"
                                onClick={cancelReject}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              disabled={reviewingId === r._id}
                              className="bg-green-600 text-white px-2 py-1 rounded"
                              onClick={() => reviewRequest(r._id, 'approve')}
                            >
                              Approve
                            </button>
                            <button
                              disabled={reviewingId === r._id}
                              className="bg-red-600 text-white px-2 py-1 rounded"
                              onClick={() => startReject(r._id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <span>{r.adminRemark || '-'}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManualDepositRequests;
