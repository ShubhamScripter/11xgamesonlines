import React, { useState, useEffect, useMemo } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { getBetHistory } from '../../features/sports/betReducer';

import { MdArrowBackIos } from 'react-icons/md';

import BetCard from '../../components/Bethistory/BetCard';

import BetTypeFilters from '../../components/Bethistory/BetTypeFilters';

import {

  buildBetFilterCounts,

  filterBetsByCategory,

  mapSportsBetForCard,

  sortBetsByTimeDesc,

} from '../../utils/betCategory';
import { useTranslation } from '../../i18n/LanguageContext';



const PAGE_SIZE = 5;

const FETCH_LIMIT = 500;



function CurrentBets() {

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { betHistory, loading, errorMessage } = useSelector((state) => state.bet);

  const [currentPage, setCurrentPage] = useState(1);

  const [typeFilter, setTypeFilter] = useState(['all']);



  const formatDate = (date) => date.toISOString().split('T')[0];



  const fetchBets = () => {

    const end = new Date();

    const start = new Date();

    start.setMonth(end.getMonth() - 3);



    dispatch(

      getBetHistory({

        startDate: formatDate(start),

        endDate: formatDate(end),

        page: 1,

        selectedGame: '',

        selectedVoid: 'unsettle',

        limit: FETCH_LIMIT,

      })

    );

  };



  useEffect(() => {

    fetchBets();

  }, [dispatch]);



  const allBets = useMemo(() => {

    const sports = (betHistory || [])

      .map((b) => mapSportsBetForCard(b, { unsettledOnly: true }))

      .filter(Boolean);

    return sortBetsByTimeDesc(sports);

  }, [betHistory]);



  const filterCounts = useMemo(() => buildBetFilterCounts(allBets), [allBets]);



  const filteredBets = useMemo(

    () => filterBetsByCategory(allBets, typeFilter),

    [allBets, typeFilter]

  );



  useEffect(() => {

    setCurrentPage(1);

  }, [typeFilter, filteredBets.length]);



  const totalPages = Math.max(1, Math.ceil(filteredBets.length / PAGE_SIZE));

  const paginatedBets = useMemo(() => {

    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredBets.slice(start, start + PAGE_SIZE);

  }, [filteredBets, currentPage]);



  return (

    <div className="bg-[#141515] text-white space-y-3 px-4 md:w-[50%] mx-auto md:mt-12 w-full min-w-0 pb-8">

      <div className="bg-[#000] h-10 flex items-center gap-2">

        <button type="button" onClick={() => window.history.back()} aria-label="Go back">

          <MdArrowBackIos className="text-white text-md font-semibold" />

        </button>

        <span className="text-[18px] font-bold">{t('page.currentBet')}</span>

      </div>



      <BetTypeFilters value={typeFilter} onChange={setTypeFilter} counts={filterCounts} />



      <div>

        {loading ? (

          <div className="flex justify-center items-center h-40">

            <div className="text-sm font-semibold text-gray-400">{t('page.loadingCurrentBets')}</div>

          </div>

        ) : errorMessage ? (

          <div className="flex justify-center items-center h-40">

            <div className="text-sm font-semibold text-red-400">{t('common.error', { message: errorMessage })}</div>

          </div>

        ) : (

          <>

            <BetCard data={paginatedBets} compact />



            {filteredBets.length > 0 && (

              <div className="flex flex-wrap justify-center items-center gap-3 mt-4 text-sm text-gray-300">

                <button

                  type="button"

                  disabled={currentPage <= 1}

                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}

                  className="px-3 py-1.5 border border-gray-600 rounded bg-[#262c32] disabled:opacity-40 disabled:cursor-not-allowed"

                >

                  {t('common.previous')}

                </button>

                <span>

                  {t('common.pageBets', { current: currentPage, total: totalPages, count: filteredBets.length })}

                </span>

                <button

                  type="button"

                  disabled={currentPage >= totalPages}

                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}

                  className="px-3 py-1.5 border border-gray-600 rounded bg-[#262c32] disabled:opacity-40 disabled:cursor-not-allowed"

                >

                  {t('common.next')}

                </button>

              </div>

            )}

          </>

        )}

      </div>

    </div>

  );

}



export default CurrentBets;

