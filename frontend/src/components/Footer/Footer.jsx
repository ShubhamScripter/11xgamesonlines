import React, { useState } from 'react';
import { BsEnvelopePaperHeartFill } from "react-icons/bs";
import { MdSportsCricket } from "react-icons/md";
import { FaListAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { GiHamburgerMenu, GiTrophy } from "react-icons/gi";
import MobNavbar from '../Header/MobNavbar';
import MyProfile from '../../pages/menu/MyProfile';
import homeIcon from '../../assets/icon/icon-menu.png'
import depositIcon from '../../assets/icon/icon-deposit.png'
import profileIcon from '../../assets/icon/icon-profile.png'
import casinoIcon from '../../assets/icon/icon-casinoColor.png'
import slotIcon from '../../assets/icon/icon-slotColor.png'
import { useSelector } from 'react-redux';

function Footer({ activeTab, setActiveTab , menuOpen, setMenuOpen, profileOpen,setProfileOpen }) {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const items = [
        { label: "Menu", icon: homeIcon },
        { label: "Casino", icon: casinoIcon, path: "/casino/casino/all" },
        { label: "Slot", icon: slotIcon, path: "/casino/slot/all" },
        { label: "My Bets", icon: depositIcon, path: "/mybets" },
        ...(user ? [{ label: "Profile", icon: profileIcon }] : [])
    ];

    return (
        <>
            {/* Footer */}
            <div className='fixed bottom-0 w-full z-10 bg-[#141515]'>
                <div className="h-20 w-full flex justify-around items-center">
                    {items.map(item => (
                        <div
                            key={item.label}
                            onClick={() => {
                                if (item.label === "Menu") {
                                    setMenuOpen(!menuOpen);
                                    setProfileOpen(false);
                                } else if (item.label === "Profile") {
                                    setProfileOpen(!profileOpen);
                                    setMenuOpen(false);
                                } else {
                                    setActiveTab(item.path);
                                    navigate(item.path);
                                    setMenuOpen(false);
                                    setProfileOpen(false);
                                }
                            }}
                            className={`flex flex-col justify-center items-center cursor-pointer
                                ${activeTab === item.path ? 'text-[#19A044]' : 'text-gray-400'}
                            `}
                        >
                            
                            <img src={item.icon} alt="" className='h-8' />
                            <span className='text-[13px] font-semibold'>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sliding Menu */}
            <div
                className={`fixed top-[65px] left-0 h-[calc(100vh-145px)] w-full bg-[#141515] z-9 transform transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar
                ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <MobNavbar closeMenu={() => setMenuOpen(false)} />
            </div>
                
             {/* Sliding profile top to bottom */}   
            <div
                className={`fixed w-full bottom-0 left-0 h-screen bg-[#141515] z-30 transform transition-transform duration-300 ease-in-out
                ${profileOpen ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <MyProfile setProfileOpen={setProfileOpen}/>
            </div>
        </>
    );
}

export default Footer;