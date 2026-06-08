import React, { useState } from 'react';
import { BsEnvelopePaperHeartFill } from "react-icons/bs";
import { MdSportsCricket } from "react-icons/md";
import { FaListAlt } from "react-icons/fa";
import { useNavigate, useLocation } from 'react-router-dom';
import { HiHome } from "react-icons/hi2";
import MobNavbar from '../Header/MobNavbar';
import MyProfile from '../../pages/menu/MyProfile';
import menuIcon from '../../assets/icon/icon-menu.png'
import depositIcon from '../../assets/icon/icon-deposit.png'
import profileIcon from '../../assets/icon/icon-profile.png'
import casinoIcon from '../../assets/icon/icon-casinoColor.png'
import { useSelector } from 'react-redux';

function Footer({ activeTab, setActiveTab , menuOpen, setMenuOpen, profileOpen,setProfileOpen }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const isItemActive = (item) => {
        if (!item.path) return false;
        if (activeTab === item.path) return true;
        if (item.path === "/") {
            return location.pathname === "/" || location.pathname === "/home";
        }
        return location.pathname.startsWith(item.path);
    };
    const items = [
        { label: "Menu", icon: menuIcon },
        { label: "Casino", icon: casinoIcon, path: "/casino/casino/all" },
        { label: "Home", path: "/", homeIcon: true },
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
                                ${isItemActive(item) ? 'text-[#19A044]' : 'text-gray-400'}
                            `}
                        >
                            {item.homeIcon ? (
                                <HiHome className="h-8 w-8" aria-hidden />
                            ) : (
                                <img src={item.icon} alt="" className="h-8" />
                            )}
                            <span className='text-[13px] font-semibold'>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sliding Menu */}
            <div
                className={`fixed top-[65px] left-0 h-[calc(100vh-145px)] w-full bg-[#141515] z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar
                ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {menuOpen ? <MobNavbar closeMenu={() => setMenuOpen(false)} /> : null}
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