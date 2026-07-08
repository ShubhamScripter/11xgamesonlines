import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../utils/axiosInstance';

const SECTION_TITLES = {
  'first-deposit': 'First Deposit Bonus',
  attendance: 'Daily Attendance Bonus',
  referral: 'User Referral Commission',
};

function BonusSettings() {
  const { section } = useParams();
  const activeSection = section || 'first-deposit';
  const user = useSelector((state) => state.auth.user);
  const allowedRoles = ['superadmin', 'admin', 'subadmin', 'seniorSuper'];
  const canManageSettings = allowedRoles.includes(user?.role);

  const [bonusEnabled, setBonusEnabled] = useState(false);
  const [bonusPercent, setBonusPercent] = useState('');
  const [savedBonusEnabled, setSavedBonusEnabled] = useState(false);
  const [savedBonusPercent, setSavedBonusPercent] = useState(0);
  const [savingBonus, setSavingBonus] = useState(false);
  const [wageringPercent, setWageringPercent] = useState('80');
  const [savedWageringPercent, setSavedWageringPercent] = useState(80);

  const [attendanceEnabled, setAttendanceEnabled] = useState(false);
  const [attendanceAmount, setAttendanceAmount] = useState('');
  const [savedAttendanceEnabled, setSavedAttendanceEnabled] = useState(false);
  const [savedAttendanceAmount, setSavedAttendanceAmount] = useState(0);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [referralEnabled, setReferralEnabled] = useState(false);
  const [referralPercent, setReferralPercent] = useState('');
  const [savedReferralEnabled, setSavedReferralEnabled] = useState(false);
  const [savedReferralPercent, setSavedReferralPercent] = useState(0);
  const [savingReferral, setSavingReferral] = useState(false);

  useEffect(() => {
    if (!canManageSettings) return;
    (async () => {
      try {
        const { data } = await axios.get('/admin/app-settings');
        setBonusEnabled(Boolean(data?.data?.firstDepositBonusEnabled));
        setSavedBonusEnabled(Boolean(data?.data?.firstDepositBonusEnabled));
        const pct = Number(data?.data?.firstDepositBonusPercent) || 0;
        setSavedBonusPercent(pct);
        setBonusPercent(pct ? String(pct) : '');
        const wagerPct = Number(data?.data?.firstDepositWageringPercent) || 80;
        setSavedWageringPercent(wagerPct);
        setWageringPercent(String(wagerPct));
        setAttendanceEnabled(Boolean(data?.data?.attendanceBonusEnabled));
        setSavedAttendanceEnabled(Boolean(data?.data?.attendanceBonusEnabled));
        const attAmt = Number(data?.data?.attendanceBonusAmount) || 0;
        setSavedAttendanceAmount(attAmt);
        setAttendanceAmount(attAmt ? String(attAmt) : '');
        setReferralEnabled(Boolean(data?.data?.userReferralModuleEnabled));
        setSavedReferralEnabled(Boolean(data?.data?.userReferralModuleEnabled));
        const refPct = Number(data?.data?.userReferralCommissionPercent) || 0;
        setSavedReferralPercent(refPct);
        setReferralPercent(refPct ? String(refPct) : '');
      } catch (err) {
        console.error('Error fetching bonus settings:', err);
      }
    })();
  }, [canManageSettings]);

  const saveFirstDepositBonus = async () => {
    const pct = Number(bonusPercent);
    if (bonusEnabled && (!Number.isFinite(pct) || pct <= 0 || pct > 100)) {
      alert('Enter a valid bonus percentage between 1 and 100.');
      return;
    }
    const wager = Number(wageringPercent);
    if (!Number.isFinite(wager) || wager < 0 || wager > 100) {
      alert('Enter a valid wagering percentage between 0 and 100.');
      return;
    }
    setSavingBonus(true);
    try {
      const { data } = await axios.put('/admin/app-settings', {
        firstDepositBonusEnabled: bonusEnabled,
        firstDepositBonusPercent: bonusEnabled ? pct : 0,
        firstDepositWageringPercent: wager,
      });
      setSavedBonusEnabled(Boolean(data?.data?.firstDepositBonusEnabled));
      const savedPct = Number(data?.data?.firstDepositBonusPercent) || 0;
      setSavedBonusPercent(savedPct);
      setBonusPercent(savedPct ? String(savedPct) : '');
      const savedWager = Number(data?.data?.firstDepositWageringPercent) || 80;
      setSavedWageringPercent(savedWager);
      setWageringPercent(String(savedWager));
      alert('First deposit bonus settings saved.');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save bonus settings');
    } finally {
      setSavingBonus(false);
    }
  };

  const saveAttendanceBonus = async () => {
    const amt = Number(attendanceAmount);
    if (attendanceEnabled && (!Number.isFinite(amt) || amt <= 0)) {
      alert('Enter a valid daily bonus amount greater than 0.');
      return;
    }
    setSavingAttendance(true);
    try {
      const { data } = await axios.put('/admin/app-settings', {
        attendanceBonusEnabled: attendanceEnabled,
        attendanceBonusAmount: attendanceEnabled ? amt : 0,
      });
      setSavedAttendanceEnabled(Boolean(data?.data?.attendanceBonusEnabled));
      const savedAmt = Number(data?.data?.attendanceBonusAmount) || 0;
      setSavedAttendanceAmount(savedAmt);
      setAttendanceAmount(savedAmt ? String(savedAmt) : '');
      alert('Attendance bonus settings saved.');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save attendance bonus');
    } finally {
      setSavingAttendance(false);
    }
  };

  const saveUserReferral = async () => {
    const pct = Number(referralPercent);
    if (referralEnabled && (!Number.isFinite(pct) || pct <= 0 || pct > 100)) {
      alert('Enter a valid referral commission between 1 and 100%.');
      return;
    }
    setSavingReferral(true);
    try {
      const { data } = await axios.put('/admin/app-settings', {
        userReferralModuleEnabled: referralEnabled,
        userReferralCommissionPercent: referralEnabled ? pct : 0,
      });
      setSavedReferralEnabled(Boolean(data?.data?.userReferralModuleEnabled));
      const savedPct = Number(data?.data?.userReferralCommissionPercent) || 0;
      setSavedReferralPercent(savedPct);
      setReferralPercent(savedPct ? String(savedPct) : '');
      alert('User referral settings saved.');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save referral settings');
    } finally {
      setSavingReferral(false);
    }
  };

  if (!canManageSettings) {
    return (
      <div className='mt-4 p-4 font-["Times_New_Roman"]'>
        <p className='text-red-600'>You do not have permission to manage bonus settings.</p>
      </div>
    );
  }

  const pageTitle = SECTION_TITLES[activeSection] || 'Bonus Settings';

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">{pageTitle}</h2>

      {activeSection === 'first-deposit' && (
        <div className='bg-[#e0e6e6] border-b border-b-[#7e97a7] p-4 mt-4'>
          <p className='text-sm text-gray-600 mt-1'>
            New users get an extra percentage on their first approved deposit. You can turn this off anytime.
          </p>
          <div className='mt-3 flex flex-wrap items-center gap-4'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={bonusEnabled}
                onChange={(e) => setBonusEnabled(e.target.checked)}
                className='w-4 h-4'
              />
              <span className='text-sm font-semibold text-[#243a48]'>
                Enable first deposit bonus
              </span>
            </label>
            <div className='flex items-end gap-2'>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-600'>Bonus percentage</label>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    min='1'
                    max='100'
                    step='1'
                    disabled={!bonusEnabled}
                    value={bonusPercent}
                    onChange={(e) => setBonusPercent(e.target.value)}
                    placeholder='e.g. 10'
                    className='border border-[#aaa] px-3 py-2 rounded w-[120px] text-sm bg-white disabled:opacity-50'
                  />
                  <span className='text-sm font-semibold'>%</span>
                </div>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-600'>Wagering requirement</label>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    min='0'
                    max='100'
                    step='1'
                    disabled={!bonusEnabled}
                    value={wageringPercent}
                    onChange={(e) => setWageringPercent(e.target.value)}
                    placeholder='80'
                    className='border border-[#aaa] px-3 py-2 rounded w-[120px] text-sm bg-white disabled:opacity-50'
                  />
                  <span className='text-sm font-semibold'>% of deposit+bonus</span>
                </div>
              </div>
              <button
                type='button'
                disabled={savingBonus}
                onClick={saveFirstDepositBonus}
                className='bg-[#243a48] text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50'
              >
                {savingBonus ? 'Saving...' : 'Save bonus'}
              </button>
            </div>
          </div>
          <p className='text-xs text-gray-500 mt-2'>
            Status:{' '}
            {savedBonusEnabled && savedBonusPercent > 0
              ? `Active — ${savedBonusPercent}% extra on first deposit`
              : 'Disabled'}
          </p>
          <p className='text-xs text-gray-500 mt-1'>
            Example: user deposits ৳1,000 → receives ৳
            {savedBonusEnabled && savedBonusPercent > 0
              ? (1000 + (1000 * savedBonusPercent) / 100).toLocaleString()
              : '1,000'}{' '}
            total (deposit + bonus). Withdraw locked until user wagers{' '}
            {savedWageringPercent}% of that total.
          </p>
        </div>
      )}

      {activeSection === 'attendance' && (
        <div className='bg-[#e0e6e6] border-b border-b-[#7e97a7] p-4 mt-4'>
          <p className='text-sm text-gray-600 mt-1'>
            Users can check in once per day and receive a fixed bonus in their wallet.
          </p>
          <div className='mt-3 flex flex-wrap items-center gap-4'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={attendanceEnabled}
                onChange={(e) => setAttendanceEnabled(e.target.checked)}
                className='w-4 h-4'
              />
              <span className='text-sm font-semibold text-[#243a48]'>
                Enable daily attendance bonus
              </span>
            </label>
            <div className='flex items-end gap-2'>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-600'>Bonus per day (BDT)</label>
                <input
                  type='number'
                  min='1'
                  step='1'
                  disabled={!attendanceEnabled}
                  value={attendanceAmount}
                  onChange={(e) => setAttendanceAmount(e.target.value)}
                  placeholder='e.g. 10'
                  className='border border-[#aaa] px-3 py-2 rounded w-[140px] text-sm bg-white disabled:opacity-50'
                />
              </div>
              <button
                type='button'
                disabled={savingAttendance}
                onClick={saveAttendanceBonus}
                className='bg-[#243a48] text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50'
              >
                {savingAttendance ? 'Saving...' : 'Save attendance'}
              </button>
            </div>
          </div>
          <p className='text-xs text-gray-500 mt-2'>
            Status:{' '}
            {savedAttendanceEnabled && savedAttendanceAmount > 0
              ? `Active — ৳${savedAttendanceAmount} per day per user`
              : 'Disabled'}
          </p>
          <p className='text-xs text-gray-500 mt-1'>
            Day resets at midnight Bangladesh time (Asia/Dhaka). Bonus is deducted from the
            user&apos;s upline admin balance.
          </p>
        </div>
      )}

      {activeSection === 'referral' && (
        <div className='bg-[#e0e6e6] border-b border-b-[#7e97a7] p-4 mt-4'>
          <p className='text-sm text-gray-600 mt-1'>
            When enabled, users earn a % of their referred friends&apos; losses on bet settlement.
            All users share the same commission rate you set here.
          </p>
          <div className='mt-3 flex flex-wrap items-center gap-4'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={referralEnabled}
                onChange={(e) => setReferralEnabled(e.target.checked)}
                className='w-4 h-4'
              />
              <span className='text-sm font-semibold text-[#243a48]'>
                Enable user referral module
              </span>
            </label>
            <div className='flex items-end gap-2'>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-600'>
                  Commission on referred user loss
                </label>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    min='0.1'
                    max='100'
                    step='0.1'
                    disabled={!referralEnabled}
                    value={referralPercent}
                    onChange={(e) => setReferralPercent(e.target.value)}
                    placeholder='e.g. 5'
                    className='border border-[#aaa] px-3 py-2 rounded w-[120px] text-sm bg-white disabled:opacity-50'
                  />
                  <span className='text-sm font-semibold'>%</span>
                </div>
              </div>
              <button
                type='button'
                disabled={savingReferral}
                onClick={saveUserReferral}
                className='bg-[#243a48] text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50'
              >
                {savingReferral ? 'Saving...' : 'Save referral'}
              </button>
            </div>
          </div>
          <p className='text-xs text-gray-500 mt-2'>
            Status:{' '}
            {savedReferralEnabled
              ? `Active — ${savedReferralPercent}% of referred user losses credited to referrer`
              : 'Disabled'}
          </p>
          <p className='text-xs text-gray-500 mt-1'>
            Example: friend loses ৳1,000 and rate is 5% → referrer receives ৳50 in wallet.
          </p>
        </div>
      )}
    </div>
  );
}

export default BonusSettings;
