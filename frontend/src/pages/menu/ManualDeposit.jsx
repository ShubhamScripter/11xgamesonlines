import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdArrowBackIos, MdContentCopy } from 'react-icons/md';
import { RiWhatsappFill } from 'react-icons/ri';
import { toast } from 'react-hot-toast';

import HeaderLogin from '../../components/Header/HeaderLogin';
import api from '../../utils/axiosConfig';

function buildWhatsAppChatUrl(digits, message) {
  const d = String(digits || '').replace(/\D/g, '');
  if (d.length < 10) return '';
  const q = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${d}${q}`;
}

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
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const [requestType, setRequestType] = useState(() => {
    const t = searchParams.get('type');
    return t === 'withdraw' || t === 'deposit' ? t : 'deposit';
  });
  const [method, setMethod] = useState('bank');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentImage, setPaymentImage] = useState(null);
  const [paymentImagePreview, setPaymentImagePreview] = useState('');
  const [withdrawDetails, setWithdrawDetails] = useState(INITIAL_WITHDRAW_DETAILS);
  const [supportWaDigits, setSupportWaDigits] = useState('');
  const [showMethods, setShowMethods] = useState(true);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a._id === selectedAccountId),
    [accounts, selectedAccountId]
  );
  /** Static files host — API returns paths starting with `/uploads/...` only. */
  const DEPOSIT_UPLOADS_BASE = 'http://ag.11xgames.online';
  const MY_REQUEST_IMAGE_BASE_URL = 'https://11xgames.online';
  const copyToClipboard = async (text) => {
    const t = String(text ?? '').trim();
    if (!t) return;
    try {
      await navigator.clipboard.writeText(t);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Could not copy');
    }
  };

  const resolveImageUrl = (value) => {
    let src = String(value || '').trim();
    if (
      (src.startsWith('"') && src.endsWith('"')) ||
      (src.startsWith("'") && src.endsWith("'"))
    ) {
      src = src.slice(1, -1).trim();
    }
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
  };

  const loadAccounts = async (selectedMethod, { silent } = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/user/deposit-accounts', {
        params: { method: selectedMethod },
      });
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setAccounts(list);
      setSelectedAccountId(list[0]?._id || '');
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || 'Accounts load failed');
      }
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
    loadAccounts(method, { silent: method === 'whatsapp' });
  }, [method, requestType]);

  useEffect(() => {
    loadMyRequests();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/public/app-settings');
        const raw = data?.data?.supportWhatsApp || '';
        const digits = String(raw).replace(/\D/g, '');
        if (!cancelled && digits.length >= 10) setSupportWaDigits(digits);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = searchParams.get('type');
    if (t === 'withdraw' || t === 'deposit') {
      setRequestType(t);
    }
  }, [searchParams]);

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
    if (requestType === 'deposit') {
      const utrDigits = String(referenceId || '').replace(/\D/g, '');
      if (utrDigits.length !== 12) {
        toast.error('UTR must be exactly 12 digits');
        return;
      }
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
      formData.append(
        'referenceId',
        requestType === 'deposit'
          ? String(referenceId || '').replace(/\D/g, '')
          : referenceId.trim()
      );
      formData.append('paymentNote', paymentNote.trim());
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
    <div className='bg-[#141515] text-white space-y-3 px-4 md:w-[50%] mx-auto md:mt-12 fixed top-0 left-0 w-full md:static z-20 h-screen'>
      {/* <HeaderLogin /> */}
      <div className="flex items-center text-[18px] font-bold gap-2 h-[66px]">
          <MdArrowBackIos className="text-white text-md font-semibold" onClick={() => showMethods ? window.history.back() : setShowMethods(true)} />
          {requestType === 'withdraw' ? "Withdraw" :'Deposit'}
      </div>

      <div className="">
          {showMethods && (
          <div className="rounded-md flex flex-col gap-2">
            {METHOD_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMethod(item.id);
                  setShowMethods(false);
                }}
                className="text-left px-3 h-[60px] border text-sm font-semibold transition bg-[#222424] text-white border-[#222424]"
              >
                {item.label}
              </button>
            ))}
          </div>
          )}

        {!showMethods && (
        <>
        {requestType === 'deposit' ? (
          method === 'whatsapp' && !supportWaDigits ? null : (
          <div className="rounded-xl py-3 shadow-sm">
            {method === 'whatsapp' ? (
              (() => {
                const waMsg = `Hello, I want to deposit via WhatsApp.\nUsername: ${user?.userName || '—'}\nPlease assist.`;
                const waHref = buildWhatsAppChatUrl(supportWaDigits, waMsg);
                if (!waHref) return null;
                return (
                  <div>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold text-sm shadow-md active:scale-[0.99] transition-transform"
                    >
                      <RiWhatsappFill className="text-2xl shrink-0" />
                      Send to WhatsApp
                    </a>
                    <p className="text-[11px] text-gray-500 text-center mt-2">
                      Opens WhatsApp on your phone to message support for this deposit.
                    </p>
                  </div>
                );
              })()
            ) : (
              <>
                <div className="text-sm font-semibold mb-2">Account Details</div>
                {loading ? (
                  <div className="text-sm text-gray-500">Loading accounts...</div>
                ) : accounts.length === 0 ? (
                  <div className="text-sm text-red-500">No account found for selected method.</div>
                ) : (
                  <>
                    <select
                      className="w-full bg-[#222424] rounded-lg px-3 py-2 mb-3 text-sm outline-none"
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
                      <div className="text-xs rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(selectedAccount.details || {}).map(([key, value]) => {
                          if (value == null || String(value).trim() === '') return null;
                          const isImageField =
                            key.toLowerCase().includes('qr') ||
                            key.toLowerCase().includes('image');
                          return (
                            <div
                              key={key}
                              className={`rounded p-2 bg-[#222424] ${
                                isImageField ? 'sm:col-span-2' : ''
                              }`}
                            >
                              <div className="text-[10px] uppercase tracking-wide text-white">{key}</div>
                              {isImageField ? (
                                <div className="mt-2 flex justify-center">
                                  <img
                                    src={resolveImageUrl(value)}
                                    alt={key}
                                    className="w-56 h-56 sm:w-64 sm:h-64 rounded-xl border object-contain bg-[#222424] p-2"
                                    onError={(e) => {
                                      try {
                                        const raw = String(value || '');
                                        // Always resolve to the static uploads host.
                                        const resolved = resolveImageUrl(raw);
                                        if (!e.currentTarget.dataset.fallback) {
                                          e.currentTarget.dataset.fallback = '1';
                                          if (resolved) e.currentTarget.src = resolved;
                                        }
                                      } catch {
                                        // ignore fallback errors
                                      }
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="flex items-start justify-between gap-2 mt-1">
                                  <div className="text-[20px] font-semibold text-white break-all flex-1 min-w-0">
                                    {String(value)}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(value)}
                                    className="shrink-0 inline-flex items-center justify-center p-1.5 rounded-md border text-[#475569] hover:bg-[#eef2f7] active:scale-95"
                                    title="Copy"
                                    aria-label={`Copy ${key}`}
                                  >
                                    <MdContentCopy className="text-lg" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
          )
        ) : null}

        {!(requestType === 'deposit' && method === 'whatsapp') ? (
        <form onSubmit={submitRequest} className="rounded-xl shadow-sm">
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
              className="w-full bg-[#222424] rounded-lg px-3 py-2 outline-none"
              placeholder="Enter Amount (INR)"
              required
            />
            <input
              type="text"
              inputMode={requestType === 'deposit' ? 'numeric' : 'text'}
              autoComplete="off"
              value={referenceId}
              onChange={(e) => {
                if (requestType === 'deposit') {
                  const d = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setReferenceId(d);
                } else {
                  setReferenceId(e.target.value);
                }
              }}
              className="w-full bg-[#222424] rounded-lg px-3 py-2 outline-none"
              placeholder={
                requestType === 'withdraw'
                  ? 'Enter UPI ID / Mobile / Request Ref'
                  : 'Enter 12-digit UTR'
              }
              required={requestType === 'deposit'}
            />
            {requestType === 'withdraw' ? (
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
                      className="w-full bg-[#222424] rounded-lg px-3 py-2 outline-none"
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
                      className="w-full bg-[#222424] rounded-lg px-3 py-2 outline-none"
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
                      className="w-full bg-[#222424] rounded-lg px-3 py-2 outline-none"
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
                      className="w-full bg-[#222424] rounded-lg px-3 py-2 outline-none"
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
                      className="w-full bg-[#222424] rounded-lg px-3 py-2 outline-none"
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
                      className="w-full bg-[#222424] rounded-lg px-3 py-2 outline-none"
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
                    className="w-full bg-[#222424] rounded-lg px-3 py-2 outline-none"
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
                      className="w-full bg-[#222424] rounded-lg px-3 py-2 outline-none"
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
                      className="w-full bg-[#222424] rounded-lg px-3 py-2 outline-none"
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
                    className="w-full bg-[#222424] rounded-lg px-3 py-2 outline-none"
                    placeholder="WhatsApp Number"
                    required
                  />
                ) : null}
              </>
            ) : null}
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
                  className="w-full bg-[#222424] rounded-lg px-3 py-2 outline-none"
                  required
                />
                {paymentImage ? (
                  <div className="sm:col-span-2 border rounded-lg p-2 bg-[#222424]">
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      Selected file: {paymentImage.name}
                    </div>
                    {paymentImagePreview ? (
                      <img
                        src={paymentImagePreview}
                        alt="Payment screenshot preview"
                        className="w-40 h-40 rounded bg-[#222424] object-contain "
                      />
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="sm:col-span-2 text-xs text-[#4b5563] bg-[#222424] border rounded-lg p-2">
                Screenshot upload is not required for withdraw request.
              </div>
            )}
          </div>
          <textarea
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            className="w-full bg-[#222424] rounded-lg px-3 py-2 mt-2 outline-none"
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
        ) : null}
        </>
        )}

        <div className="bg-[#141515] rounded-xl py-3 shadow-sm mt-5">
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
                            href={`${MY_REQUEST_IMAGE_BASE_URL}${r.paymentImageUrl}`}
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
