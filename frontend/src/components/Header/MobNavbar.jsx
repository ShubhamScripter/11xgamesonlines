import React, { useEffect, useState } from 'react';
import { IoClose } from "react-icons/io5";
import { HiOutlineChevronRight } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../features/auth/authSlice';
import { fetchCricketData } from '../../features/sports/cricketSlice';
import { fetchSoccerData } from '../../features/sports/soccerSlice';
import { fetchTennisData } from '../../features/sports/tennisSlice';
import { isMatchInPlay } from '../../utils/sportMatchFilters';
import { useUserNavMenu, translateSubItemLabel } from '../../i18n/useUserNavMenu.jsx';
import { useTranslation } from '../../i18n/LanguageContext';

function MobNavbar({ closeMenu }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { currentBetCount } = useSelector((state) => state.bet);
  const { matches: cricketMatches } = useSelector((state) => state.cricket);
  const { soccerData: soccerMatches } = useSelector((state) => state.soccer);
  const { data: tennisMatches } = useSelector((state) => state.tennis);

  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    if (!Array.isArray(cricketMatches) || cricketMatches.length === 0) {
      dispatch(fetchCricketData({ withOdds: true, oddsScope: "eligible" }));
    }
    if (!Array.isArray(soccerMatches) || soccerMatches.length === 0) {
      dispatch(fetchSoccerData({ withOdds: true, oddsScope: "eligible" }));
    }
    if (!Array.isArray(tennisMatches) || tennisMatches.length === 0) {
      dispatch(fetchTennisData({ withOdds: true, oddsScope: "eligible" }));
    }
  }, [dispatch, cricketMatches, soccerMatches, tennisMatches]);

  const cricketInplayCount = Array.isArray(cricketMatches) ? cricketMatches.filter(m => isMatchInPlay(m, 'cricket')).length : 0;
  const soccerInplayCount = Array.isArray(soccerMatches) ? soccerMatches.filter(m => isMatchInPlay(m, 'soccer')).length : 0;
  const tennisInplayCount = Array.isArray(tennisMatches) ? tennisMatches.filter(m => isMatchInPlay(m, 'tennis')).length : 0;

  const data = useUserNavMenu({
    cricketMatches,
    soccerMatches,
    tennisMatches,
    cricketInplayCount,
    soccerInplayCount,
    tennisInplayCount,
    currentBetCount,
  });

  const handleItemClick = async (item, index, subItem = null) => {
    if (item.disabled) {
      return;
    }
    if (subItem) {
      if (item.gameType) {
        navigate(`/casino/${item.gameType}/${subItem}`);
      } else if (item.sportType) {
        if (subItem === "All") {
          navigate(item.sportPath);
        } else {
          navigate(item.sportPath, { state: { selectedLeague: subItem } });
        }
      }
      closeMenu();
      setOpenDropdown(false);
      return;
    }
    if (item.action === "logout") {
      await dispatch(logout());
      dispatch(reset());
      closeMenu();
      // Hard redirect so the router basename resets (drops the "$" prefix).
      window.location.assign("/login");
      return;
    }
    if (item.subItems) {
      setOpenDropdown(openDropdown === index ? null : index);
      return;
    }
    if (item.path) {
      navigate(item.path);
      setOpenDropdown(false);
      closeMenu();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-[#141515]">
        <span className="text-sm font-semibold text-white">{t('nav.menu')}</span>
        <button
          type="button"
          onClick={closeMenu}
          aria-label="Close menu"
          className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#303232] transition-colors"
        >
          <IoClose className="text-2xl" />
        </button>
      </div>
      <ul className="px-5 py-3 space-y-2 flex-1">
        {data.map((item, i) => (
          <React.Fragment key={item.labelKey || i}>
            <li
              className='flex items-center gap-2 py-3'
               onClick={() => handleItemClick(item, i)}
            >
              {typeof item.icon === "string" ? (
                <img src={item.icon} className="h-5 w-5" />
              ) : (
                <div className="text-xl text-green-400">{item.icon}</div>
              )}

              
              <div className="flex items-center gap-2 flex-1 justify-between">
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-gray-500'>
                    {item.label}
                  </span>
                  {/* {item.badge !== undefined && (
                    <span className="bg-green-600 text-white w-5 h-5 text-[12px] flex justify-center items-center rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )} */}
                </div>
                <HiOutlineChevronRight className={`text-lg text-gray-400 transition-all ${openDropdown === i && item.subItems ? "-rotate-90":"rotate-90"}`} />
              </div>
              
              

            </li>
            {openDropdown === i && item.subItems && (
              <ul className="space-y-1">
                {item.subItems.map((sub) => (
                  <li
                    key={`${item.gameType}-${sub}`}
                    className="py-2 px-4 text-sm text-gray-400 cursor-pointer hover:text-white bg-[#222424] capitalize"
                    onClick={() => handleItemClick(item, i, sub)}
                  >
                    {translateSubItemLabel(t, sub)}
                  </li>
                ))}
              </ul>
            )}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
}

export default MobNavbar;
