import React, { useEffect, useMemo, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { MdArrowBackIos } from 'react-icons/md';

import BetCard from '../../components/Bethistory/BetCard';

import BetTypeFilters from '../../components/Bethistory/BetTypeFilters';

import { getBetHistory } from '../../features/sports/betReducer';

import api from '../../utils/axiosConfig';

import {
  buildBetFilterCounts,
  filterBetsByCategory,
  mapCasinoBetForCard,
  mapSportsBetForCard,
  sortBetsByTimeDesc,
} from '../../utils/betCategory';



const PAGE_SIZE = 5;

const FETCH_LIMIT = 500;



function BetHistory() {

  const dispatch = useDispatch();

  const { betHistory, loading, errorMessage } = useSelector((state) => state.bet);

  const { user } = useSelector((state) => state.auth);



  const [currentPage, setCurrentPage] = useState(1);

  const [casinoBets, setCasinoBets] = useState([]);

  const [casinoLoading, setCasinoLoading] = useState(false);

  const [typeFilter, setTypeFilter] = useState(['all']);



  const fetchSportsBets = () => {

    const endDateStr = new Date().toISOString().split('T')[0];

    const startDateStr = new Date(new Date().setDate(new Date().getDate() - 30))

      .toISOString()

      .split('T')[0];



    dispatch(

      getBetHistory({

        startDate: startDateStr,

        endDate: endDateStr,

        page: 1,

        selectedGame: '',

        selectedVoid: 'settel',

        limit: FETCH_LIMIT,

      })

    );

  };



  useEffect(() => {

    fetchSportsBets();

  }, [dispatch]);



  useEffect(() => {

    const fetchCasinoBets = async () => {

      try {

        const userId = user?._id || user?.id;

        if (!userId) return;

        setCasinoLoading(true);

        const response = await api.get(

          `/casino/bet-history/${userId}?page=1&limit=${FETCH_LIMIT}`,

          { withCredentials: true }

        );

        setCasinoBets(response?.data?.data || []);

      } catch (error) {

        console.error('Error fetching casino bet history:', error);

        setCasinoBets([]);

      } finally {

        setCasinoLoading(false);

      }

    };

    fetchCasinoBets();

  }, [user]);



  const allBets = useMemo(() => {

    const sports = (betHistory || [])

      .map((b) => mapSportsBetForCard(b))

      .filter(Boolean);

    const casino = (casinoBets || [])

      .map((b, idx) => mapCasinoBetForCard(b, idx))

      .filter(Boolean);

    return sortBetsByTimeDesc([...sports, ...casino]);

  }, [betHistory, casinoBets]);



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



  const isLoading = loading || casinoLoading;



  return (

    <div className="bg-[#141515] text-white space-y-3 px-4 md:w-[50%] mx-auto md:mt-12 w-full pb-24">

      <div className="bg-[#000] h-10 flex items-center">

        <div onClick={() => window.history.back()}>

          <MdArrowBackIos className="text-white text-md font-semibold" />

        </div>

        <span className="text-[18px] font-bold">My Bets</span>

      </div>



      <BetTypeFilters value={typeFilter} onChange={setTypeFilter} counts={filterCounts} />



      <div>

        {isLoading ? (

          <div className="flex justify-center items-center h-64">

            <div className="text-lg font-semibold text-gray-600">Loading bet history...</div>

          </div>

        ) : errorMessage ? (

          <div className="flex justify-center items-center h-64">

            <div className="text-lg font-semibold text-red-600">Error: {errorMessage}</div>

          </div>

        ) : (

          <>

            <BetCard data={paginatedBets} compact />

            {filteredBets.length > 0 && (

              <div className="flex flex-wrap justify-center items-center gap-3 mt-4 text-sm text-gray-300">

                <button

                  type="button"

                  disabled={currentPage <= 1}

                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}

                  className="px-3 py-1.5 border border-gray-600 rounded bg-[#262c32] disabled:opacity-40 disabled:cursor-not-allowed"

                >

                  Previous

                </button>

                <span>

                  Page {currentPage} of {totalPages} · {filteredBets.length} bets

                </span>

                <button

                  type="button"

                  disabled={currentPage >= totalPages}

                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}

                  className="px-3 py-1.5 border border-gray-600 rounded bg-[#262c32] disabled:opacity-40 disabled:cursor-not-allowed"

                >

                  Next

                </button>

              </div>

            )}

          </>

        )}

      </div>

    </div>

  );

}



export default BetHistory;

