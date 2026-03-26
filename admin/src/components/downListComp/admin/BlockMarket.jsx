import React, { useState } from "react";
import ConfirmBox from "./ConfirmBox";
import axiosInstance from "../../../utils/axiosInstance";
import toast from "react-hot-toast";

function BlockMarket({ onClose, userId }) {
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

  const toggleMarket = (marketKey) => {
    const isCurrentlyOn = handleModeChange[marketKey];
    setConfirmBoxText(`Do you want to ${isCurrentlyOn ? "Inactive" : "Active"} this match?`);
    setSelectedMarket(marketKey);
    openModal();
  };

  const handleConfirmResponse = async (confirmed) => {
    if (!confirmed || !selectedMarket || !userId) {
      closeModal();
      setSelectedMarket(null);
      return;
    }

    setLoading(true);

    try {
      const gameName = gameNameMap[selectedMarket];
      const currentStatus = handleModeChange[selectedMarket];
      
      const marketName = [
        { key: "intercasino", name: "Inter Casino" },
        { key: "awccasino", name: "AWC Casino" },
        { key: "cricket", name: "Cricket" },
        { key: "tenis", name: "Tennis" },
        { key: "depositwidraw", name: "Deposit / Withdraw" },
        { key: "soccer", name: "Soccer" }
      ].find(item => item.key === selectedMarket)?.name || "Market";
      
      // Make API call to toggle the lock status
      const response = await axiosInstance.patch(`/gamelock/${userId}`, {
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
    <div className="fixed inset-0 bg-[rgba(17,17,17,0.49)] flex justify-center items-start pt-10 z-50 overflow-auto">
      <div className="bg-[#eee] p-6 rounded-lg relative shadow-lg font-['Times_New_Roman']">
        <div className="border-b border-b-[#00000014]">
          <button onClick={onClose} className="absolute right-3 top-2 text-xl font-bold" disabled={loading}>
            ✕
          </button>
          <h2 className="text-lg font-semibold mb-4 text-[#3b5160]">Block Market</h2>
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-blue-500 border-r-transparent"></div>
                <p className="mt-2 text-sm">Updating...</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6">
          <table className="table">
            <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7] text-[#243a48] text-sm">
              <tr>
                <th className="px-4 py-2">S.No.</th>
                <th className="px-4 py-2">Betfair ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="border-y border-y-[#7e97a7] bg-white text-xs">
              {[
                { id: 1, key: "intercasino", name: "Inter Casino", betfairId: 6 },
                { id: 2, key: "awccasino", name: "AWC Casino", betfairId: 7 },
                { id: 3, key: "cricket", name: "Cricket", betfairId: 4 },
                { id: 4, key: "tenis", name: "Tennis", betfairId: 2 },
                { id: 5, key: "depositwidraw", name: "Deposite / Withdraw", betfairId: 8 },
                { id: 6, key: "soccer", name: "Soccer", betfairId: 1 },
              ].map((item) => (
                <tr key={item.id} className="border-y border-y-[#7e97a7]">
                  <td className="px-4 py-3">{item.id}</td>
                  <td className="px-4 py-3">{item.betfairId}</td>
                  <td className="px-4 py-3">
                    <a href="#">{item.name}</a>
                  </td>
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
