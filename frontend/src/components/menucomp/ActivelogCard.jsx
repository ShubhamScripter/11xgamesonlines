import React from 'react';

function formatHeaderDate(log) {
  if (log.createdAt) {
    try {
      return new Date(log.createdAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      /* fall through */
    }
  }
  return log.dateTime || '—';
}

function locationLine(log) {
  if (log.location && String(log.location).trim()) {
    return log.location;
  }
  const parts = [log.city, log.region, log.country].filter(
    (p) => p != null && String(p).trim() !== ''
  );
  return parts.length ? parts.join(', ') : '';
}

function statusClass(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('success')) return 'text-green-600 font-bold';
  if (s.includes('fail')) return 'text-red-600 font-bold';
  return 'text-gray-800 font-semibold';
}

function ActivelogCard({ logdata }) {
  return (
    <div className="flex flex-col gap-3 px-2 pb-6 max-w-lg mx-auto w-full">
      {logdata.map((log, idx) => {
        const loc = locationLine(log);
        const isp = log.isp != null && String(log.isp).trim() !== '' ? log.isp : '—';

        return (
          <div
            key={log._id || idx}
            className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm"
          >
            <div className="bg-[#d5f2b8] px-3 py-2.5">
              <span className="font-bold text-gray-900 text-sm md:text-base">
                {formatHeaderDate(log)}
              </span>
            </div>
            <div className="divide-y divide-gray-100 text-sm md:text-base">
              <div className="grid grid-cols-2 gap-2 px-3 py-3">
                <span className="text-gray-600">Login Status</span>
                <span className={`text-right ${statusClass(log.status)}`}>
                  {log.status || '—'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 px-3 py-3">
                <span className="text-gray-600">IP Address</span>
                <span className="text-right font-medium text-gray-900 break-all">
                  {log.ip || '—'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 px-3 py-3">
                <span className="text-gray-600">ISP</span>
                <span className="text-right font-medium text-gray-900 break-all">
                  {isp}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 px-3 py-3">
                <span className="text-gray-600">City/State/Country</span>
                <span className="text-right font-medium text-gray-900">
                  {loc || '—'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ActivelogCard;
