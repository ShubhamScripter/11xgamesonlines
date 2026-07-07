import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdArrowBackIos } from 'react-icons/md';
import { toast } from 'react-hot-toast';

import api from '../../utils/axiosConfig';
import { resolveUploadUrl } from '../../utils/uploadUrl';
import { formatAppDateTime } from '../../utils/time';
import {
  currencySymbol,
  normalizeCurrency,
  convertUsdtToBdt,
} from '../../utils/currency';
import useUsdtToBdtRate from '../../hooks/useUsdtToBdtRate';
import {
  DEPOSIT_MAIN_TABS,
  MIN_DEPOSIT_USDT,
  MIN_WITHDRAW_BDT,
  MOBILE_BANKING_METHODS,
  QUICK_AMOUNTS_BDT,
  formatBdPhoneDisplay,
  methodLabel,
} from '../../utils/bankingConstants';
import {
  resolveMinDeposit,
  validateDepositForm,
  validateWithdrawForm,
} from '../../utils/bankingValidation';
import ImagePreviewLink from '../../components/common/ImagePreviewLink';

const Req = () => <span className="text-red-400"> *</span>;

function copyText(text) {
  const t = String(text ?? '').trim();
  if (!t) return;
  navigator.clipboard.writeText(t).then(
    () => toast.success('Copied'),
    () => toast.error('Copy failed')
  );
}

