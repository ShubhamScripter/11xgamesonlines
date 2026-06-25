import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import HeaderLogin from '../components/Header/HeaderLogin';
import Navbar from '../components/Header/Navbar';
import MobNavbar from '../components/Header/MobNavbar';
import Footer from '../components/Footer/Footer';
import SiteFooter from '../components/Footer/SiteFooter';
import ScrollToTop from '../components/ScrollToTop';
import {
  isHomePath,
  prefetchSportsListings,
} from '../utils/prefetchSportsListings';
import { hydrateHomeSportsFromCache } from '../utils/homeSportsHydrate';
import { useSportsOddsRefresh } from '../hooks/useSportsOddsRefresh';
import { useListOddsSocket } from '../hooks/useListOddsSocket';

function MainLayout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const mainScrollRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [headerActionsOpen, setHeaderActionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  // Homepage: hydrate session cache, then refresh list + odds from API.
  useLayoutEffect(() => {
    if (isHomePath(location.pathname)) {
      hydrateHomeSportsFromCache(dispatch);
      prefetchSportsListings(dispatch, {
        withOdds: true,
        oddsScope: 'eligible',
      });
    }
  }, [dispatch, location.pathname]);

  const pollSports = useMemo(() => {
    const path = (location.pathname || '/').toLowerCase();
    if (isHomePath(path)) return ['cricket', 'soccer', 'tennis'];
    if (path.startsWith('/cricket')) return ['cricket'];
    if (path.startsWith('/football')) return ['soccer'];
    if (path.startsWith('/tennis')) return ['tennis'];
    return [];
  }, [location.pathname]);

  const oddsScope = useMemo(() => {
    const path = (location.pathname || '').toLowerCase();
    if (
      path.startsWith('/cricket') ||
      path.startsWith('/football') ||
      path.startsWith('/tennis')
    ) {
      return 'all';
    }
    return 'eligible';
  }, [location.pathname]);

  useSportsOddsRefresh(pollSports, oddsScope, {
    skipInitial: isHomePath(location.pathname),
  });

  useListOddsSocket(pollSports);

  return (
    <>
      <HeaderLogin
        setSidebarOpen={setSidebarOpen}
        closeMenu={() => setMenuOpen(false)}
        showActions={headerActionsOpen}
        setShowActions={setHeaderActionsOpen}
      />
      <div className='flex mt-[65px] h-[calc(100vh-65px)]'>
        <div className='hidden md:block'>
          <Navbar 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen} 
          />
        </div>
        <section
          ref={mainScrollRef}
          className={`h-[calc(100vh-65px)] overflow-y-auto bg-[#141515] flex-1 no-scrollbar transition-[padding] duration-200 ${
            headerActionsOpen ? 'max-md:pt-[5.75rem]' : ''
          }`}
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
          closeHeaderActions={() => setHeaderActionsOpen(false)}
        />
      </div>
    </>
  );
}

export default MainLayout;
