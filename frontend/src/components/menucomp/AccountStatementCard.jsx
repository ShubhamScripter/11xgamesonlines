import React from 'react'

function AccountStatementCard({ accountdata }) {
  return (
    <div className="mt-3">
      {accountdata.map((item, idx) => (
        <div
          key={idx}
          className="mb-3 rounded-xl border border-[#2e363d] bg-[#1d242b] text-white overflow-hidden"
        >
          <div className="bg-[#26313a] px-3 py-2 text-xs md:text-sm text-gray-200">
            {item.date}
          </div>

          <div className="grid grid-cols-2 gap-3 px-3 py-3 border-b border-[#2e363d]">
            <div className="flex flex-col">
              <span className="text-xs md:text-sm text-gray-400">
                {item.change < 0 ? 'Debits' : item.change > 0 ? 'Credits' : 'No change'}
              </span>
              <strong
                className={`text-sm md:text-base ${
                  item.change < 0 ? 'text-red-400' : item.change > 0 ? 'text-emerald-400' : 'text-gray-300'
                }`}
              >
                {Math.abs(item.change || 0).toFixed(2)}
              </strong>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs md:text-sm text-gray-400">Balance</span>
              <strong className="text-sm md:text-base text-white">
                {Number(item.balance || 0).toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="px-3 py-3">
            <p className="text-xs text-gray-400 mb-1">Remark</p>
            <p className="text-sm md:text-base font-medium break-words">{item.remark}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AccountStatementCard