function ProviderIcon({ method, selected }) {
  const meta = MOBILE_BANKING_METHODS.find((m) => m.id === method);
  const color = meta?.color || '#19A044';
  return (
    <div
      className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-black border-2 transition ${
        selected ? 'border-[#19A044] shadow-[0_0_0_1px_#19A044]' : 'border-transparent bg-[#1e2428]'
      }`}
      style={{ color }}
    >
      {method === 'bkash' ? 'b' : method === 'nagad' ? 'N' : 'R'}
    </div>
  );
}

function ManualDeposit() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const usdtToBdtRate = useUsdtToBdtRate();
  const isUsdtUser = normalizeCurrency(user?.currency) === 'USDT';
  const sym = currencySymbol(user?.currency);

  const [searchParams] = useSearchParams();
  const requestType = searchParams.get('type') === 'withdraw' ? 'withdraw' : 'deposit';

  const [mainTab, setMainTab] = useState('mobile_banking');
  const [mobileMethod, setMobileMethod] = useState('bkash');
  const [accounts, setAccounts] = useState([]);
  const [accountPoolSize, setAccountPoolSize] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);

  const [amount, setAmount] = useState('1000');
  const [senderPhone, setSenderPhone] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [paymentImage, setPaymentImage] = useState(null);
  const [paymentImagePreview, setPaymentImagePreview] = useState('');
  const [receivePhone, setReceivePhone] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [firstDepositBonus, setFirstDepositBonus] = useState({
    enabled: false,
    percent: 0,
    eligible: false,
    wageringPercent: 80,
  });
  const [wagering, setWagering] = useState({
    withdrawalLocked: false,
    remainingWagering: 0,
    requiredWagering: 0,
    currentWageredAmount: 0,
  });

  const activeMethod =
    requestType === 'withdraw' || mainTab === 'mobile_banking'
      ? mobileMethod
      : 'crypto';

  const selectedAccount = useMemo(
    () => accounts.find((a) => a._id === selectedAccountId),
    [accounts, selectedAccountId]
  );

  const minAmount = useMemo(() => {
    if (requestType === 'withdraw') return MIN_WITHDRAW_BDT;
    const method = mainTab === 'crypto' ? 'crypto' : mobileMethod;
    return resolveMinDeposit(method, selectedAccount?.details, isUsdtUser);
  }, [
    requestType,
    mainTab,
    mobileMethod,
    selectedAccount,
    isUsdtUser,
  ]);

  const withdrawable = Number(user?.avbalance || 0);
  const parsedAmount = Number(amount) || 0;
  const cashOutFee = 0;
  const youReceive = Math.max(0, parsedAmount - cashOutFee);
  const bonusPreviewAmount =
    requestType === 'deposit' &&
    firstDepositBonus.enabled &&
    firstDepositBonus.eligible &&
    parsedAmount > 0
      ? Math.round((parsedAmount * firstDepositBonus.percent) / 100)
      : 0;
  const totalWithBonus = parsedAmount + bonusPreviewAmount;
  const wageringTargetPreview =
    bonusPreviewAmount > 0 && parsedAmount > 0
      ? Math.round(
          ((parsedAmount + bonusPreviewAmount) * firstDepositBonus.wageringPercent) / 100
        )
      : 0;

  const loadAccounts = async () => {
    if (requestType === 'withdraw') return;
    setLoading(true);
    try {
      const res = await api.get('/user/deposit-accounts', {
        params: { method: activeMethod, _: Date.now() },
      });
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setAccounts(list);
      setAccountPoolSize(Number(res?.data?.meta?.poolSize) || list.length);
      setSelectedAccountId(list[0]?._id || '');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Accounts load failed');
      setAccounts([]);
      setAccountPoolSize(0);
      setSelectedAccountId('');
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    try {
      const res = await api.get('/user/deposit-requests');
      setRequests(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch {
      // ignore
    }
  };

  const loadFirstDepositBonus = async () => {
    if (requestType === 'withdraw') return;
    try {
      const res = await api.get('/user/first-deposit-bonus');
      const d = res?.data?.data || {};
      setFirstDepositBonus({
        enabled: Boolean(d.enabled),
        percent: Number(d.percent) || 0,
        eligible: Boolean(d.eligible),
        wageringPercent: Number(d.wageringPercent) || 80,
      });
    } catch {
      setFirstDepositBonus({ enabled: false, percent: 0, eligible: false, wageringPercent: 80 });
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [activeMethod, requestType, mainTab]);

  const loadWagering = async () => {
    try {
      const res = await api.get('/user/wagering-status');
      const d = res?.data?.data || {};
      setWagering({
        withdrawalLocked: Boolean(d.withdrawalLocked),
        remainingWagering: Number(d.remainingWagering) || 0,
        requiredWagering: Number(d.requiredWagering) || 0,
        currentWageredAmount: Number(d.currentWageredAmount) || 0,
      });
    } catch {
      setWagering({
        withdrawalLocked: false,
        remainingWagering: 0,
        requiredWagering: 0,
        currentWageredAmount: 0,
      });
    }
  };

  useEffect(() => {
    loadMyRequests();
    loadFirstDepositBonus();
    loadWagering();
  }, [requestType]);

  useEffect(() => {
    return () => {
      if (paymentImagePreview) URL.revokeObjectURL(paymentImagePreview);
    };
  }, [paymentImagePreview]);

  const destinationNumber =
    selectedAccount?.details?.phoneNumber ||
    selectedAccount?.details?.accountNumber ||
    '';

  const walletAddress = selectedAccount?.details?.walletAddress || '';
  const network = selectedAccount?.details?.network || 'TRC20 (Tron)';
  const qrUrl = selectedAccount?.details?.qrCodeUrl
    ? resolveUploadUrl(selectedAccount.details.qrCodeUrl)
    : '';

  const submitDeposit = async (e) => {
    e.preventDefault();
    const check = validateDepositForm({
      mainTab,
      mobileMethod,
      amount,
      senderPhone,
      referenceId,
      paymentImage,
      selectedAccount,
      isUsdtUser,
    });
    if (!check.ok) {
      toast.error(check.message);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('requestType', 'deposit');
      formData.append('amount', String(Number(amount)));
      formData.append('method', check.method);
      formData.append('accountId', selectedAccountId);
      formData.append('referenceId', check.referenceId);
      if (mainTab === 'mobile_banking') {
        formData.append('senderPhone', check.senderPhone);
      }
      if (paymentImage) formData.append('paymentImage', paymentImage);

      await api.post('/user/deposit-requests', formData);
      toast.success('Deposit submitted — verification usually under 2 min');
      setReferenceId('');
      setSenderPhone('');
      if (paymentImagePreview) URL.revokeObjectURL(paymentImagePreview);
      setPaymentImage(null);
      setPaymentImagePreview('');
      await loadMyRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const submitWithdraw = async (e) => {
    e.preventDefault();
    const check = validateWithdrawForm({
      mobileMethod,
      amount,
      receivePhone,
      accountPassword,
      termsAccepted,
      withdrawable,
    });
    if (!check.ok) {
      toast.error(check.message);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('requestType', 'withdraw');
      formData.append('amount', String(Number(amount)));
      formData.append('method', mobileMethod);
      formData.append('accountPassword', accountPassword);
      formData.append(
        'withdrawDetails',
        JSON.stringify({
          phoneNumber: check.phoneNumber,
          accountHolderName: user?.userName || '',
        })
      );

      await api.post('/user/deposit-requests', formData);
      toast.success('Withdraw request submitted');
      setAmount('');
      setReceivePhone('');
      setAccountPassword('');
      setTermsAccepted(false);
      await loadMyRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const headerBalance = isUsdtUser
    ? `${sym}${withdrawable.toFixed(2)}`
    : `৳${withdrawable.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white max-w-lg mx-auto flex flex-col">
      <header className="flex items-center justify-between px-4 h-14 border-b border-[#1e2428]">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <MdArrowBackIos className="text-xl" />
        </button>
        <h1 className="text-lg font-bold">
          {requestType === 'withdraw' ? 'Withdraw' : 'Deposit'}
        </h1>
        <span className="text-sm font-semibold text-[#19A044]">{headerBalance}</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-5">
        {requestType === 'deposit' ? (
          <>
            <div className="flex gap-2 p-1 bg-[#141a1f] rounded-xl">
              {DEPOSIT_MAIN_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMainTab(tab.id)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${
                    mainTab === tab.id
                      ? 'bg-[#19A044] text-white'
                      : 'text-gray-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {mainTab === 'mobile_banking' && (
              <div>
                <p className="text-xs text-gray-500 font-semibold tracking-wider mb-3">
                  CHOOSE METHOD
                </p>
                <div className="flex gap-4 justify-center">
                  {MOBILE_BANKING_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMobileMethod(m.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <ProviderIcon method={m.id} selected={mobileMethod === m.id} />
                      <span className="text-xs text-gray-400">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 font-semibold tracking-wider mb-2">
                AMOUNT ({sym})
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {sym}
                </span>
                <input
                  type="number"
                  min={minAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#141a1f] border border-[#252b31] rounded-xl py-3 pl-10 pr-24 text-lg font-semibold outline-none focus:border-[#19A044]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  min {sym}
                  {minAmount}
                </span>
              </div>
              {mainTab === 'mobile_banking' && !isUsdtUser && (
                <div className="flex gap-2 mt-3">
                  {QUICK_AMOUNTS_BDT.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(String(q))}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg border ${
                        Number(amount) === q
                          ? 'border-[#19A044] text-[#19A044] bg-[#19A044]/10'
                          : 'border-[#252b31] text-gray-300'
                      }`}
                    >
                      {q.toLocaleString()}
                    </button>
                  ))}
                </div>
              )}
              {requestType === 'deposit' &&
                firstDepositBonus.enabled &&
                firstDepositBonus.eligible &&
                firstDepositBonus.percent > 0 && (
                  <div className="mt-3 rounded-xl border border-[#19A044]/40 bg-[#19A044]/10 p-3">
                    <p className="text-sm font-semibold text-[#19A044]">
                      🎁 First deposit bonus — {firstDepositBonus.percent}% extra
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      On approval you receive deposit + bonus (one time only).
                    </p>
                    {parsedAmount > 0 && (
                      <p className="text-xs text-gray-300 mt-2">
                        {sym}
                        {parsedAmount.toLocaleString()} deposit + {sym}
                        {bonusPreviewAmount.toLocaleString()} bonus ={' '}
                        <span className="text-[#19A044] font-bold">
                          {sym}
                          {totalWithBonus.toLocaleString()}
                        </span>{' '}
                        total
                      </p>
                    )}
                    {wageringTargetPreview > 0 && (
                      <p className="text-xs text-amber-300/90 mt-2">
                        Wagering lock: play {sym}
                        {wageringTargetPreview.toLocaleString()} ({firstDepositBonus.wageringPercent}%
                        of deposit+bonus) before withdrawal.
                      </p>
                    )}
                  </div>
                )}
              {requestType === 'deposit' && wagering.withdrawalLocked && (
                <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
                  <p className="text-sm font-semibold text-amber-300">Wagering in progress</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {sym}{wagering.currentWageredAmount.toFixed(2)} / {sym}
                    {wagering.requiredWagering.toFixed(2)} played — {sym}
                    {wagering.remainingWagering.toFixed(2)} remaining to unlock withdrawal.
                  </p>
                </div>
              )}
              {isUsdtUser && usdtToBdtRate > 0 && parsedAmount > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  ≈ {convertUsdtToBdt(amount, usdtToBdtRate).toFixed(2)} BDT (1 USDT ={' '}
                  {usdtToBdtRate} BDT)
                </p>
              )}
            </div>

            {mainTab === 'mobile_banking' && (
              <div className="bg-[#141a1f] border border-[#252b31] rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#e2136e] text-white text-sm font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">
                      Send Money to this {methodLabel(mobileMethod)} number
                    </p>
                    {loading ? (
                      <p className="text-gray-500 text-sm mt-2">Loading...</p>
                    ) : !destinationNumber ? (
                      <p className="text-red-400 text-sm mt-2">
                        No account configured. Ask admin to add {methodLabel(mobileMethod)}{' '}
                        accounts.
                      </p>
                    ) : (
                      <>
                        {accountPoolSize > 1 && (
                          <p className="text-[11px] text-[#19A044]/90 mt-2">
                            A {methodLabel(mobileMethod)} number is assigned automatically from{' '}
                            {accountPoolSize} active accounts.
                          </p>
                        )}
                        <p className="text-2xl font-bold tracking-wide mt-2">
                          {formatBdPhoneDisplay(destinationNumber)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedAccount?.details?.accountType || 'Personal'} ·{' '}
                          {selectedAccount?.details?.note || 'Send Money only'}
                        </p>
                        <button
                          type="button"
                          onClick={() => copyText(destinationNumber)}
                          className="mt-2 px-4 py-1.5 rounded-lg bg-[#19A044] text-white text-sm font-semibold"
                        >
                          Copy
                        </button>
                        <p className="text-xs text-gray-500 mt-3">
                          Open {methodLabel(mobileMethod)} → Send Money → enter the number
                          above → send exactly {sym}
                          {parsedAmount || amount}.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {mainTab === 'crypto' && (
              <div className="bg-[#141a1f] border border-[#252b31] rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#26a17b] flex items-center justify-center font-bold">
                    ₮
                  </div>
                  <div>
                    <p className="font-semibold">USDT (Tether)</p>
                    <p className="text-xs text-gray-500">{network}</p>
                  </div>
                </div>
                {loading ? (
                  <p className="text-gray-500 text-sm">Loading wallet...</p>
                ) : !walletAddress ? (
                  <p className="text-red-400 text-sm">
                    No crypto wallet configured. Contact admin.
                  </p>
                ) : (
                  <>
                    {accountPoolSize > 1 && (
                      <p className="text-[11px] text-[#19A044]/90">
                        Wallet assigned automatically from {accountPoolSize} active accounts.
                      </p>
                    )}
                    <div className="flex justify-center">
                      {qrUrl ? (
                        <ImagePreviewLink
                          href={qrUrl}
                          thumbnail
                          alt="Deposit QR"
                          thumbnailClassName="w-40 h-40 rounded-xl object-contain bg-white p-2 cursor-pointer hover:opacity-95 hover:ring-2 hover:ring-[#19A044] transition"
                        />
                      ) : (
                        <div className="w-40 h-40 rounded-xl bg-[#0b0e11] border border-dashed border-gray-600 flex flex-col items-center justify-center text-xs text-gray-500">
                          <span className="text-2xl mb-1">₮</span>
                          SCAN · {network.split(' ')[0]}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Your deposit address</p>
                    <div className="flex gap-2 items-center">
                      <code className="flex-1 text-xs break-all bg-[#0b0e11] p-2 rounded-lg">
                        {walletAddress.length > 24
                          ? `${walletAddress.slice(0, 12)}...${walletAddress.slice(-12)}`
                          : walletAddress}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyText(walletAddress)}
                        className="shrink-0 px-3 py-2 rounded-lg bg-[#19A044] text-sm font-semibold"
                      >
                        Copy
                      </button>
                    </div>
                    {usdtToBdtRate > 0 && (
                      <p className="text-xs text-gray-400">
                        Rate: 1 USDT ≈ ৳{usdtToBdtRate.toFixed(2)} · Min {MIN_DEPOSIT_USDT}{' '}
                        USDT
                      </p>
                    )}
                    <div className="text-xs text-amber-200/90 bg-amber-950/40 border border-amber-900/50 rounded-lg p-3">
                      Send only USDT via {network}. Wrong network = lost funds. Credited after
                      1 confirmation.
                    </div>
                  </>
                )}
              </div>
            )}

            <form onSubmit={submitDeposit} className="space-y-4">
              {mainTab === 'mobile_banking' && (
                <div>
                  <label className="text-xs text-gray-500 font-semibold tracking-wider">
                    YOUR {methodLabel(mobileMethod).toUpperCase()} NUMBER<Req />
                  </label>
                  <div className="flex mt-2 gap-2">
                    <span className="flex items-center px-3 bg-[#141a1f] border border-[#252b31] rounded-xl text-sm">
                      🇧🇩 +880
                    </span>
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="1712-345 678"
                      className="flex-1 bg-[#141a1f] border border-[#252b31] rounded-xl px-3 py-3 outline-none focus:border-[#19A044]"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 font-semibold tracking-wider">
                  {mainTab === 'crypto' ? 'TRANSACTION HASH' : 'TRANSACTION ID (TrxID)'}
                  <Req />
                </label>
                {mainTab === 'mobile_banking' && (
                  <span className="ml-2 text-[10px] text-[#19A044] bg-[#19A044]/15 px-2 py-0.5 rounded">
                    from SMS
                  </span>
                )}
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder={mainTab === 'crypto' ? 'Tx hash' : '9F4KX2M7QP'}
                  className="w-full mt-2 bg-[#141a1f] border border-[#252b31] rounded-xl px-3 py-3 outline-none focus:border-[#19A044] uppercase"
                  required
                />
              </div>

              {mainTab === 'mobile_banking' && (
                <div>
                  <label className="text-sm font-semibold">
                    Payment screenshot<Req />
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (paymentImagePreview) URL.revokeObjectURL(paymentImagePreview);
                      setPaymentImage(file);
                      setPaymentImagePreview(file ? URL.createObjectURL(file) : '');
                    }}
                    className="w-full mt-2 text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#19A044] file:text-white"
                  />
                  {paymentImagePreview && (
                    <div className="mt-2 flex flex-col items-center">
                      <p className="text-[10px] text-gray-500 mb-1">Tap preview for full image</p>
                      <ImagePreviewLink
                        href={paymentImagePreview}
                        thumbnail
                        alt="Payment screenshot preview"
                        thumbnailClassName="max-h-32 rounded-lg cursor-pointer hover:opacity-95 hover:ring-2 hover:ring-[#19A044] transition"
                      />
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 flex items-center gap-2">
                <span className="text-[#19A044]">✓</span>
                Balance credited after verification (usually &lt; 2 min).
              </p>

              <button
                type="submit"
                disabled={submitting || (requestType === 'deposit' && !accounts.length)}
                className="w-full py-4 rounded-xl bg-[#19A044] font-bold text-lg disabled:opacity-50"
              >
                {submitting
                  ? 'Submitting...'
                  : mainTab === 'crypto'
                    ? "I've Sent the Payment"
                    : 'Confirm Deposit'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="bg-[#141a1f] rounded-2xl p-4 text-center border border-[#252b31]">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Withdrawable</p>
              <p className="text-3xl font-bold text-[#19A044] mt-1">
                {sym}
                {withdrawable.toFixed(2)}
              </p>
            </div>

            {wagering.withdrawalLocked && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
                <p className="font-semibold text-amber-300">Withdrawal locked — wagering required</p>
                <p className="text-gray-400 mt-1">
                  Play {sym}{wagering.remainingWagering.toFixed(2)} more to unlock withdrawals.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Progress: {sym}{wagering.currentWageredAmount.toFixed(2)} / {sym}
                  {wagering.requiredWagering.toFixed(2)}
                </p>
              </div>
            )}

            <div className="inline-flex px-4 py-2 rounded-full bg-[#19A044]/15 text-[#19A044] text-sm font-semibold">
              Mobile Banking
            </div>

            <div>
              <p className="text-xs text-gray-500 font-semibold mb-3">CASH OUT TO</p>
              <div className="flex gap-4 justify-center">
                {MOBILE_BANKING_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMobileMethod(m.id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <ProviderIcon method={m.id} selected={mobileMethod === m.id} />
                    <span className="text-xs text-gray-400">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={submitWithdraw} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-semibold">
                  RECEIVING {methodLabel(mobileMethod).toUpperCase()} NUMBER<Req />
                </label>
                <div className="flex mt-2 gap-2">
                  <span className="flex items-center px-3 bg-[#141a1f] border border-[#252b31] rounded-xl text-sm">
                    🇧🇩 +880
                  </span>
                  <input
                    type="tel"
                    value={receivePhone}
                    onChange={(e) => setReceivePhone(e.target.value)}
                    placeholder="1712-345 678"
                    className="flex-1 bg-[#141a1f] border border-[#252b31] rounded-xl px-3 py-3 outline-none focus:border-[#19A044]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold">
                  AMOUNT<Req />
                </label>
                <input
                  type="number"
                  min={minAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full mt-2 bg-[#141a1f] border border-[#252b31] rounded-xl px-3 py-3 text-lg font-semibold outline-none"
                  required
                />
              </div>

              <div className="bg-[#141a1f] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span>
                    {sym}
                    {parsedAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cash out fee</span>
                  <span>{cashOutFee}%</span>
                </div>
                <div className="flex justify-between font-bold text-[#19A044] pt-2 border-t border-[#252b31]">
                  <span>You receive</span>
                  <span>
                    {sym}
                    {youReceive.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold">
                  ACCOUNT PASSWORD<Req />
                </label>
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  className="w-full mt-2 bg-[#141a1f] border border-[#252b31] rounded-xl px-3 py-3 outline-none"
                  required
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 accent-[#19A044]"
                />
                I agree to the platform terms for withdrawals.
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-[#19A044] font-bold text-lg disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Request Withdrawal'}
              </button>
            </form>
          </>
        )}

        <div className="border-t border-[#1e2428] pt-4">
          <h2 className="text-sm font-semibold mb-2">My Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[520px]">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="py-1">Date</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-600">
                      No requests yet
                    </td>
                  </tr>
                ) : (
                  requests.slice(0, 10).map((r) => (
                    <tr key={r._id} className="border-t border-[#1e2428]">
                      <td className="py-2">{formatAppDateTime(r.createdAt)}</td>
                      <td>{r.requestType}</td>
                      <td>{methodLabel(r.method)}</td>
                      <td>{Number(r.amount).toFixed(2)}</td>
                      <td className="capitalize">{r.status}</td>
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
