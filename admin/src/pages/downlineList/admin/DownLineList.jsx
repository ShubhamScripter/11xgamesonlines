import React, { useEffect, useState, useMemo } from "react";
import { FaMicrophone } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";
import { MdPersonAddAlt1 } from "react-icons/md";
import { IoMdRefresh } from "react-icons/io";
import BalanceCard from "../../../components/downListComp/admin/BalanceCard";
import AccountTable from "../../../components/downListComp/admin/AccountTable";
import AddSubAdmin from "../../../components/downListComp/admin/AddSubAdmin";
import AddUser from "../../../components/downListComp/admin/AddUser";
import { useSelector, useDispatch } from "react-redux";
import { fetchDownlineTree } from "../../../store/downlineSlice";

// Role hierarchy for dynamic "Add X" role
const roleHierarchy = {
  superadmin: "admin",
  admin: "subadmin",
  subadmin: "seniorSuper",
  seniorSuper: "superAgent",
  superAgent: "agent",
  agent: "user",
  user: null, // Can't add further
};

function DownLineList() {
  const user = useSelector(state => state.auth.user);
  const { balanceData, downlines, loading, error } = useSelector(state => state.downline);
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const nextRole = roleHierarchy[user?.role] || null;

  // Filter downlines based on search query and status
  const filteredDownlines = useMemo(() => {
    let filtered = [...downlines];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((user) => {
        const username = (user.username || user.account || "").toLowerCase();
        return username.includes(query);
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => {
        const userStatus = (user.status || "").toLowerCase();
        return userStatus === statusFilter.toLowerCase();
      });
    }

    return filtered;
  }, [downlines, searchQuery, statusFilter]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    if (user?.id) dispatch(fetchDownlineTree(user.id));
  };

  useEffect(() => {
    if (user?.id) dispatch(fetchDownlineTree(user.id));
  }, [user, dispatch]);

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-0 text-sm"
            />
            <button 
              className="bg-[#fdb72f] rounded-sm p-1 font-serif text-sm"
              onClick={() => setSearchQuery("")}
            >
              {searchQuery ? "Clear" : "Search"}
            </button>
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

        {/* Actions */}
        <div className="flex gap-2">
          {nextRole && (
            <div
              className="flex justify-center items-center border border-[#bbb] shadow-[inset_0_2px_0_0_#ffffff80] bg-gradient-to-b from-white to-[#eee] px-2 py-1 gap-2 cursor-pointer"
              onClick={openModal}
            >
              <MdPersonAddAlt1 className="text-xl" />
              <span className="text-sm font-medium">Add {nextRole}</span>
            </div>
          )}

          {/* Refresh Button */}
          <div
            onClick={() => user?.id && dispatch(fetchDownlineTree(user.id))}
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
        users={filteredDownlines} 
        refreshDownlines={() => user?.id && dispatch(fetchDownlineTree(user.id))}
        currentUser={user}
      />

      {/* Add User/SubAdmin Modal */}
      {isModalOpen && (
        nextRole === "user" ? (
          <AddUser
            onClose={closeModal}
            roleToCreate={nextRole}
            parentId={user?.id}
            maxCommission={user?.commissionPercentage ?? 0}
          />
        ) : (
          <AddSubAdmin onClose={closeModal} roleToCreate={nextRole} parentId={user?.id} />
        )
      )}

      {/* Loading/Error */}
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}

export default DownLineList;