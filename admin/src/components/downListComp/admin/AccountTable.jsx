// AccountTable.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaExchangeAlt, FaUser, FaCog, FaLock, FaList, FaPercent } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import CreditRef from "./CreditRef";
import ChangeStatus from "./ChangeStatus";
import BlockMarket from "./BlockMarket";
import SetAgentCommission from "./SetAgentCommission";

function AccountTable({ users, refreshDownlines, currentUser }) {
  console.log("users", users)
  console.log("currentUser", currentUser)
  const authUser = useSelector(state => state.auth?.user);
  const title = {
    superadmin: "SUD",
    admin: "AD",
    subadmin: "SAD",
    seniorSuper: "SSM",
    superAgent: "SA",
    agent: "AG",
    user: "CL",
  };

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // Reset to page 1 when users list changes (e.g., after filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [users]);

  const totalPages = Math.max(1, Math.ceil(users.length / rowsPerPage));

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return users.slice(start, start + rowsPerPage);
  }, [users, currentPage, rowsPerPage]);

  const pageButtons = useMemo(() => getPageNumbers(currentPage, totalPages, 9), [currentPage, totalPages]);

  const [isStatusChangeOpen, setStatusChangeOpen] = useState(false);
  const openModal = () => setStatusChangeOpen(true);
  const closeModal = () => setStatusChangeOpen(false);

  const [isBlockMarketOpen, setisBlockMarketOpen] = useState(false);
  const openMarket = () => setisBlockMarketOpen(true);
  const closeMarket = () => setisBlockMarketOpen(false);

  const [isCreditRefOpen, setisCreditRefOpen] = useState(false);
  const openCreditRef = () => setisCreditRefOpen(true);
  const closeCreditRef = () => setisCreditRefOpen(false);

  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const openCommissionModal = () => setIsCommissionModalOpen(true);
  const closeCommissionModal = () => setIsCommissionModalOpen(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const effectiveUser =  authUser || {};
  console.log("effectiveUser", effectiveUser)
  const roleString = (
    effectiveUser.role ||
    effectiveUser.account ||
    effectiveUser.accountType ||
    ""
  )
    .toString()
    .toLowerCase();

  const isSuperAdmin = roleString === "superadmin";
  console.log("isSuperAdmin", isSuperAdmin)

  function getPageNumbers(current, total, maxButtons = 7) {
    const pages = [];
    if (total <= maxButtons) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    const left = 2;
    const right = total - 1;
    const side = Math.floor((maxButtons - 3) / 2);

    let start = Math.max(left, current - side);
    let end = Math.min(right, current + side);

    if (current - 1 <= side) {
      start = left;
      end = maxButtons - 2;
    }

    if (total - current <= side) {
      start = total - (maxButtons - 3);
      end = right;
    }

    pages.push(1);
    if (start > left) pages.push("left-ellipsis");

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < right) pages.push("right-ellipsis");
    pages.push(total);

    return pages;
  }

  return (
    <div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">Sr .No.</th>
              <th className="px-2 py-2">Account</th>
              <th className="px-2 py-2">Credit Ref.</th>
              <th className="px-2 py-2">Balance</th>
              <th className="px-2 py-2">Player Exposure</th>
              <th className="px-2 py-2">Avail. bal.</th>
              <th className="px-2 py-2">Player Balance</th>
              <th className="px-2 py-2">Reference P/L</th>
              {currentUser?.role === "superAgent" &&<th className="px-2 py-2">Commission Limit</th>}
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody className="border-y border-[#7e97a7]">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="11"
                  className="text-center py-2 text-[#3b5160] bg-[#0000000d]"
                >
                  No users available.
                </td>
              </tr>
            ) : (
              currentUsers.map((user, idx) => (
                <tr
                  key={user._id || user.id || idx}
                  className={
                    idx % 2 === 0
                      ? "bg-[#f1eee9] border-y border-[#7e97a7]"
                      : "bg-white border-y border-[#7e97a7]"
                  }
                >
                  <td className="px-2 py-2">
                    {idx + 1 + (currentPage - 1) * rowsPerPage}
                  </td>
                  <td className="px-2 py-2">
                    <span className="bg-[#6c8ebf] text-white text-[10px] font-semibold px-2 py-1 rounded mr-1">
                      {title[user.role]}
                    </span>
                    <span
                      className="text-[#2066c6] text-xs underline cursor-pointer"
                      onClick={() => {
                        console.log("my user role is:", user.role);
                        console.log("my user id is:", user._id);
                        if (user.role && user._id) {
                          if (user.role != "user") {
                           
                            navigate(`/${user.role}/${user._id}`);
                          }
                        } else {
                          console.warn("Missing role or ID in user", user);
                        }
                      }}
                    >
                      {user.username || user.account || "N/A"}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="inline-flex items-center gap-1 text-[#2066c6]">
                      <span className="underline">{(user.creditRef ?? 0).toFixed(2)}</span>
                      <FaPencil className="text-[#2066c6] cursor-pointer" onClick={() => {
                        setSelectedUser({ 
                          id: user._id, 
                          role: user.role, 
                          username: user.username || user.account,
                          creditReference: user.creditRef || user.creditReference || 0
                        });
                        openCreditRef();
                      }} />
                    </div>
                  </td>
                  <td className="px-2 py-2 text-[#2066c6]">
                    {(user.balance ?? 0).toLocaleString()}
                  </td>
                  <td className="px-2 py-2">
                    <span className="px-2 py-1 rounded text-red-600 bg-red-100 border border-[#deb6c0] inline-block">
                      {(user.totalExposure ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    {(user.avbalance ?? 0).toLocaleString()}
                  </td>
                  <td className="px-2 py-2">
                    {(user.playerbalancee ?? 0).toLocaleString()}
                  </td>
                  <td className="px-2 py-2">{user.refPL ?? 0}</td>
                  {currentUser.role === "superAgent"&&
                  <td className="px-2 py-2">
                  {user.role === "agent" ? (
                    <div className="flex items-center gap-2 text-[#2066c6]">
                      <span className="font-semibold">
                        {(user.commissionPercentage || 0).toFixed(2)}%
                      </span>
                      {isSuperAdmin && (
                        <button
                          type="button"
                          className="text-xs underline font-semibold"
                          onClick={() => {
                            setSelectedAgent({
                              id: user._id,
                              username: user.username || user.account,
                              commissionPercentage: user.commissionPercentage || 0,
                            });
                            openCommissionModal();
                          }}
                        >
                         Commission Edit
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                  }
                  <td className="px-2 py-2">
                    <div className={`${user.status === "active" ? "bg-[#e5f1dc] text-[#508d0e] border border-[#bedca7]" : "bg-[#ebb7b7] text-[#db2828] border border-[#c68585]"}  px-2 py-1  rounded-lg text-[12px] font-semibold flex gap-1 items-center`}>
                      <span className={`${user.status === "active" ? "text-[#4cbb17]" : "text-[#921313]"}`}>●</span>
                      <span>{user.status ?? "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 flex gap-2">
                    <button
                      title="Betting Profit Loss"
                      className="bg-gray-200 p-1 border border-[#bbb] rounded"
                      onClick={() => {
                        if (user.role && user._id) {
                          navigate(
                            `/betting-profit-loss/${user.role}/${user._id}`
                          );
                        } else {
                          console.warn("Missing role or ID in user", user);
                        }
                      }}
                    >
                      <FaExchangeAlt />
                    </button>
                    <button
                      title="Betting History"
                      className="bg-gray-200 p-1 border border-[#bbb] rounded"
                      onClick={() => {
                        if (user.role && user._id) {
                          navigate(`/betting-history/${user.role}/${user._id}`);
                        } else {
                          console.warn("Missing role or ID in user", user);
                        }
                      }}
                    >
                      <FaList />
                    </button>
                    <button
                      title="Change Status"
                      className="bg-gray-200 p-1 border border-[#bbb] rounded"
                      // onClick={openModal}
                      onClick={() => {
                        setSelectedUser({ id: user._id, role: user.role, username: user.username || user.account, status: user.status });
                        openModal();
                      }}
                    >
                      <FaCog />
                    </button>
                    <button
                      title="Account Summary"
                      className="bg-gray-200 p-1 border border-[#bbb] rounded"
                      onClick={() => {
                        if (user.role && user._id) {
                          navigate(`/account-summary/${user.role}/${user._id}`);
                        } else {
                          console.warn("Missing role or ID in user", user);
                        }
                      }}
                    >
                      <FaUser />
                    </button>
                    <button
                      title="Block Market"
                      className="bg-gray-200 p-1 border border-[#bbb] rounded"
                      onClick={() => {
                        setSelectedUser({ id: user._id, role: user.role, username: user.username || user.account });
                        openMarket();
                      }}
                    >
                      <FaLock />
                    </button>
                    {/* Show commission button only for superadmin viewing agents */}
                    {currentUser?.role === "superadmin" && user.role === "agent" && (
                      <button
                        title="Set Commission"
                        className="bg-gray-200 p-1 border border-[#bbb] rounded"
                        onClick={() => {
                          setSelectedAgent({
                            id: user._id,
                            username: user.username || user.account,
                            commissionPercentage: user.commissionPercentage || 0
                          });
                          openCommissionModal();
                        }}
                      >
                        <FaPercent />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-4 gap-2">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="bg-gray-200 px-2 rounded border border-gray-400 disabled:opacity-50"
        >
          &lt;
        </button>

        {pageButtons.map((p, idx) => {
          if (p === "left-ellipsis" || p === "right-ellipsis") {
            return (
              <span key={p + idx} className="px-3 text-gray-500">
                ...
              </span>
            );
          }

          return (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-2 border rounded ${
                currentPage === p
                  ? "bg-[#ffa00c] text-white border-[#cb8009] scale-105"
                  : "bg-gray-200 border-gray-400"
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="bg-gray-200 px-2 rounded border border-gray-400 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>

      {/* Modals */}
      {isStatusChangeOpen && selectedUser && <ChangeStatus
        onClose={closeModal}
        userId={selectedUser.id}
        role={selectedUser.role}
        username={selectedUser.username}
        status={selectedUser.status}
        onStatusChanged={refreshDownlines}
      />}
      {isBlockMarketOpen && selectedUser && <BlockMarket onClose={closeMarket} userId={selectedUser.id} />}
      {isCreditRefOpen && selectedUser && <CreditRef 
        onClose={closeCreditRef} 
        userId={selectedUser.id}
        creditReferenceCurrent={selectedUser.creditReference}
        onSuccess={refreshDownlines}
      />}
      {isCommissionModalOpen && selectedAgent && (
        <SetAgentCommission
          onClose={closeCommissionModal}
          agentId={selectedAgent.id}
          agentUsername={selectedAgent.username}
          currentCommission={selectedAgent.commissionPercentage}
          onSuccess={refreshDownlines}
        />
      )}
    </div>
  );
}

export default AccountTable;
