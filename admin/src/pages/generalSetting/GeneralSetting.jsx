import React, { useState, useEffect } from 'react'
import ChangePassword from '../../assets/change-password.jpg'
import SearchUsers from '../../assets/search-users.jpg'
import Surveillance from "../../assets/surveillance.jpg"
import ActiveMatchList from "../../assets/active-match-list.jpg"
import InActiveMatchList from '../../assets/in-active-match-list.jpg'
import UpdatefancyStatus from '../../assets/update-fancy-status.jpg'
import SuspendedResult from '../../assets/suspended-result.jpg'
import Inactiveusers from '../../assets/inactive-users.jpg'
import BetLockedUsers from '../../assets/bet-locked-users.jpg'

import EditPopup from './EditPopup'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import axios from '../../utils/axiosInstance'

function GeneralSetting() {
    const navigate = useNavigate()
    const [isEditPopupOpen, setEditPopupOpen] = useState(false);
    const [selected, setselected] = useState("AccountSummary")
    const [duplicateIPs, setDuplicateIPs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const user = useSelector(state => state.auth.user);
    const allowedRoles = ["superadmin", "admin","subadmin","seniorSuper"];
    const canViewDuplicateIPs = allowedRoles.includes(user?.role);
    
    // Debug log - remove after testing
    console.log("User role:", user?.role, "Can view duplicate IPs:", canViewDuplicateIPs);

    const openModal = () => setEditPopupOpen(true);
    const closeModal = () => setEditPopupOpen(false);

    // Fetch duplicate IPs on mount
    useEffect(() => {
      if (canViewDuplicateIPs) {
        fetchDuplicateIPs();
      }
    }, [canViewDuplicateIPs]);

    const fetchDuplicateIPs = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get('/duplicate-ip-users');
        if (data.success) {
          setDuplicateIPs(data.data);
        }
      } catch (err) {
        console.error("Error fetching duplicate IPs:", err);
        setError(err.response?.data?.message || "Failed to fetch duplicate IPs");
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[16px] font-[700]">Admin Setting</h2>

      {/* Duplicate IP Section - Only for allowed roles */}
      {canViewDuplicateIPs && (
        <div className='bg-[#fff3cd] border border-[#ffc107] rounded-lg p-4 mt-4'>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-[#856404] font-[700] flex items-center gap-2'>
              ⚠️ Duplicate IP Alerts 
              {duplicateIPs.length > 0 && (
                <span className='bg-[#dc3545] text-white px-2 py-0.5 rounded-full text-xs'>
                  {duplicateIPs.length}
                </span>
              )}
            </h2>
            <button 
              onClick={fetchDuplicateIPs}
              disabled={loading}
              className='bg-[#ffc107] text-[#856404] px-3 py-1 rounded text-sm hover:bg-[#e0a800] disabled:opacity-50'
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {error ? (
            <p className='text-red-600'>❌ {error}</p>
          ) : loading ? (
            <p className='text-[#856404]'>Loading duplicate IPs...</p>
          ) : duplicateIPs.length === 0 ? (
            <p className='text-green-600 font-medium'>✅ No duplicate IPs detected among users</p>
          ) : (
            <div className='max-h-[350px] overflow-y-auto border border-[#ffeeba] rounded'>
              <table className='w-full text-sm'>
                <thead className='bg-[#ffeeba] sticky top-0'>
                  <tr>
                    <th className='text-left p-2 border-b border-[#ffc107]'>#</th>
                    <th className='text-left p-2 border-b border-[#ffc107]'>IP Address</th>
                    <th className='text-left p-2 border-b border-[#ffc107]'>Users Sharing IP</th>
                    <th className='text-center p-2 border-b border-[#ffc107]'>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {duplicateIPs.map((item, index) => (
                    <tr key={index} className='border-b border-[#ffeeba] hover:bg-[#fff8e1]'>
                      <td className='p-2 text-[#856404]'>{index + 1}</td>
                      <td className='p-2 font-mono text-xs bg-[#f8f9fa] rounded'>{item.ip}</td>
                      <td className='p-2'>
                        <div className='flex flex-wrap gap-1'>
                          {item.users.map((u) => (
                            <span 
                              key={u._id} 
                              className='inline-block bg-[#dc3545] text-white px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-[#c82333]'
                              title={`Last login: ${u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}`}
                            >
                              {u.userName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className='text-center p-2'>
                        <span className='bg-[#dc3545] text-white px-3 py-1 rounded-full text-xs font-bold'>
                          {item.count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {duplicateIPs.length > 0 && (
            <div className='mt-3 text-xs text-[#856404]'>
              <strong>Summary:</strong> {duplicateIPs.length} IP address(es) shared by {duplicateIPs.reduce((sum, item) => sum + item.count, 0)} users
            </div>
          )}
        </div>
      )}

      <div className='bg-[#e0e6e6] border-b border-b-[#7e97a7]  p-4 mt-4'>
        <h2 className='text-[#243a48] font-[700]'>General Settings</h2>
        <div className='flex gap-2 mt-2'>
            <img src={ChangePassword} alt="" className='rounded-[10px] border-2 border-[#333]'
            onClick={()=>setEditPopupOpen(true)}
            />
            <img src={SearchUsers} alt="" className='rounded-[10px] border-2 border-[#333]'
            onClick={()=>navigate('/searchuser')}
            />
            <img src={Surveillance} alt="" className='rounded-[10px] border-2 border-[#333]'
            onClick={()=>navigate('/SurveillanceSetting')}
            />
        </div>
      </div>

      <div className='bg-[#e0e6e6] border-b border-b-[#7e97a7]  p-4 mt-4'>
        <h2 className='text-[#243a48] font-[700]'>Match And Bets</h2>
        <div className='flex gap-2 mt-2'>
            <img src={ActiveMatchList} alt="" className='rounded-[10px] border-2 border-[#333]'
            onClick={()=>navigate('/active-match')}
            />
            <img src={InActiveMatchList} alt="" className='rounded-[10px] border-2 border-[#333]'
            onClick={()=>navigate('/in-active-match')}
            />
            <img src={UpdatefancyStatus} alt="" className='rounded-[10px] border-2 border-[#333]'
            onClick={()=>navigate('/updateFancyStatus')}
            />
            <img src={SuspendedResult} alt="" className='rounded-[10px] border-2 border-[#333]'
            onClick={()=>navigate('/SuspendedResult')}
            />
        </div>
      </div>

      <div className='bg-[#e0e6e6] border-b border-b-[#7e97a7]  p-4 mt-4'>
        <h2 className='text-[#243a48] font-[700]'>User Settings</h2>
        <div className='flex gap-2 mt-2'>
            <img src={Inactiveusers} alt="" className='rounded-[10px] border-2 border-[#333]'
            onClick={()=>navigate('/inactive-users')}
            />
            <img src={BetLockedUsers} alt="" className='rounded-[10px] border-2 border-[#333]'
            onClick={()=>navigate('/BetLockUser')}
            />
        </div>
      </div>
      {/* edit popup */}
      {isEditPopupOpen && <EditPopup onClose={closeModal}/>}
    </div>
  )
}

export default GeneralSetting
