import React from 'react'
import Logo from '../../assets/logo.png'
import { BiSolidUserPlus } from "react-icons/bi";
import { IoMdLogIn } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
function Header() {
  const navigate = useNavigate();
  return (
    <div className='bg-[#17934e] h-12 '>
      <div className='flex justify-between items-center h-full px-4'>
        <img src={Logo} alt="Logo" className='w-30 h-12 mt-1' />
        <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1 bg-[#0a4725] cursor-pointer p-2 rounded-lg'>
                <BiSolidUserPlus className='text-white w-5 h-5'/>
                <span className='text-[15px] font-semibold text-white'>Agent List</span>
            </div>
            <div 
            onClick={()=> navigate('/login')}
            className='flex items-center gap-1 bg-red-600 cursor-pointer p-2 rounded-lg'>
                <IoMdLogIn className='text-white w-5 h-5'/>
                <span className='text-[15px] font-semibold text-white'>Login</span>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Header