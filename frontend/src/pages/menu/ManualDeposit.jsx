import React, { useEffect, useMemo, useState } from 'react';
import { MdArrowBackIos } from 'react-icons/md';
import { toast } from 'react-hot-toast';

import HeaderLogin from '../../components/Header/HeaderLogin';
import api from '../../utils/axiosConfig';

const METHOD_OPTIONS = [
  { id: 'bank', label: 'BANK' },
  { id: 'upi', label: 'UPI' },
  { id: 'crypto', label: 'CRYPTO' },
  { id: 'whatsapp', label: 'WHATSAPP' },
];
const REQUEST_TYPES = [
  { id: 'deposit', label: 'DEPOSIT' },
  { id: 'withdraw', label: 'WITHDRAW' },
];
const INITIAL_WITHDRAW_DETAILS = {
  accountHolderName: '',
  accountNumber: '',
  confirmAccountNumber: '',
  bankName: '',
  branchName: '',
  ifscCode: '',
  upiId: '',
  walletAddress: '',
  network: '',
  phoneNumber: '',
};

function ManualDeposit() {
  const [requestType, setRequestType] = useState('deposit');
  const [method, setMethod] = useState('bank');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [bonusType, setBonusType] = useState('No Bonus');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentImage, setPaymentImage] = useState(null);
  const [paymentImagePreview, setPaymentImagePreview] = useState('');
  const [withdrawDetails, setWithdrawDetails] = useState(INITIAL_WITHDRAW_DETAILS);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a._id === selectedAccountId),
    [accounts, selectedAccountId]
  );
  const imageBase = (api?.defaults?.baseURL || '').replace('/api', '');
  const resolveImageUrl = (value) => {
    let src = String(value || '').trim();
    if (
      (src.startsWith('"') && src.endsWith('"')) ||
      (src.startsWith("'") && src.endsWith("'"))
    ) {
      src = src.slice(1, -1).trim();
    }
    if (!src) return '';
    if (src.startsWith('http')) return src;
    return `${imageBase}${src.startsWith('/') ? src : `/${src}`}`;
  };

  const loadAccounts = async (selectedMethod) => {
    setLoading(true);
    try {
      const res = await api.get('/user/deposit-accounts', {
        params: { method: selectedMethod },
      });
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setAccounts(list);
      setSelectedAccountId(list[0]?._id || '');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Accounts load failed');
      setAccounts([]);
      setSelectedAccountId('');
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    try {
      const res = await api.get('/user/deposit-requests');
      setRequests(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Request history load failed');
    }
  };

  useEffect(() => {
    if (requestType !== 'deposit') {
      setAccounts([]);
      setSelectedAccountId('');
      return;
    }
    loadAccounts(method);
  }, [method, requestType]);

  useEffect(() => {
    loadMyRequests();
  }, []);

  useEffect(() => {
    return () => {
      if (paymentImagePreview) {
        URL.revokeObjectURL(paymentImagePreview);
      }
    };
  }, [paymentImagePreview]);

  const submitRequest = async (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (requestType === 'deposit' && !selectedAccountId) {
      toast.error('Please select an account');
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('Please enter valid amount');
      return;
    }
    if (requestType === 'deposit' && !paymentImage) {
      toast.error('Please upload payment screenshot');
      return;
    }
    if (requestType === 'withdraw') {
      if (method === 'bank') {
        if (!withdrawDetails.accountHolderName.trim()) {
          toast.error('Please enter account holder name');
          return;
        }
        if (!withdrawDetails.accountNumber.trim()) {
          toast.error('Please enter account number');
          return;
        }
        if (
          withdrawDetails.accountNumber.trim() !==
          withdrawDetails.confirmAccountNumber.trim()
        ) {
          toast.error('Account number and confirm account number must match');
          return;
        }
        if (!withdrawDetails.bankName.trim()) {
          toast.error('Please enter bank name');
          return;
        }
        if (!withdrawDetails.ifscCode.trim()) {
          toast.error('Please enter IFSC code');
          return;
        }
      } else if (method === 'upi') {
        if (!withdrawDetails.upiId.trim()) {
          toast.error('Please enter UPI ID');
          return;
        }
      } else if (method === 'crypto') {
        if (!withdrawDetails.walletAddress.trim()) {
          toast.error('Please enter wallet address');
          return;
        }
        if (!withdrawDetails.network.trim()) {
          toast.error('Please enter network');
          return;
        }
      } else if (method === 'whatsapp') {
        if (!withdrawDetails.phoneNumber.trim()) {
          toast.error('Please enter WhatsApp number');
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('requestType', requestType);
      formData.append('amount', String(amt));
      formData.append('method', method);
      if (requestType === 'deposit') {
        formData.append('accountId', selectedAccountId);
      }
      formData.append('referenceId', referenceId.trim());
      formData.append('paymentNote', paymentNote.trim());
      formData.append('bonusType', bonusType);
      if (requestType === 'withdraw') {
        formData.append('withdrawDetails', JSON.stringify(withdrawDetails));
      }
      if (requestType === 'deposit' && paymentImage) {
        formData.append('paymentImage', paymentImage);
      }

      await api.post('/user/deposit-requests', formData);
      toast.success(
        requestType === 'withdraw'
          ? 'Withdraw request submitted'
          : 'Deposit request submitted'
      );
      setAmount('');
      setReferenceId('');
      setPaymentNote('');
      setPaymentImage(null);
      setPaymentImagePreview('');
      if (requestType === 'withdraw') {
        setWithdrawDetails(INITIAL_WITHDRAW_DETAILS);
      }
      await loadMyRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <HeaderLogin />
      <div className="bg-[#000] h-10 flex items-center px-5 relative">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className="text-white text-2xl font-semibold" />
        </div>
        <span className="text-white text-sm md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">
          Self Deposit / Withdraw
        </span>
      </div>

      <div className="bg-[#f1f7ff] min-h-[80vh] p-3 space-y-3">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="text-sm font-semibold mb-2">Select Request Type</div>
          <div className="grid grid-cols-2 gap-2">
            {REQUEST_TYPES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRequestType(item.id)}
                className={`px-3 py-2 rounded-lg border text-sm font-semibold transition ${
                  requestType === item.id
                    ? 'bg-[#243a48] text-white border-[#243a48] shadow'
                    : 'bg-white text-[#1f2937] border-gray-300 hover:border-[#243a48]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="text-sm font-semibold mb-2">
            Select {requestType === 'withdraw' ? 'Payout Method' : 'Method'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {METHOD_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMethod(item.id)}
                className={`px-3 py-2 rounded-lg border text-sm font-semibold transition ${
                  method === item.id
                    ? 'bg-[#19A044] text-white border-[#19A044] shadow'
                    : 'bg-white text-[#1f2937] border-gray-300 hover:border-[#19A044]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {requestType === 'deposit' ? (
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-sm font-semibold mb-2">Account Details</div>
            {loading ? (
              <div className="text-sm text-gray-500">Loading accounts...</div>
            ) : accounts.length === 0 ? (
              <div className="text-sm text-red-500">No account found for selected method.</div>
            ) : (
              <>
                <select
                  className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                >
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.title}
                    </option>
                  ))}
                </select>
                {selectedAccount && (
                  <div className="text-xs bg-[#f6f8fa] p-3 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(selectedAccount.details || {}).map(([key, value]) => {
                      if (value == null || String(value).trim() === '') return null;
                      const isImageField =
                        key.toLowerCase().includes('qr') ||
                        key.toLowerCase().includes('image');
                      return (
                        <div
                          key={key}
                          className={`bg-white rounded p-2 border border-[#e5e7eb] ${
                            isImageField ? 'sm:col-span-2' : ''
                          }`}
                        >
                          <div className="text-[10px] uppercase tracking-wide text-gray-500">{key}</div>
                          {isImageField ? (
                            <div className="mt-2 flex justify-center">
                              <img
                                src={resolveImageUrl(value)}
                                alt={key}
                                className="w-56 h-56 sm:w-64 sm:h-64 rounded-xl border object-contain bg-white p-2"
                                onError={(e) => {
                                  try {
                                    const raw = String(value || '');
                                    const parsed = raw.startsWith('http') ? new URL(raw) : null;
                                    const fallbackPath = parsed?.pathname || raw;
                                    if (!e.currentTarget.dataset.fallback) {
                                      e.currentTarget.dataset.fallback = '1';
                                      e.currentTarget.src = `${window.location.origin}${fallbackPath.startsWith('/') ? fallbackPath : `/${fallbackPath}`}`;
                                    }
                                  } catch {
                                    // ignore fallback errors
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="text-[12px] font-semibold text-gray-900 break-all">{String(value)}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}

        <form onSubmit={submitRequest} className="bg-white rounded-xl p-3 shadow-sm">
          <div className="text-sm font-semibold mb-2">
            Submit {requestType === 'withdraw' ? 'Withdraw' : 'Deposit'} Request
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="number"
              step="0.01"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter Amount (INR)"
              required
            />
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder={
                requestType === 'withdraw'
                  ? 'Enter UPI ID / Mobile / Request Ref'
                  : 'Enter Reference ID/UTR'
              }
            />
            {requestType === 'deposit' ? (
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={bonusType}
                onChange={(e) => setBonusType(e.target.value)}
              >
                <option>No Bonus</option>
                <option>FTD 500% Bonus</option>
              </select>
            ) : (
              <>
                {method === 'bank' ? (
                  <>
                    <input
                      type="text"
                      value={withdrawDetails.accountHolderName}
                      onChange={(e) =>
                        setWithdrawDetails((prev) => ({
                          ...prev,
                          accountHolderName: e.target.value,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Account Holder Name"
                      required
                    />
                    <input
                      type="text"
                      value={withdrawDetails.accountNumber}
                      onChange={(e) =>
                        setWithdrawDetails((prev) => ({
                          ...prev,
                          accountNumber: e.target.value,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Account Number"
                      required
                    />
                    <input
                      type="text"
                      value={withdrawDetails.confirmAccountNumber}
                      onChange={(e) =>
                        setWithdrawDetails((prev) => ({
                          ...prev,
                          confirmAccountNumber: e.target.value,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Confirm Account Number"
                      required
                    />
                    <input
                      type="text"
                      value={withdrawDetails.bankName}
                      onChange={(e) =>
                        setWithdrawDetails((prev) => ({
                          ...prev,
                          bankName: e.target.value,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Bank Name"
                      required
                    />
                    <input
                      type="text"
                      value={withdrawDetails.branchName}
                      onChange={(e) =>
                        setWithdrawDetails((prev) => ({
                          ...prev,
                          branchName: e.target.value,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Branch Name"
                    />
                    <input
                      type="text"
                      value={withdrawDetails.ifscCode}
                      onChange={(e) =>
                        setWithdrawDetails((prev) => ({
                          ...prev,
                          ifscCode: e.target.value,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="IFSC Code"
                      required
                    />
                  </>
                ) : null}
                {method === 'upi' ? (
                  <input
                    type="text"
                    value={withdrawDetails.upiId}
                    onChange={(e) =>
                      setWithdrawDetails((prev) => ({
                        ...prev,
                        upiId: e.target.value,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="UPI ID"
                    required
                  />
                ) : null}
                {method === 'crypto' ? (
                  <>
                    <input
                      type="text"
                      value={withdrawDetails.walletAddress}
                      onChange={(e) =>
                        setWithdrawDetails((prev) => ({
                          ...prev,
                          walletAddress: e.target.value,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Wallet Address"
                      required
                    />
                    <input
                      type="text"
                      value={withdrawDetails.network}
                      onChange={(e) =>
                        setWithdrawDetails((prev) => ({
                          ...prev,
                          network: e.target.value,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Network (e.g. TRC20, ERC20)"
                      required
                    />
                  </>
                ) : null}
                {method === 'whatsapp' ? (
                  <input
                    type="text"
                    value={withdrawDetails.phoneNumber}
                    onChange={(e) =>
                      setWithdrawDetails((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="WhatsApp Number"
                    required
                  />
                ) : null}
              </>
            )}
            {requestType === 'deposit' ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPaymentImage(file);
                    if (file) {
                      setPaymentImagePreview(URL.createObjectURL(file));
                    } else {
                      setPaymentImagePreview('');
                    }
                  }}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                {paymentImage ? (
                  <div className="sm:col-span-2 border rounded-lg p-2 bg-[#f8fafc]">
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      Selected file: {paymentImage.name}
                    </div>
                    {paymentImagePreview ? (
                      <img
                        src={paymentImagePreview}
                        alt="Payment screenshot preview"
                        className="w-40 h-40 rounded border object-contain bg-white"
                      />
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="sm:col-span-2 text-xs text-[#4b5563] bg-[#f8fafc] border rounded-lg p-2">
                Screenshot upload is not required for withdraw request.
              </div>
            )}
          </div>
          <textarea
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-2"
            rows={3}
            placeholder="Payment note"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-lg bg-[#19A044] text-white font-semibold disabled:opacity-60 mt-2"
          >
            {submitting
              ? 'Submitting...'
              : requestType === 'withdraw'
                ? 'Submit Withdraw Request'
                : 'Confirm Payment'}
          </button>
        </form>

        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="text-sm font-semibold mb-2">My Requests</div>
          <div className="overflow-auto">
            <table className="w-full text-xs min-w-[620px]">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Date</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Screenshot</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-3 text-center text-gray-500">
                      No requests yet
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r._id} className="border-b">
                      <td className="py-2">{new Date(r.createdAt).toLocaleString()}</td>
                      <td>{r.requestType || 'deposit'}</td>
                      <td>{r.method}</td>
                      <td>{Number(r.amount || 0).toFixed(2)}</td>
                      <td>{r.status}</td>
                      <td>
                        {r.paymentImageUrl ? (
                          <a
                            href={resolveImageUrl(r.paymentImageUrl)}
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
                      <td>{r.adminRemark || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManualDeposit;
