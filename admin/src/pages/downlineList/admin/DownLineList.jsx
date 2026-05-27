import React, { useEffect, useState, useMemo } from "react";
import { FaMicrophone } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";
import { MdPersonAddAlt1 } from "react-icons/md";
import { IoMdRefresh } from "react-icons/io";
import BalanceCard from "../../../components/downListComp/admin/BalanceCard";
import AccountTable from "../../../components/downListComp/admin/AccountTable";
import AddUser from "../../../components/downListComp/admin/AddUser";
import { useSelector, useDispatch } from "react-redux";
import { fetchDownlineTree } from "../../../store/downlineSlice";

// Who can add downline users (end "user" accounts only on this page)
const canAddUserRole = {
  superadmin: true,
  admin: true,
  subadmin: true,
  seniorSuper: true,
  superAgent: true,
  agent: true,
  user: false,
};

function DownLineList() {
  const user = useSelector(state => state.auth.user);
  const { balanceData, downlines, loading, error, totalPages, totalUsers, pageSize } = useSelector(
    state => state.downline
  );
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState("user");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const showAddUser = !!canAddUserRole[user?.role];

  const fetchParams = () => ({
    userId: user.id,
    page,
    limit: pageSize || 8,
    searchQuery: appliedSearch,
  });

  useEffect(() => {
    setPage(1);
    setAppliedSearch("");
    setSearchInput("");
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) dispatch(fetchDownlineTree(fetchParams()));
  }, [user?.id, page, appliedSearch, pageSize, dispatch]);

  const runMemberSearch = () => {
    setPage(1);
    setAppliedSearch(searchInput.trim());
  };

  const clearMemberSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  };

  const filteredDownlines = useMemo(() => {
    let filtered = [...downlines];
    if (statusFilter !== "all") {
      filtered = filtered.filter((row) => {
        const userStatus = (row.status || "").toLowerCase();
        return userStatus === statusFilter.toLowerCase();
      });
    }
    return filtered;
  }, [downlines, statusFilter]);

  const openModal = (roleToCreate = "user") => {
    setModalRole(roleToCreate);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    if (user?.id) dispatch(fetchDownlineTree(fetchParams()));
  };

  const refetch = () => user?.id && dispatch(fetchDownlineTree(fetchParams()));

  return (
    <div>
      {/* News Banner */}
      <div className="p-1 rounded-lg flex items-center justify-start gap-1 bg-gradient-to-b from-[#2a3a43] via-[#2a3a43] to-[#1c282d]">
        <FaMicrophone className="text-white text-sm" />
        <span className="text-white text-sm">News</span>
      </div>

      {/* Search and Actions */}
      <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="bg-white border border-[#aaa] flex items-center gap-2 px-2 py-1 shadow-[inset_0_2px_0_0_#0000001a]">
            <IoSearchSharp />
            <input
              type="text"
              placeholder="Find Member...."
              name="findMember"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runMemberSearch()}
              className="outline-0 text-sm"
            />
            <button
              type="button"
              className="bg-[#fdb72f] rounded-sm p-1 font-serif text-sm"
              onClick={runMemberSearch}
            >
              Search
            </button>
            {(appliedSearch || searchInput.trim()) ? (
              <button
                type="button"
                className="bg-[#eee] border border-[#aaa] rounded-sm px-2 py-1 font-serif text-xs"
                onClick={clearMemberSearch}
              >
                Clear
              </button>
            ) : null}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-light">Status</span>
            <div className="border border-[#aaa]">
              <select 
                className="text-sm bg-white w-40 outline-0"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="suspended">Suspend</option>
                <option value="locked">Locked</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 mr-6 pr-2">
          {showAddUser && (
            <div
              className="flex justify-center items-center border border-[#bbb] shadow-[inset_0_2px_0_0_#ffffff80] bg-gradient-to-b from-white to-[#eee] px-2 py-1 gap-2 cursor-pointer"
              onClick={() => openModal("user")}
            >
              <MdPersonAddAlt1 className="text-xl" />
              <span className="text-sm font-medium">Add User</span>
            </div>
          )}

          <div
            onClick={refetch}
            className="rounded-sm p-1 border border-[#bbb] shadow-[inset_0_2px_0_0_#ffffff80] bg-gradient-to-b from-white to-[#eee] cursor-pointer"
          >
            <IoMdRefresh className="font-bold text-xl" />
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <BalanceCard balanceData={balanceData} />

      {/* Downline Table */}
      <AccountTable
        serverPaginated
        users={filteredDownlines}
        refreshDownlines={refetch}
        currentUser={user}
      />

      <div className="flex flex-wrap justify-center items-center gap-3 mt-4 text-sm font-['Times_New_Roman'] text-[#243a48]">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border border-[#7e97a7] rounded bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages || 1}
          {typeof totalUsers === "number" ? ` · ${totalUsers} total` : ""}
        </span>
        <button
          type="button"
          disabled={page >= (totalPages || 1)}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border border-[#7e97a7] rounded bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Add User modal — only end users are created from this page */}
      {isModalOpen && (
        <AddUser
          onClose={closeModal}
          roleToCreate={modalRole}
          parentId={user?.id}
          maxCommission={user?.commissionPercentage ?? 0}
        />
      )}

      {/* Loading/Error */}
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}

export default DownLineList;