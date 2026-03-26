import React from 'react'

function SuspendedFancyResult() {
  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">
        Suspended Fancy Result
      </h2>

      {/* Filter Section */}
      <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-2 mt-4">
        <div className="flex items-center gap-4 mt-3 mb-4">
          {/* Sports filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-[700]">Select Sport:</span>
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
              <select className=" text-sm bg-white w-25 outline-0 ">
                <option value="Cricket">Cricket</option>
                <option value="Soccer">Soccer</option>
                <option value="Tennis">Tennis</option>
              </select>
            </div>
          </div>

          {/* Match filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-[700]">Select Match:</span>
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
              <select className=" text-sm bg-white w-25 outline-0">
                <option value="">Select Match</option>
                <option value="">Manchester Originals v Southern Brave</option>
                <option value="">Ireland W v Pakistan W</option>
                <option value="">Sussex Sharks W v Gloucestershire W</option>
                <option value="">Yorkshire W v Middlesex W</option>
                <option value="">
                  Derbyshire Falcons W v Northamptonshire W
                </option>
                <option value="">Glamorgan W v Leicestershire Foxes W</option>
                <option value="">West Indies v Pakistan</option>
                <option value="">Auckland SRL T20 v Canterbury SRL T20</option>
                <option value="">
                  Joburg Super Kings SRL T20 v Durban Super Giants SRL T20
                </option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-[#aaa] flex items-center gap-2 px-2 py-1 p-4 shadow-[inset_0_2px_0_0_#0000001a]">
            <input
              type="text"
              placeholder="Enter Match Name..."
              //   value={searchTerm}
              //   onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-0 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-[700]">Select Fancy Status:</span>
            <div className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff]">
              <select className=" text-sm bg-white w-25 outline-0 ">
                <option value="Cricket">Pending</option>
                <option value="Soccer">Completed</option>
              </select>
            </div>
          </div>

          <button className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] px-2 py-1 rounded-sm hover:bg-[#ffa00c] cursor-pointer">
            Search
          </button>
        </div>
      </div>

      <div className="mt-4">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">Fancy Name</th>
              <th className="px-2 py-2"> SelectionId </th>
              <th className="px-2 py-2"> Action </th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-y border-y-[#7e97a7]">
              <td colSpan={9} className="px-2 py-2 text-center">No records found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SuspendedFancyResult