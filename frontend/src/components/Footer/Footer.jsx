import React, { useEffect } from 'react';
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
import { useTranslation } from '../../i18n/LanguageContext';
import LanguageSwitcher from '../../i18n/LanguageSwitcher';

function Footer({ activeTab, setActiveTab , menuOpen, setMenuOpen, profileOpen,setProfileOpen, closeHeaderActions = () => {} }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const { t } = useTranslation();

    const isItemActive = (item) => {
        if (!item.path) return false;
        if (activeTab === item.path) return true;
        if (item.path === "/") {
            return location.pathname === "/" || location.pathname === "/home";
        }
        return location.pathname.startsWith(item.path);
    };
    const items = [
        { id: 'menu', label: t('nav.menu'), icon: menuIcon },
        { id: 'casino', label: t('nav.casino'), icon: casinoIcon, path: "/casino/casino/all" },
        { id: 'home', label: t('nav.home'), path: "/", homeIcon: true },
        { id: 'mybets', label: t('nav.myBets'), icon: depositIcon, path: "/mybets" },
        ...(user ? [{ id: 'profile', label: t('nav.profile'), icon: profileIcon }] : [])
    ];

    useEffect(() => {
        setMenuOpen(false);
        setProfileOpen(false);
        closeHeaderActions();
    }, [location.pathname]);

    const openMenu = () => {
        closeHeaderActions();
        setMenuOpen((prev) => !prev);
        setProfileOpen(false);
    };

    const openProfile = () => {
        closeHeaderActions();
        setProfileOpen((prev) => !prev);
        setMenuOpen(false);
    };

    return (
        <>
            {/* Footer */}
            <div className='fixed bottom-0 w-full z-10 bg-[#141515]'>
                <div className="h-20 w-full flex justify-around items-center">
                    {items.map(item => (
                        <div
                            key={item.id}
                            onClick={() => {
                                if (item.id === "menu") {
                                    openMenu();
                                } else if (item.id === "profile") {
                                    openProfile();
                                } else {
                                    setActiveTab(item.path);
                                    navigate(item.path);
                                    setMenuOpen(false);
                                    setProfileOpen(false);
                                    closeHeaderActions();
                                }
                            }}
                            className={`flex flex-col justify-center items-center cursor-pointer
                                ${item.id === "menu" && menuOpen ? 'text-[#19A044]' : item.id === "profile" && profileOpen ? 'text-[#19A044]' : isItemActive(item) ? 'text-[#19A044]' : 'text-gray-400'}
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

            {/* Backdrop — tap outside to close menu */}
            {menuOpen ? (
                <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 top-[65px] bottom-20 bg-black/60 z-20 md:hidden border-0 p-0 cursor-default"
                    onClick={() => setMenuOpen(false)}
                />
            ) : null}

            {/* Sliding Menu */}
            <div
                className={`fixed top-[65px] left-0 bottom-20 w-full max-w-[300px] bg-[#141515] z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar shadow-xl border-r border-gray-700
                ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {menuOpen ? <MobNavbar closeMenu={() => setMenuOpen(false)} /> : null}
            </div>
                
            {/* Backdrop — tap to close profile */}
            {profileOpen ? (
                <button
                    type="button"
                    aria-label="Close profile"
                    className="fixed inset-0 top-[65px] bottom-20 bg-black/60 z-20 md:hidden border-0 p-0 cursor-default"
                    onClick={() => setProfileOpen(false)}
                />
            ) : null}

             {/* Profile bottom sheet */}
            <div
                className={`fixed left-0 right-0 bottom-20 z-30 max-h-[min(75vh,calc(100vh-145px))] rounded-t-2xl bg-[#141515] border-t border-gray-700 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar md:hidden
                ${profileOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}
            >
                {profileOpen ? <MyProfile setProfileOpen={setProfileOpen} /> : null}
            </div>
        </>
    );
}

export default Footer;