import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MdArrowBackIos } from 'react-icons/md';
import {
  HiOutlineArrowDownLeft,
  HiOutlineArrowUpRight,
  HiOutlineGift,
  HiOutlineQueueList,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import MainBalanceCard from '../../components/menucomp/MainBalanceCard';
import AccountStatementCard from '../../components/menucomp/AccountStatementCard';
import api from '../../utils/axiosConfig';
import { formatAppDateTime } from '../../utils/time';
import { useTranslation } from '../../i18n/LanguageContext';

const BONUS_FROM_TYPES = new Set([
  'first-deposit-bonus',
  'attendance-bonus',
  'coupon',
  'referral-bonus',
  'referral-commission',
  'gift-coupon',
]);

function isBonusTxn(item) {
  const from = String(item?.from || '').toLowerCase();
  if (BONUS_FROM_TYPES.has(from)) return true;
  const remark = String(item?.remark || '').toLowerCase();
  return remark.includes('bonus') || remark.includes('coupon') || remark.includes('referral');
}

function classifyTxn(item) {
  if (isBonusTxn(item)) return 'bonus';
  if (item?.from === 'deposit-reject') return 'deposit';
  if (Number(item?.withdrawl || 0) > 0) return 'withdraw';
  if (Number(item?.deposite || 0) > 0) return 'deposit';
  return 'other';
}

function AccountStatement() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [accountDataList, setAccountDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const itemsPerPage = 10;

  const counts = useMemo(() => {
    const c = { all: accountDataList.length, deposit: 0, withdraw: 0, bonus: 0 };
    for (const item of accountDataList) {
      if (c[item.type] != null) c[item.type] += 1;
    }
    return c;
  }, [accountDataList]);

  const filterTabs = useMemo(
    () => [
      {
        id: 'all',
        label: t('page.accountStatement.filterAll'),
        icon: HiOutlineQueueList,
        count: counts.all,
      },
      {
        id: 'deposit',
        label: t('page.accountStatement.deposit'),
        icon: HiOutlineArrowDownLeft,
        count: counts.deposit,
      },
      {
        id: 'withdraw',
        label: t('page.accountStatement.withdrawal'),
        icon: HiOutlineArrowUpRight,
        count: counts.withdraw,
      },
      {
        id: 'bonus',
        label: t('page.accountStatement.bonus'),
        icon: HiOutlineGift,
        count: counts.bonus,
      },
    ],
    [t, counts]
  );

  useEffect(() => {
    const fetchAccountTransactions = async () => {
      try {
        setLoading(true);

        let userId = user?._id || user?.id;
        if (!userId) {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            userId = userData._id || userData.id;
          }
        }

        if (!userId) {
          setLoading(false);
          return;
        }

        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(
          new Date().setDate(new Date().getDate() - 7)
        ).toISOString().split('T')[0];

        const response = await api.get(
          `/user/transactions-hisrtory?startDate=${startDate}&endDate=${endDate}&page=1&limit=200`
        );

        if (response.data.success && response.data.data) {
          const filteredTransactions = response.data.data.filter((item) => {
            const type = classifyTxn(item);
            return type === 'deposit' || type === 'withdraw' || type === 'bonus';
          });

          const mappedData = filteredTransactions.map((item) => {
            const depositeAmount = Number(item?.deposite || 0);
            const withdrawalAmount = Number(item?.withdrawl || 0);
            const type = classifyTxn(item);
            const isDepositReject = item?.from === 'deposit-reject';
            const change = isDepositReject
              ? 0
              : depositeAmount > 0
                ? depositeAmount
                : -withdrawalAmount;

            let txnType = t('page.accountStatement.deposit');
            if (type === 'bonus') txnType = t('page.accountStatement.bonus');
            else if (type === 'withdraw') txnType = t('page.accountStatement.withdrawal');
            else if (isDepositReject) txnType = t('page.accountStatement.depositRejected');

            return {
              date: formatAppDateTime(item.createdAt),
              deposit: Math.abs(change),
              balance: Number(item?.amount || 0),
              change,
              type,
              remark: `${txnType} | ${item?.from || '-'} → ${item?.to || '-'}${
                item?.remark ? ` | ${item.remark}` : ''
              }`,
            };
          });

          setAccountDataList(mappedData);
        } else {
          setAccountDataList([]);
        }
      } catch (error) {
        console.error('Error fetching account statement:', error);
        setAccountDataList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAccountTransactions();
  }, [user, t]);

  const filteredList = useMemo(() => {
    if (filter === 'all') return accountDataList;
    return accountDataList.filter((item) => item.type === filter);
  }, [accountDataList, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const paginatedData = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="bg-[#141515] text-white px-3 sm:px-4 md:w-[50%] mx-auto md:mt-10 w-full min-w-0 min-h-full pb-10">
      <div className="sticky top-0 z-10 -mx-3 sm:-mx-4 px-3 sm:px-4 bg-[#141515]/95 backdrop-blur-sm border-b border-[#22282e]">
        <div className="h-12 flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="p-1.5 -ml-1 rounded-lg text-gray-300 hover:bg-[#1e2428] hover:text-white transition-colors"
            aria-label={t('common.back')}
          >
            <MdArrowBackIos className="text-lg" />
          </button>
          <span className="text-[17px] font-bold tracking-tight">
            {t('page.accountStatement.title')}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4">
        <MainBalanceCard />

        <div className="rounded-2xl border border-[#2a323a] bg-[#1a2026] p-3">
          <p className="text-sm font-semibold text-gray-200 mb-3">
            {t('page.accountStatement.history')}
          </p>

          <div className="grid grid-cols-4 gap-1.5">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2.5 text-center transition-all ${
                    active
                      ? 'bg-[#19A044] text-white shadow-[0_4px_14px_rgba(25,160,68,0.35)]'
                      : 'bg-[#141a1f] text-gray-400 border border-[#2a323a] hover:border-[#3a454f] hover:text-gray-200'
                  }`}
                >
                  <Icon className="text-base" />
                  <span className="text-[10px] sm:text-[11px] font-bold leading-tight">
                    {tab.label}
                  </span>
                  <span
                    className={`text-[10px] font-semibold tabular-nums ${
                      active ? 'text-white/80' : 'text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {loading ? (
            <div className="rounded-2xl border border-[#2a323a] bg-[#1a2026] py-14 flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-[#19A044] border-t-transparent animate-spin" />
              <p className="text-sm text-gray-400">{t('common.loading')}</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2a323a] bg-[#1a2026]/60 py-14 px-6 flex flex-col items-center text-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#212830] text-gray-500">
                <HiOutlineDocumentText className="text-2xl" />
              </span>
              <p className="text-sm font-medium text-gray-300">
                {t('page.accountStatement.noData')}
              </p>
            </div>
          ) : (
            <>
              <AccountStatementCard accountdata={paginatedData} />
              {totalPages > 1 && (
                <div className="mt-4 mb-2 flex items-center justify-between gap-2 rounded-xl border border-[#2a323a] bg-[#1a2026] px-2 py-2">
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-[#212830] disabled:opacity-40 disabled:pointer-events-none"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage <= 1}
                  >
                    {t('common.prev')}
                  </button>
                  <span className="text-xs text-gray-400 tabular-nums">
                    {t('common.page', { current: currentPage, total: totalPages })}
                  </span>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-[#212830] disabled:opacity-40 disabled:pointer-events-none"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                  >
                    {t('common.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountStatement;
