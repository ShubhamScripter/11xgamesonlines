import React from 'react'
import HeaderLogin from '../../components/Header/HeaderLogin'
import { MdArrowBackIos } from "react-icons/md";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaPhoneVolume } from "react-icons/fa6";
function UplineWhatsapp() {
  return (
    <div>
      <HeaderLogin/>
      <div className="bg-[#000] h-10 flex items-center px-5 relative">
        <div
        onClick={() => window.history.back()} 
        >
          <MdArrowBackIos className='text-white text-2xl font-semibold' />
        </div>
        <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">Upline Whatsapp Number</span>
      </div>
      <div className='bg-[#f1f7ff] h-[80vh] flex flex-col  gap-5'>
        <div className='text-xl font-bold mx-5 mt-5'>Whatsapp Number</div>
        <div className='bg-white rounded-2xl p-4 px-4 mx-5 flex items-center justify-between'>
          <IoLogoWhatsapp className='text-green-600 text-4xl'/>
          <div className='bg-green-600 p-2 rounded-lg'>
            <FaPhoneVolume className='text-white text-2xl'/>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default UplineWhatsapp