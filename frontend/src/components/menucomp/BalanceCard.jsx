import React from 'react'

function BalanceCard({balancedata}) {
  return (
    <div>
      <div className="mt-3">
        {balancedata.map((balanceData, idx) => (
          <table key={idx} className="rounded overflow-hidden bg-white border w-full rounded-t-xl mb-4">
            <thead className="bg-[#d4e0e5] text-gray-800">
              <tr>
                <th colSpan={4} className="p-2">
                  <div className="flex gap-1 items-center text-xs md:text-base">
                    {balanceData.date}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td width="50%" style={{ padding: '3px 5px' }}>
                  <div className='flex flex-col '>
                    <span className='text-sm md:text-base'>Deposit </span>
                    <strong className='text-sm md:text-base'>{balanceData.deposit.toFixed(2)}</strong>
                  </div>
                </td>
                <td width="50%" style={{ padding: '3px 5px' }}>
                  <div className='flex flex-col'>
                    <span className='text-sm md:text-base'>Balance </span>
                    <strong className='text-sm md:text-base'>{balanceData.balance.toFixed(2)}</strong>
                  </div>
                </td>
              </tr>
              <tr>
                <td width="50%" colSpan={4}>
                  <div className='md:text-lg p-2 '>
                     {balanceData.agent}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        ))}
      </div>
    </div>
  )
}

export default BalanceCard;