import React from 'react';

function BalanceCard({balanceData}) {
  return (
    <div>
      <div className="bg-[#fff] border-b border-b-[#7e97a7] flex items-center justify-around mt-2">
        {balanceData.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col p-2 ${index !== balanceData.length - 1 ? 'border-r border-r-[#d1cdcd]' : ''} gap-1`}
          >
            <span className="text-xs text-[#9b9b9b]">{item.label}</span>
            <strong className={`text-[15px] font-semibold`}>
              {item.highlight ? (
                <>
                  BDT <span className="text-red-500">{item.value.replace('BDT ', '')}</span>
                </>
              ) : (
                item.value
              )}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BalanceCard;
