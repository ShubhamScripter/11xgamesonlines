import React from 'react';
import { HiOutlineArrowDownLeft, HiOutlineArrowUpRight, HiOutlineGift } from 'react-icons/hi2';
import { useTranslation } from '../../i18n/LanguageContext';

const TYPE_META = {
  deposit: {
    icon: HiOutlineArrowDownLeft,
    badgeClass: 'bg-[#19A044]/15 text-[#19A044] border-[#19A044]/35',
    amountClass: 'text-emerald-400',
    labelKey: 'page.accountStatement.deposit',
  },
  withdraw: {
    icon: HiOutlineArrowUpRight,
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/35',
    amountClass: 'text-red-400',
    labelKey: 'page.accountStatement.withdrawal',
  },
  bonus: {
    icon: HiOutlineGift,
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
    amountClass: 'text-amber-300',
    labelKey: 'page.accountStatement.bonus',
  },
};

function AccountStatementCard({ accountdata }) {
  const { t } = useTranslation();

  return (
    <div className="mt-3 space-y-2.5">
      {accountdata.map((item, idx) => {
        const meta = TYPE_META[item.type] || TYPE_META.deposit;
        const Icon = meta.icon;
        const signed =
          item.change < 0
            ? `-${Math.abs(item.change || 0).toFixed(2)}`
            : item.change > 0
              ? `+${Number(item.change || 0).toFixed(2)}`
              : '0.00';

        return (
          <div
            key={idx}
            className="rounded-2xl border border-[#2a323a] bg-[#1a2026] overflow-hidden shadow-sm"
          >
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-[#2a323a] bg-[#212830]">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${meta.badgeClass}`}
              >
                <Icon className="text-sm" />
                {t(meta.labelKey)}
              </span>
              <span className="text-[11px] text-gray-400 whitespace-nowrap">{item.date}</span>
            </div>

            <div className="px-3.5 py-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] text-gray-500 mb-0.5">
                  {item.change < 0
                    ? t('wallet.debits')
                    : item.change > 0
                      ? t('wallet.credits')
                      : t('wallet.noChange')}
                </p>
                <p className={`text-lg font-bold leading-none ${meta.amountClass}`}>{signed}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-500 mb-0.5">{t('wallet.balance')}</p>
                <p className="text-base font-semibold text-white leading-none">
                  {Number(item.balance || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {item.remark ? (
              <div className="px-3.5 pb-3">
                <p className="text-[11px] text-gray-500 mb-1">{t('wallet.remark')}</p>
                <p className="text-xs text-gray-300 leading-relaxed break-words bg-[#141a1f] rounded-lg px-2.5 py-2 border border-[#2a323a]">
                  {item.remark}
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default AccountStatementCard;
