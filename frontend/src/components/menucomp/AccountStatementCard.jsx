import React from 'react'
import { IoMdArrowDropright } from "react-icons/io";

function AccountStatementCard({ accountdata }) {
  return (
    <div className="mt-3">
      {accountdata.map((item, idx) => (
        <table key={idx} className="rounded overflow-hidden bg-white border w-full rounded-t-xl mb-4">
          <thead className="bg-[#d4e0e5] text-gray-800">
            <tr>
              <th colSpan={4} className="p-2">
                <div className="flex gap-1 items-center text-sm md:text-base ">
                  {item.date}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td width="50%" style={{ padding: '3px 5px' }}>
                <div className='flex flex-col '>
                  <span className='text-sm md:text-base'>
                    {item.change < 0 ? 'Debits' : item.change > 0 ? 'Credits' : 'Debits'}
                  </span>
                  <strong className={`text-sm md:text-base ${item.change < 0 ? 'text-red-600' : item.change > 0 ? 'text-green-600' : ''}`}>
                    {Math.abs(item.change || 0).toFixed(2)}
                  </strong>
                </div>
              </td>
              <td width="50%" style={{ padding: '3px 5px' }}>
                <div className='flex flex-col'>
                  <span className='text-sm md:text-base'>Balance </span>
                  <strong className='text-sm md:text-base'>
                    {item.balance.toFixed(2)}
                  </strong>
                </div>
              </td>
            </tr>
            <tr className="border-b">
              <td width="50%" colSpan={4}>
                <div className='flex flex-col p-2'>
                  <span className='text-sm'>Remark</span>
                  <div className='text-sm md:text-md font-semibold'>
                    {item.remark}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td width="50%" colSpan={4}>
                <div className='flex flex-col p-2 py-4'>
                  <IoMdArrowDropright className='text-gray-500 text-2xl' />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      ))}
    </div>
  )
}

export default AccountStatementCard