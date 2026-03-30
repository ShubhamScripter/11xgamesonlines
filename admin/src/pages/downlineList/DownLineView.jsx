import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FaMicrophone } from 'react-icons/fa';
import { IoSearchSharp } from 'react-icons/io5';
import { MdPersonAddAlt1 } from 'react-icons/md';
import { IoMdRefresh } from 'react-icons/io';
import BalanceCard from '../../components/downListComp/admin/BalanceCard';
import AccountTable from '../../components/downListComp/admin/AccountTable';
import AccountTableUser from '../../components/downListComp/admin/AccountTableUser';
import AddSubAdmin from '../../components/downListComp/admin/AddSubAdmin';
import AddUser from '../../components/downListComp/admin/AddUser';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDownlineTree } from '../../store/downlineSlice';

const roleHierarchy = {
  superadmin: "admin",
  admin: 'subadmin',
  subadmin: 'seniorSuper',
  seniorSuper: 'superAgent',
  superAgent: 'agent',
  agent: 'user',
  user: null,
};

function DownLineView() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const loggedInUser = useSelector(state => state.auth.user);
  const { balanceData, downlines, loading, error, currentUser, totalPages, totalUsers, pageSize } = useSelector(
    state => state.downline
  );
  console.log("my currentUser is2:",currentUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setPage(1);
    setAppliedSearch("");
    setSearchInput("");
  }, [userId]);

  useEffect(() => {
    if (userId) {
      dispatch(
        fetchDownlineTree({
          userId,
          page,
          limit: pageSize || 10,
          searchQuery: appliedSearch,
        })
      );
    }
  }, [userId, page, appliedSearch, pageSize, dispatch]);

  // Get the role from the currentUser object (should be set in your slice)
  const userRole = currentUser?.role || null;
  console.log("my userRole is",userRole);
  const nextRole = roleHierarchy[userRole] || null;
  /** Logged-in superadmin may only add end users (matches API). */
  const createRole =
    loggedInUser?.role === "superadmin" && nextRole != null ? "user" : nextRole;
  

  const runMemberSearch = () => {
    setPage(1);
    setAppliedSearch(searchInput.trim());
  };

  const clearMemberSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  };

  // Status filter only (search is server-side via appliedSearch)
  const filteredDownlines = useMemo(() => {
    let filtered = [...downlines];
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => {
        const userStatus = (user.status || "").toLowerCase();
        return userStatus === statusFilter.toLowerCase();
      });
    }
    return filtered;
  }, [downlines, statusFilter]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    if (userId) {
      dispatch(
        fetchDownlineTree({
          userId,
          page,
          limit: pageSize || 10,
          searchQuery: appliedSearch,
        })
      );
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div>
      {/* News Banner */}
      <div className="p-1 rounded-lg flex items-center justify-start gap-1 bg-gradient-to-b from-[#2a3a43] via-[#2a3a43] to-[#1c282d]">
        <FaMicrophone className="text-white text-sm" />
        <span className="text-white text-sm">News</span>
      </div>

      {/* Search and Actions */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-2">
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
                className="text-sm bg-white w-40"
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

        {/* Add + Refresh */}
        <div className="flex gap-2">
          {nextRole && (
            <div
              className="flex justify-center items-center border border-[#bbb] shadow-[inset_0_2px_0_0_#ffffff80] bg-gradient-to-b from-white to-[#eee] px-2 py-1 gap-2 cursor-pointer"
              onClick={openModal}
            >
              <MdPersonAddAlt1 className="text-xl" />
              <span className="text-sm font-medium">
                Add {createRole === "user" ? "User" : nextRole}
              </span>
            </div>
          )}

          <div
            onClick={() =>
              userId &&
              dispatch(
                fetchDownlineTree({
                  userId,
                  page,
                  limit: pageSize || 10,
                  searchQuery: appliedSearch,
                })
              )
            }
            className="rounded-sm p-1 border border-[#bbb] shadow-[inset_0_2px_0_0_#ffffff80] bg-gradient-to-b from-white to-[#eee] cursor-pointer"
          >
            <IoMdRefresh className="font-bold text-xl" />
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <BalanceCard balanceData={balanceData} />

      {/* Downline Table */}
      {nextRole === "user" ? (
        <AccountTableUser
          serverPaginated
          users={filteredDownlines}
          refreshDownlines={() =>
            userId &&
            dispatch(
              fetchDownlineTree({
                userId,
                page,
                limit: pageSize || 10,
                searchQuery: appliedSearch,
              })
            )
          }
          currentUser={currentUser}
        />
      ) : (
        <AccountTable
          serverPaginated
          users={filteredDownlines}
          refreshDownlines={() =>
            userId &&
            dispatch(
              fetchDownlineTree({
                userId,
                page,
                limit: pageSize || 10,
                searchQuery: appliedSearch,
              })
            )
          }
          currentUser={currentUser}
        />
      )}

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


      {/* Modal */}
      {isModalOpen &&
        (loggedInUser?.role === "superadmin" || createRole === "user" ? (
          <AddUser
            onClose={closeModal}
            roleToCreate="user"
            parentId={userId}
            siteTag="baaji.net"
          />
        ) : (
          <AddSubAdmin
            onClose={closeModal}
            roleToCreate={nextRole}
            parentId={userId}
            siteTag="baaji.net"
          />
        ))}
    </div>
  );
}

export default DownLineView;