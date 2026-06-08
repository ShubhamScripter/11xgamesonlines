import React from "react";
import { useOutletContext } from "react-router-dom";

function MyAccountSummary() {
  const { profile, profileLoading } = useOutletContext();
  const balance = profile?.financialInfo?.avbalance ?? 0;
  const currency = (
    profile?.financialInfo?.currency ||
    profile?.basicInfo?.currency ||
    "BDT"
  ).toUpperCase();

  return (
    <>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Account Summary</h2>

      {profileLoading && !profile ? (
        <p className="text-gray-500 mt-4">Loading...</p>
      ) : (
        <div className="border-b border-b-[#7e97a7] bg-white">
          <div className="flex flex-col border-r border-r-[#ddd] w-fit p-2 mt-4">
            <span className="text-[15px] font-[700]">Total Balance</span>
            <strong className="text-[#2789ce] text-[30px] font-[700]">
              {Number(balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              <sub className="text-[#7e97a7] text-[15px] font-[400]">{currency}</sub>
            </strong>
          </div>
        </div>
      )}
    </>
  );
}

export default MyAccountSummary;
