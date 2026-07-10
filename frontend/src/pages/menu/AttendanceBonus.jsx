import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { MdArrowBackIos } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import api from '../../utils/axiosConfig';
import { getUser } from '../../features/auth/authSlice';
import { useTranslation } from '../../i18n/LanguageContext';

function AttendanceBonus() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [status, setStatus] = useState({
    enabled: false,
    amount: 0,
    canClaim: false,
    claimedToday: false,
    todayKey: '',
  });

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/user/attendance');
      const d = res?.data?.data || {};
      setStatus({
        enabled: Boolean(d.enabled),
        amount: Number(d.amount) || 0,
        canClaim: Boolean(d.canClaim),
        claimedToday: Boolean(d.claimedToday),
        todayKey: d.todayKey || '',
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || t('page.attendance.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await api.post('/user/attendance/claim');
      toast.success(res?.data?.message || t('page.attendance.bonusClaimed'));
      await dispatch(getUser());
      await loadStatus();
    } catch (err) {
      toast.error(err?.response?.data?.message || t('page.attendance.claimFailed'));
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white pb-24">
      <div className="sticky top-0 z-10 bg-[#141a1f] border-b border-[#252b31] px-4 py-3 flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="text-gray-300">
          <MdArrowBackIos />
        </button>
        <h1 className="text-lg font-bold">{t('page.attendance.title')}</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {loading ? (
          <p className="text-center text-gray-500 py-12">{t('common.loading')}</p>
        ) : !status.enabled || status.amount <= 0 ? (
          <div className="rounded-2xl border border-[#252b31] bg-[#141a1f] p-6 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-semibold text-gray-300">{t('page.attendance.off')}</p>
            <p className="text-sm text-gray-500 mt-2">
              {t('page.attendance.offDescription')}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-[#19A044]/30 bg-gradient-to-br from-[#19A044]/20 to-[#141a1f] p-6 text-center mb-4">
              <p className="text-sm text-[#19A044] font-semibold uppercase tracking-wide">
                {t('page.attendance.todaysReward')}
              </p>
              <p className="text-4xl font-black mt-2">৳{status.amount.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">
                {t('page.attendance.timezoneNote')}
              </p>
            </div>

            <div className="rounded-2xl border border-[#252b31] bg-[#141a1f] p-5">
              {status.canClaim ? (
                <>
                  <p className="text-sm text-gray-300 mb-4">
                    {t('page.attendance.claimDescription')}
                  </p>
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={claiming}
                    className="w-full py-4 rounded-xl bg-[#19A044] hover:bg-[#15803d] font-bold text-lg disabled:opacity-50"
                  >
                    {claiming ? t('page.attendance.claiming') : t('page.attendance.claimButton')}
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="font-semibold text-[#19A044]">{t('page.attendance.alreadyClaimed')}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {t('page.attendance.comeBackTomorrow')}
                  </p>
                </div>
              )}
            </div>

            {status.todayKey && (
              <p className="text-center text-[11px] text-gray-600 mt-4">
                {t('page.attendance.serverDate', { date: status.todayKey })}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AttendanceBonus;
