import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AccountStatementTable from "./AccountStatementTable";
import { fetchAgentTransactions } from "../../store/transactionsSlice";
import { formatIST } from "../../utils/time";

function mapApiTxToRow(tx) {
  return {
    datetime: formatIST(tx.date || tx.createdAt),
    depositFromUpline: tx.deposite > 0 ? tx.deposite.toFixed(2) : "-",
    depositToDownline: "-",
    withdrawByUpline: "-",
    withdrawFromDownline: tx.withdrawl > 0 ? tx.withdrawl.toFixed(2) : "-",
    balance: tx.amount?.toFixed(2) ?? "-",
    remark: tx.remark || "",
    fromTo: `${tx.from} -> ${tx.to}`,
  };
}

function MyAccountStatement() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: transactions, loading, error } = useSelector(
    (state) => state.transactions
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAgentTransactions(user.id));
    }
  }, [dispatch, user?.id]);

  const tableData = transactions.map(mapApiTxToRow);

  return (
    <>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Account Statement</h2>

      {loading && tableData.length === 0 && (
        <p className="mt-4 text-center text-gray-700">Loading…</p>
      )}
      {error && (
        <p className="mt-4 text-center text-red-600">Failed to load: {error}</p>
      )}

      {!error && (tableData.length > 0 || !loading) && (
        <div className="mt-4">
          <AccountStatementTable transactions={tableData} />
        </div>
      )}
    </>
  );
}

export default MyAccountStatement;
