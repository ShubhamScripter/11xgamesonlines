import React from 'react'

function Parlay({betdata}) {
  return (
    <div>
        {betdata.length === 0 && (
            <div className="flex flex-col gap-4 pt-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold">Bet Details</h2>
                <p className="text-gray-700">No current bets available.</p>
              </div>
              {/* Add more bet cards as needed */}
            </div>
          )}
    </div>
  )
}

export default Parlay