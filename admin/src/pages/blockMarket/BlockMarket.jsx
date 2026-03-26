import React, { useState } from "react";
import { useSelector } from 'react-redux';
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import ConfirmBox from "./ConfirmBox";

function BlockMarket() {
  const user = useSelector(state => state.auth.user);
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  const [confirmBoxText, setConfirmBoxText] = useState("");
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [loading, setLoading] = useState(false);

  const [handleModeChange, setHandleModeChange] = useState({
    intercasino: true,
    awccasino: true,
    cricket: true,
    tenis: true,
    depositwidraw: true,
    soccer: true,
  });

  // Mapping between market keys and API game names
  const gameNameMap = {
    intercasino: "casino",
    awccasino: "awc",
    cricket: "cricket",
    tenis: "tennis",
    depositwidraw: "deposit",
    soccer: "soccer"
  };

  const openModal = () => setShowConfirmBox(true);
  const closeModal = () => setShowConfirmBox(false);

  const tableData = [
    { id: 1, key: "intercasino", name: "Inter Casino", betfairId: 6 },
    { id: 2, key: "awccasino", name: "AWC Casino", betfairId: 7 },
    { id: 3, key: "cricket", name: "Cricket", betfairId: 4 },
    { id: 4, key: "tenis", name: "Tennis", betfairId: 2 },
    { id: 5, key: "depositwidraw", name: "Deposite / Withdraw", betfairId: 8 },
    { id: 6, key: "soccer", name: "Soccer", betfairId: 1 },
  ];

  const toggleMarket = (marketKey) => {
    const isCurrentlyOn = handleModeChange[marketKey];
    setConfirmBoxText(
      `Do you want to ${isCurrentlyOn ? "Inactive" : "Active"} this match?`
    );
    setSelectedMarket(marketKey);
    openModal();
  };

  const handleConfirmResponse = async (confirmed) => {
    if (!confirmed || !selectedMarket || !user?.id) {
      closeModal();
      setSelectedMarket(null);
      return;
    }

    setLoading(true);

    try {
      const gameName = gameNameMap[selectedMarket];
      const currentStatus = handleModeChange[selectedMarket];
      
      const marketName = tableData.find(item => item.key === selectedMarket)?.name || "Market";
      
      // Make API call to toggle the lock status
      const response = await axiosInstance.patch(`/gamelock/${user.id}`, {
        game: gameName,
        lock: !currentStatus
      });

      // Update state on success
      if (response.status === 200 || response.status === 201) {
        setHandleModeChange((prev) => ({
          ...prev,
          [selectedMarket]: !prev[selectedMarket],
        }));
        
        // Show success toast with the correct status (opposite of current status)
        const newStatus = currentStatus ? "deactivated" : "activated";
        toast.success(`${marketName} has been ${newStatus} successfully`);
      }
    } catch (err) {
      console.error("Error updating game lock status:", err);
      const errorMessage = err.response?.data?.message || "Failed to update game lock status";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      closeModal();
      setSelectedMarket(null);
    }
  };

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Sport Listing</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="table w-full table-fixed">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7] text-[#243a48] text-sm">
            <tr>
              <th className="px-4 py-2 text-left w-[8%]">S.No.</th>
              <th className="px-4 py-2 text-left w-[15%]">Betfair ID</th>
              <th className="px-4 py-2 text-left w-[30%]">Name</th>
              <th className="px-4 py-2 text-left w-[27%]">Status</th>
              <th className="px-4 py-2 text-left w-[20%]">Action</th>
            </tr>
          </thead>
          <tbody className="border-y border-y-[#7e97a7] bg-white text-xs">
            {tableData.map((item) => (
              <tr key={item.id} className="border-y border-y-[#7e97a7]">
                <td className="px-4 py-3">{item.id}</td>
                <td className="px-4 py-3">{item.betfairId}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">
                  {item.name} is {handleModeChange[item.key] ? "ON" : "OFF"}
                </td>
                <td className="px-4 py-3">
                  <div
                      className={`rounded-4xl w-12 h-6 flex items-center relative ${
                        loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                      } ${
                        handleModeChange[item.key]
                          ? "bg-[#2196f3] border border-[#2196f3]"
                          : "border border-[#464541]"
                      }`}
                      onClick={() => !loading && toggleMarket(item.key)}
                    >
                      <span
                        className={`w-4 h-4 block rounded-full ${
                          handleModeChange[item.key] ? "bg-[#f0ece1] right-1" : "bg-[#6d6b64] left-1"
                        } absolute`}
                      ></span>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Box */}
      {showConfirmBox && (
        <ConfirmBox
          onClose={closeModal}
          setConfirmResponse={handleConfirmResponse}
          confirmBoxtext={confirmBoxText}
        />
      )}
    </div>
  );
}

export default BlockMarket;
