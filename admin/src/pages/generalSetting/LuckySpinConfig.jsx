import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { BiSolidPencil } from 'react-icons/bi';

const LuckySpinConfig = () => {
  const [rewards, setRewards] = useState([]);
  const [config, setConfig] = useState({
    mode: 'random',
    customRandomSelections: [],
    manualSelection: 1,
  });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState({ number: 1, winGift: '', type: 'cash', value: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/admin/lucky-spin/config');
      if (res.data.success) {
        setRewards(res.data.data.rewards);
        setConfig(res.data.data.config);
      }
    } catch (error) {
      toast.error('Failed to fetch config');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode) => {
    setConfig({ ...config, mode });
  };

  const handleCheckboxChange = (number) => {
    const isSelected = config.customRandomSelections.includes(number);
    let newSelections;
    if (isSelected) {
      newSelections = config.customRandomSelections.filter((n) => n !== number);
    } else {
      newSelections = [...config.customRandomSelections, number];
    }
    setConfig({ ...config, customRandomSelections: newSelections });
  };

  const handleSaveConfig = async (overrideMode, overrideManualSelection) => {
    try {
      const payload = {
        mode: overrideMode || config.mode,
        customRandomSelections: config.customRandomSelections,
      };
      if (overrideManualSelection !== undefined) {
        payload.manualSelection = overrideManualSelection;
      }
      
      const res = await axiosInstance.post('/admin/lucky-spin/config', payload);
      if (res.data.success) {
        toast.success('Configuration saved successfully');
        if (overrideMode) setConfig({ ...config, mode: overrideMode });
        if (overrideManualSelection !== undefined) setConfig({ ...config, manualSelection: overrideManualSelection });
      }
    } catch (error) {
      toast.error('Failed to save config');
    }
  };

  const handleEditClick = (reward) => {
    setIsAdding(false);
    setEditingId(reward.number);
    setEditForm({ number: reward.number, winGift: reward.winGift, type: reward.type, value: reward.value });
  };

  const handleAddClick = () => {
    setEditingId(null);
    setIsAdding(true);
    // suggest the next number
    const nextNumber = rewards.length > 0 ? Math.max(...rewards.map(r => r.number)) + 1 : 1;
    setEditForm({ number: nextNumber, winGift: '', type: 'cash', value: 0 });
  };

  const handleSaveReward = async () => {
    try {
      const res = await axiosInstance.post('/admin/lucky-spin/reward', editForm);
      if (res.data.success) {
        toast.success(isAdding ? 'Reward added' : 'Reward updated');
        setEditingId(null);
        setIsAdding(false);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update reward');
    }
  };

  if (loading) {
    return <div className="p-4 font-['Times_New_Roman'] text-[#243a48]">Loading...</div>;
  }

  return (
    <div className="p-2 mt-4 font-['Times_New_Roman']">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#243a48] text-[16px] font-[700]">Lucky Spin Configuration</h2>
        
        <div className="flex gap-4 items-center text-xs text-[#243a48] font-bold">
          <button 
            onClick={handleAddClick}
            disabled={isAdding || editingId !== null}
            className="flex items-center justify-center text-white bg-[#2789ce] hover:bg-[#1f73ad] rounded-sm px-3 py-1 font-bold disabled:opacity-50"
          >
            + Add New Segment
          </button>
          <label className="flex items-center gap-1 cursor-pointer ml-4">
            <input 
              type="radio" 
              name="mode" 
              checked={config.mode === 'custom_random'} 
              onChange={() => handleModeChange('custom_random')} 
            />
            Custom Random
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input 
              type="radio" 
              name="mode" 
              checked={config.mode === 'random'} 
              onChange={() => handleModeChange('random')} 
            />
            Random
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input 
              type="radio" 
              name="mode" 
              checked={config.mode === 'manual'} 
              onChange={() => handleModeChange('manual')} 
            />
            Manual Result
          </label>
        </div>
      </div>

      <div className="mt-4 flex">
        <table className="min-w-full text-xs text-left bg-[#fff]">
          <thead>
            <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
              <th className="px-2 py-2 w-16">Sr</th>
              <th className="px-2 py-2 w-24">Number</th>
              <th className="px-2 py-2">Win Gift</th>
              <th className="px-2 py-2 w-48">Action</th>
            </tr>
          </thead>
          <tbody className="border-y border-y-[#7e97a7]">
            {rewards.map((reward, index) => (
              <tr key={reward.number} className="border-y border-y-[#7e97a7]">
                <td className="px-2 py-2">{index + 1}</td>
                <td className="px-2 py-2">{reward.number}</td>
                <td className="px-2 py-2">
                  {editingId === reward.number ? (
                    <div className="flex flex-col gap-1 max-w-[300px]">
                      <input 
                        type="text" 
                        value={editForm.winGift} 
                        onChange={(e) => setEditForm({...editForm, winGift: e.target.value})}
                        className="border border-[#bbb] px-2 py-1 text-xs outline-none"
                        placeholder="Gift Name"
                      />
                      <div className="flex gap-1">
                        <select 
                          value={editForm.type}
                          onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                          className="border border-[#bbb] px-1 py-1 text-xs outline-none"
                        >
                          <option value="cash">Cash</option>
                          <option value="item">Item</option>
                          <option value="none">None</option>
                        </select>
                        <input 
                          type="number" 
                          value={editForm.value} 
                          onChange={(e) => setEditForm({...editForm, value: Number(e.target.value)})}
                          className="border border-[#bbb] px-2 py-1 w-20 text-xs outline-none"
                          placeholder="Value"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="font-semibold">{reward.winGift}</span>
                  )}
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-2">
                    {editingId === reward.number ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={handleSaveReward}
                          className="flex gap-1 text-green-700 border border-[#bbb] rounded-sm px-2 py-1 font-bold"
                          style={{ background: "linear-gradient(180deg, #fff, #eee)" }}
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="flex gap-1 text-red-700 border border-[#bbb] rounded-sm px-2 py-1 font-bold"
                          style={{ background: "linear-gradient(180deg, #fff, #eee)" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleSaveConfig('manual', reward.number)}
                          disabled={config.mode !== 'manual' || isAdding}
                          className={`border border-[#bbb] rounded-sm px-2 py-1 ${config.mode !== 'manual' || isAdding ? 'opacity-50 cursor-not-allowed' : 'text-[#2789ce]'}`}
                          style={{ 
                            background: config.mode === 'manual' && config.manualSelection === reward.number 
                              ? '#d4e6f1' 
                              : "linear-gradient(180deg, #fff, #eee)" 
                          }}
                        >
                          {config.mode === 'manual' && config.manualSelection === reward.number ? 'Selected' : 'Select Result'}
                        </button>
                        
                        <input 
                          type="checkbox"
                          checked={config.customRandomSelections.includes(reward.number)}
                          onChange={() => handleCheckboxChange(reward.number)}
                          disabled={config.mode !== 'custom_random' || isAdding}
                          className={`w-3 h-3 cursor-pointer ${config.mode !== 'custom_random' || isAdding ? 'opacity-50' : ''}`}
                        />

                        <button 
                          onClick={() => handleEditClick(reward)}
                          disabled={isAdding || editingId !== null}
                          className="flex items-center justify-center text-[#2789ce] border border-[#bbb] rounded-sm px-1 py-1 ml-2 disabled:opacity-50"
                          style={{ background: "linear-gradient(180deg, #fff, #eee)" }}
                          title="Edit"
                        >
                          <BiSolidPencil className="text-[14px]" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {isAdding && (
              <tr className="border-y border-y-[#7e97a7] bg-[#f9f9f9]">
                <td className="px-2 py-2 text-gray-500 font-bold">New</td>
                <td className="px-2 py-2">
                  <input 
                    type="number" 
                    value={editForm.number} 
                    onChange={(e) => setEditForm({...editForm, number: Number(e.target.value)})}
                    className="border border-[#bbb] px-2 py-1 w-16 text-xs outline-none"
                    placeholder="Num"
                  />
                </td>
                <td className="px-2 py-2">
                  <div className="flex flex-col gap-1 max-w-[300px]">
                    <input 
                      type="text" 
                      value={editForm.winGift} 
                      onChange={(e) => setEditForm({...editForm, winGift: e.target.value})}
                      className="border border-[#bbb] px-2 py-1 text-xs outline-none"
                      placeholder="Gift Name (e.g. 18.00)"
                    />
                    <div className="flex gap-1">
                      <select 
                        value={editForm.type}
                        onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                        className="border border-[#bbb] px-1 py-1 text-xs outline-none"
                      >
                        <option value="cash">Cash</option>
                        <option value="item">Item</option>
                        <option value="none">None</option>
                      </select>
                      <input 
                        type="number" 
                        value={editForm.value} 
                        onChange={(e) => setEditForm({...editForm, value: Number(e.target.value)})}
                        className="border border-[#bbb] px-2 py-1 w-20 text-xs outline-none"
                        placeholder="Cash Value"
                      />
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2">
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSaveReward}
                      className="flex gap-1 text-green-700 border border-[#bbb] rounded-sm px-2 py-1 font-bold"
                      style={{ background: "linear-gradient(180deg, #fff, #eee)" }}
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsAdding(false)}
                      className="flex gap-1 text-red-700 border border-[#bbb] rounded-sm px-2 py-1 font-bold"
                      style={{ background: "linear-gradient(180deg, #fff, #eee)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-4">
        {config.mode === 'custom_random' && (
          <button 
            onClick={() => handleSaveConfig()}
            className="text-[#2789ce] border border-[#bbb] rounded-sm px-4 py-1 font-bold"
            style={{ background: "linear-gradient(180deg, #fff, #eee)" }}
          >
            Save Custom Config
          </button>
        )}
        {config.mode === 'random' && (
          <button 
            onClick={() => handleSaveConfig()}
            className="text-[#2789ce] border border-[#bbb] rounded-sm px-4 py-1 font-bold"
            style={{ background: "linear-gradient(180deg, #fff, #eee)" }}
          >
            Confirm Random Mode
          </button>
        )}
      </div>
    </div>
  );
};

export default LuckySpinConfig;
