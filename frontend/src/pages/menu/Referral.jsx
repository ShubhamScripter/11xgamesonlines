import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIos } from 'react-icons/md';
import { FiCopy, FiUsers, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../utils/axiosConfig';
import { currencySymbol } from '../../utils/currency';
import { formatIST } from '../../utils/time';
import { useTranslation } from '../../i18n/LanguageContext';

function Referral() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [editCode, setEditCode] = useState('');
  const [savingCode, setSavingCode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/user/referral');
        if (!cancelled) {
          const payload = res?.data?.data || null;
          setData(payload);
          setEditCode(payload?.myCode || '');
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err?.response?.data?.message || t('page.referral.fetchFailed'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const copyLink = async () => {
    const link = data?.referralLink || '';
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t('page.referral.linkCopied'));
    } catch {
      toast.error(t('common.copyFailed'));
    }
  };

  const saveCode = async () => {
    const next = String(editCode || '')
      .trim()
      .toUpperCase();
    if (!/^[A-Z0-9]{4,12}$/.test(next)) {
      toast.error(t('page.referral.codeInvalid'));
      return;
    }
    if (next === String(data?.myCode || '').toUpperCase()) {
      toast.success(t('page.referral.codeUnchanged'));
      return;
    }

    setSavingCode(true);
    try {
      const res = await api.put('/user/referral/code', { code: next });
      const updated = res?.data?.data || {};
      setData((prev) =>
        prev
          ? {
              ...prev,
              myCode: updated.myCode || next,
              referralLink: updated.referralLink || prev.referralLink,
            }
          : prev
      );
      setEditCode(updated.myCode || next);
      toast.success(res?.data?.message || t('page.referral.codeUpdated'));
    } catch (err) {
      toast.error(err?.response?.data?.message || t('page.referral.codeUpdateFailed'));
    } finally {
      setSavingCode(false);
    }
  };

  const sym = currencySymbol(data?.currency);
  const codeDirty =
    String(editCode || '').trim().toUpperCase() !==
    String(data?.myCode || '').toUpperCase();

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white pb-24">
      <div className="sticky top-0 z-10 bg-[#141a1f] border-b border-[#252b31] px-4 py-3 flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="text-gray-300">
          <MdArrowBackIos />
        </button>
        <h1 className="text-lg font-bold">{t('page.referral.title')}</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 py-10">{t('common.loading')}</p>
        ) : !data ? (
          <p className="text-center text-gray-400 py-10">{t('page.referral.loadFailed')}</p>
        ) : (
          <>
            {!data.enabled ? (
              <div className="rounded-2xl border border-amber-700/40 bg-amber-900/20 p-4 text-sm text-amber-100">
                {t('page.referral.offNotice')}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#19A044]/40 bg-[#19A044]/10 p-4 text-sm text-green-100">
                {t('page.referral.earnNotice', { percent: data.commissionPercent })}
              </div>
            )}

            <div className="rounded-2xl border border-[#252b31] bg-[#141a1f] p-4 space-y-3">
              <p className="text-sm text-gray-400">{t('page.referral.yourCode')}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) =>
                    setEditCode(
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '')
                        .slice(0, 12)
                    )
                  }
                  maxLength={12}
                  spellCheck={false}
                  className="flex-1 min-w-0 bg-[#0b0e11] border border-[#2a323a] rounded-xl px-3 py-3 text-xl font-mono font-bold tracking-widest text-[#19A044] outline-none focus:border-[#19A044]"
                  aria-label={t('page.referral.yourCode')}
                />
                <button
                  type="button"
                  onClick={saveCode}
                  disabled={savingCode || !codeDirty}
                  className="shrink-0 px-4 rounded-xl bg-[#1e2428] border border-[#19A044]/50 text-[#19A044] font-bold disabled:opacity-40 flex items-center gap-1.5"
                >
                  <FiSave />
                  {savingCode ? t('common.loading') : t('page.referral.saveCode')}
                </button>
              </div>
              <p className="text-[11px] text-gray-500">{t('page.referral.codeHint')}</p>
              <p className="text-xs text-gray-500 break-all">{data.referralLink}</p>
              <button
                type="button"
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 bg-[#19A044] text-white font-bold py-3 rounded-xl"
              >
                <FiCopy /> {t('page.referral.copyLink')}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#252b31] bg-[#141a1f] p-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <FiUsers /> {t('page.referral.referred')}
                </div>
                <p className="text-2xl font-bold">{data.totalReferred || 0}</p>
              </div>
              <div className="rounded-2xl border border-[#252b31] bg-[#141a1f] p-4">
                <p className="text-gray-400 text-xs mb-1">{t('page.referral.commissionEarned')}</p>
                <p className="text-2xl font-bold text-[#19A044]">
                  {sym} {Number(data.totalCommissionEarned || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#252b31] bg-[#141a1f] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#252b31] font-semibold">
                {t('page.referral.peopleReferred')}
              </div>
              {(data.referredUsers || []).length === 0 ? (
                <p className="p-4 text-sm text-gray-500">
                  {t('page.referral.noReferrals')}
                </p>
              ) : (
                <ul className="divide-y divide-[#252b31]">
                  {data.referredUsers.map((u) => (
                    <li key={u._id} className="px-4 py-3 flex justify-between gap-3">
                      <div>
                        <p className="font-semibold">{u.userName}</p>
                        <p className="text-xs text-gray-500">
                          {t('page.referral.joined', {
                            date: u.joinedAt ? formatIST(u.joinedAt) : '—',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#19A044] font-semibold">
                          {sym} {Number(u.commissionEarned || 0).toFixed(2)}
                        </p>
                        <p className="text-[11px] text-gray-500">{t('page.referral.fromYou')}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {(data.recentCommissions || []).length > 0 ? (
              <div className="rounded-2xl border border-[#252b31] bg-[#141a1f] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#252b31] font-semibold">
                  {t('page.referral.recentCommission')}
                </div>
                <ul className="divide-y divide-[#252b31]">
                  {data.recentCommissions.map((c) => (
                    <li key={c._id} className="px-4 py-3 flex justify-between gap-3 text-sm">
                      <div>
                        <p>
                          {t('page.referral.userLost', {
                            userName: c.userName,
                            amount: `${sym} ${Number(c.userLossAmount).toFixed(2)}`,
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {c.createdAt ? formatIST(c.createdAt) : '—'} · {c.commissionPercent}%
                        </p>
                      </div>
                      <p className="font-semibold text-[#19A044]">
                        +{sym} {Number(c.commissionAmount).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default Referral;
