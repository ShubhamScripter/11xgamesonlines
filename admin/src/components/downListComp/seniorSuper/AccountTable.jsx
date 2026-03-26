// AccountTable.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaExchangeAlt,
  FaUser,
  FaCog,
  FaLock,
  FaList,
} from "react-icons/fa";

import ChangeStatus from "./ChangeStatus";
import BlockMarket from "./BlockMarket";

function AccountTable({ users }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const totalPages = Math.ceil(users.length / rowsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const currentUsers = users.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const [isStatusChangeOpen, setStatusChangeOpen] = useState(false);
  const openModal = () => setStatusChangeOpen(true);
  const closeModal = () => setStatusChangeOpen(false);

  const [isBlockMarketOpen, setisBlockMarketOpen] = useState(false);
  const openMarket = () => setisBlockMarketOpen(true);
  const closeMarket = () => setisBlockMarketOpen(false);

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
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody className="border-y border-[#7e97a7]">
            {currentUsers.map((user, idx) => (
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
                    SA
                  </span>
                  <span
                    className="text-[#2066c6] text-xs underline cursor-pointer"
                    onClick={() => {
                      if (user.role && user._id) {
                        navigate(`/${user.role}/${user._id}`);
                      } else {
                        console.warn("Missing role or ID in user", user);
                      }
                    }}
                  >
                    {user.username || user.account || "N/A"}
                  </span>
                </td>
                <td className="px-2 py-2 text-[#2066c6] underline">
                  {(user.creditRef ?? 0).toFixed(2)}
                </td>
                <td className="px-2 py-2 text-[#2066c6]">
                  {(user.balance ?? 0).toLocaleString()}
                </td>
                <td className="px-2 py-2">
                  <span className="px-2 py-1 rounded text-red-600 bg-red-100 border border-[#deb6c0] inline-block">
                    {(user.exposure ?? 0).toLocaleString()}
                  </span>
                </td>
                <td className="px-2 py-2">{(user.availBal ?? 0).toLocaleString()}</td>
                <td className="px-2 py-2">{(user.playerBal ?? 0).toLocaleString()}</td>
                <td className="px-2 py-2">{user.refPL ?? 0}</td>
                <td className="px-2 py-2">
                  <div className="bg-[#e5f1dc] text-[#508d0e] px-2 py-1 border border-[#bedca7] rounded-lg text-[12px] font-semibold flex gap-1 items-center">
                    <span className="text-[#4cbb17]">●</span>
                    <span>{user.status ?? "N/A"}</span>
                  </div>
                </td>
                <td className="px-2 py-2 flex gap-2">
                  <button
                    title="Betting Profit Loss"
                    className="bg-gray-200 p-1 border border-[#bbb] rounded"
                    onClick={() => navigate("/betting-profit-loss")}
                  >
                    <FaExchangeAlt />
                  </button>
                  <button
                    title="Betting History"
                    className="bg-gray-200 p-1 border border-[#bbb] rounded"
                    onClick={() => navigate("/betting-history")}
                  >
                    <FaList />
                  </button>
                  <button
                    title="Change Status"
                    className="bg-gray-200 p-1 border border-[#bbb] rounded"
                    onClick={openModal}
                  >
                    <FaCog />
                  </button>
                  <button
                    title="Account Summary"
                    className="bg-gray-200 p-1 border border-[#bbb] rounded"
                    onClick={() => navigate("/account-summary")}
                  >
                    <FaUser />
                  </button>
                  <button
                    title="Block Market"
                    className="bg-gray-200 p-1 border border-[#bbb] rounded"
                    onClick={openMarket}
                  >
                    <FaLock />
                  </button>
                </td>
              </tr>
            ))}
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

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-2 border rounded ${
              currentPage === i + 1
                ? "bg-[#ffa00c] text-white border-[#cb8009]"
                : "bg-gray-200 border-gray-400"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="bg-gray-200 px-2 rounded border border-gray-400 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>

      {/* Modals */}
      {isStatusChangeOpen && <ChangeStatus onClose={closeModal} />}
      {isBlockMarketOpen && <BlockMarket onClose={closeMarket} />}
    </div>
  );
}

export default AccountTable;
