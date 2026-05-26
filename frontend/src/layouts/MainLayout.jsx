import React, { useRef, useState } from 'react';
import HeaderLogin from '../components/Header/HeaderLogin';
import Navbar from '../components/Header/Navbar';
import MobNavbar from '../components/Header/MobNavbar';
import Footer from '../components/Footer/Footer';
import SiteFooter from '../components/Footer/SiteFooter';
import ScrollToTop from '../components/ScrollToTop';
import { Outlet } from 'react-router-dom';

function MainLayout() {
  const mainScrollRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  return (
    <>
      <HeaderLogin setSidebarOpen={setSidebarOpen} closeMenu={() => setMenuOpen(false)}/>
      <div className='flex mt-[65px] h-[calc(100vh-65px)]'>
        <div className='hidden md:block'>
          <Navbar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen} 
          />
        </div>
        <section
          ref={mainScrollRef}
          className="h-[calc(100vh-65px)] overflow-y-auto bg-[#141515] flex-1 no-scrollbar"
        >
          <ScrollToTop scrollContainerRef={mainScrollRef} />
          <div className={`mx-auto ${sidebarOpen ? 'flex-1' : 'md:w-[80%]'}`}>
            <Outlet/>
            <SiteFooter />
          </div>
        </section>
      </div>
      <div className='block md:hidden'>
        <Footer
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
        />
      </div>
    </>
  );
}

export default MainLayout;
