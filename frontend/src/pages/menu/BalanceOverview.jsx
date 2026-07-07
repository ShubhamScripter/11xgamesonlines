import React, { useEffect, useState } from "react";
import { MdArrowBackIos } from "react-icons/md";
import { useSelector } from "react-redux";
import MainBalanceCard from "../../components/menucomp/MainBalanceCard";
import api from "../../utils/axiosConfig";
import { currencySymbol, getStoredCurrency } from "../../utils/currency";

function BalanceOverview() {
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
    <div className="bg-[#141515] text-white space-y-3 px-4 md:w-[50%] mx-auto md:mt-12 w-full z-20 h-screen">
      <div className="bg-[#000] h-10 flex items-center">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className="text-white text-md font-semibold" />
        </div>
        <span className="text-[18px] font-bold">Balance Overview</span>
      </div>

      {wagering?.withdrawalLocked && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-300">Withdrawal locked — wagering required</p>
          <p className="text-xs text-gray-400 mt-1">
            Play {sym}{wagering.remainingWagering?.toFixed(2)} more to unlock withdrawals.
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
            {sym}{wagering.currentWageredAmount?.toFixed(2)} / {sym}
            {wagering.requiredWagering?.toFixed(2)}
          </p>
        </div>
      )}

      <div className="flex flex-col pb-5">
        <MainBalanceCard />
      </div>
    </div>
  );
}

export default BalanceOverview;
