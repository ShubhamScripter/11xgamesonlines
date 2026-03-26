import React, { useEffect, useState } from 'react';
import { MdArrowBackIos } from 'react-icons/md';
import HeaderLogin from '../../components/Header/HeaderLogin';
import api from '../../utils/axiosConfig';

function P2pTransferLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/user/p2p-transfer-log', {
          params: { page: 1, limit: 50 },
        });
        if (!cancelled) {
          setLogs(res.data?.data || []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e?.response?.data?.message || e?.message || 'Failed to load log'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <HeaderLogin />
      <div className="bg-[#000] h-10 flex items-center px-5 relative">
        <div onClick={() => window.history.back()}>
          <MdArrowBackIos className="text-white text-2xl font-semibold" />
        </div>
        <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">
          P2P Transfer Log
        </span>
      </div>
      <div className="bg-[#f1f7ff] min-h-[80vh] flex flex-col pb-5">
        <div className="px-2 mx-2 mt-4">
          {loading && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-gray-600">Loading…</p>
            </div>
          )}
          {!loading && error && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          {!loading && !error && logs.length === 0 && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Transfer Log</h2>
              <p className="text-gray-600">
                No P2P transfer logs yet.
              </p>
            </div>
          )}
          {!loading && !error && logs.length > 0 && (
            <div className="space-y-3">
              {logs.map((log) => {
                const isIncoming = Number(log.deposite) > 0;
                const move =
                  isIncoming
                    ? Number(log.deposite)
                    : Number(log.withdrawl);
                const when = log.createdAt
                  ? new Date(log.createdAt).toLocaleString()
                  : '';
                return (
                  <div
                    key={log._id}
                    className="bg-white rounded-lg border overflow-hidden shadow-sm"
                  >
                    <div className="bg-[#d4e0e5] px-3 py-2 text-sm text-gray-800">
                      {when}
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Type</span>
                        <div className="font-semibold">
                          {isIncoming ? 'Received' : 'Sent'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount</span>
                        <div className="font-semibold">
                          {isIncoming ? '+' : '-'}
                          {move.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Balance after</span>
                        <div className="font-semibold">
                          {Number(log.amount).toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Counterparty</span>
                        <div className="font-semibold">
                          {isIncoming ? `From: ${log.from}` : `To: ${log.to}`}
                        </div>
                      </div>
                      {log.remark && (
                        <div className="col-span-2 text-gray-600 text-xs">
                          {log.remark}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default P2pTransferLog;
