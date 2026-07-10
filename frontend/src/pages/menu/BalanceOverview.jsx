import React, { useEffect, useState } from "react";
import { MdArrowBackIos } from "react-icons/md";
import { IoWalletOutline, IoCashOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MainBalanceCard from "../../components/menucomp/MainBalanceCard";
import api from "../../utils/axiosConfig";
import { currencySymbol, getStoredCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/LanguageContext";

function BalanceOverview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [wagering, setWagering] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/user/wagering-status");
        setWagering(res?.data?.data || null);
      } catch {
        setWagering(null);
      }
    })();
  }, []);

  const sym = currencySymbol(user?.currency || getStoredCurrency());

  return (
    <div className="bg-[#141515] text-white space-y-3 px-4 md:w-[50%] mx-auto md:mt-12 w-full min-w-0 pb-8">
      <div className="bg-[#000] h-10 flex items-center">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className="text-white text-md font-semibold" />
        </div>
        <span className="text-[18px] font-bold">{t('page.balanceOverview.title')}</span>
      </div>

      {wagering?.withdrawalLocked && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-300">{t('page.balanceOverview.locked')}</p>
          <p className="text-xs text-gray-400 mt-1">
            {t('page.balanceOverview.playMore', { amount: `${sym}${wagering.remainingWagering?.toFixed(2)}` })}
          </p>
          <div className="mt-2 h-2 bg-[#252b31] rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  wagering.requiredWagering > 0
                    ? (wagering.currentWageredAmount / wagering.requiredWagering) * 100
                    : 0
                )}%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {t('page.balanceOverview.wageredProgress', {
              current: `${sym}${wagering.currentWageredAmount?.toFixed(2)}`,
              required: `${sym}${wagering.requiredWagering?.toFixed(2)}`,
            })}
          </p>
        </div>
      )}

      <div className="flex flex-col pb-5 space-y-3">
        <MainBalanceCard />

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate("/user/manual-deposit?type=deposit")}
            className="bg-[#17934e] rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <IoWalletOutline className="text-xl" />
              </span>
              <span className="text-base font-bold">{t('nav.deposit')}</span>
            </div>
            <p className="text-xs text-white/80 leading-snug">
              {t('page.balanceOverview.depositHint')}
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/user/manual-deposit?type=withdraw")}
            disabled={wagering?.withdrawalLocked}
            className="bg-[#262c32] rounded-2xl p-4 text-left active:scale-[0.98] transition-transform disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <IoCashOutline className="text-xl" />
              </span>
              <span className="text-base font-bold">{t('nav.withdrawal')}</span>
            </div>
            <p className="text-xs text-gray-400 leading-snug">
              {wagering?.withdrawalLocked
                ? t('page.balanceOverview.withdrawLockedHint')
                : t('page.balanceOverview.withdrawHint')}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BalanceOverview;
