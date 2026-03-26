import React from "react";

function MatchedAll() {
  const matchedPlayers = [
  { "id": 1, "uid": "sahadat654", "exposure": 300.00, "matchedAmount": 2850.00 },
  { "id": 2, "uid": "rohit726", "exposure": 100.00, "matchedAmount": 800.00 },
  { "id": 3, "uid": "mahedi413", "exposure": 100.00, "matchedAmount": 460.00 },
  { "id": 4, "uid": "hafizur20", "exposure": 98.00, "matchedAmount": 340.00 },
  { "id": 5, "uid": "kaium560", "exposure": 50.00, "matchedAmount": 280.00 },
  { "id": 6, "uid": "raja59", "exposure": 40.00, "matchedAmount": 272.00 },
  { "id": 7, "uid": "somir2361", "exposure": 302.00, "matchedAmount": 195.08 },
  { "id": 8, "uid": "nahiyan07", "exposure": 9.00, "matchedAmount": 75.60 },
  { "id": 9, "uid": "rone8020", "exposure": 0.00, "matchedAmount": 21.25 },
  { "id": 10, "uid": "mdalom@", "exposure": 126.00, "matchedAmount": 19.82 },
  { "id": 11, "uid": "sohel3", "exposure": 40.00, "matchedAmount": 18.40 },
  { "id": 12, "uid": "sajib302", "exposure": 35.00, "matchedAmount": 4.95 },
  { "id": 13, "uid": "ashik840", "exposure": 10.00, "matchedAmount": 3.80 },
  { "id": 14, "uid": "raju5761", "exposure": 2.00, "matchedAmount": 2.50 },
  { "id": 15, "uid": "nachima22", "exposure": 150.00, "matchedAmount": 0.00 },
  { "id": 16, "uid": "rubel152", "exposure": 52.50, "matchedAmount": 0.00 },
  { "id": 17, "uid": "arif303", "exposure": 250.00, "matchedAmount": 0.00 },
  { "id": 18, "uid": "kamal619", "exposure": 0.00, "matchedAmount": 0.00 }
]


  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className='text-[#243a48] text-[16px] font-[700] font-["Times_New_Roman"]'>
        Matched Amount Player
      </h2>
      <div className="mt-4">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">UID</th>
              <th className="px-2 py-2">Exposure</th>
              <th className="px-2 py-2">Matched Amount</th>
            </tr>
          </thead>
          <tbody>
            {matchedPlayers.map((player) => (
              <tr
                key={player.id}
                className="bg-white border-y border-y-[#7e97a7]"
              >
                <td className="px-2 py-2">
                  {player.userId ? (
                    <a href={`/currentBets/${player.userId}/undefined`}>
                      {player.id}{" "}
                      <span className="underline ml-2">{player.uid}</span>
                    </a>
                  ) : (
                    <span>
                      {player.id}{" "}
                      <span className="underline ml-2">{player.uid}</span>
                    </span>
                  )}
                </td>
                <td className="px-2 py-2">
                  <strong className="text-[#dc3545]">
                    ({player.exposure.toFixed(2)})
                  </strong>
                </td>
                <td className="px-2 py-2">
                  {player.matchedAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MatchedAll;
