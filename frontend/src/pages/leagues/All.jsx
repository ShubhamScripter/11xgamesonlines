import React, { useEffect, useMemo } from 'react'
import { MdArrowCircleUp } from "react-icons/md";
import { MdArrowForwardIos } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { fetchCricketData } from "../../features/sports/cricketSlice";
import { fetchSoccerData } from "../../features/sports/soccerSlice";
import { fetchTennisData } from "../../features/sports/tennisSlice";

const sportRouteFor = (sport) => {
  if (sport === "cricket") return (m) => `/sports/fullmarket/${encodeURIComponent(m.match)}/${m.id}`;
  if (sport === "soccer") return (m) => `/sports/soccer/${encodeURIComponent(m.match)}/${m.id}`;
  if (sport === "tennis") return (m) => `/sports/tennis/${encodeURIComponent(m.match)}/${m.id}`;
  return (m) => `/sports/fullmarket/${encodeURIComponent(m.match)}/${m.id}`;
};

function All({ selected, setSelected }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cricket = useSelector((s) => s.cricket?.matches || []);
    const soccer = useSelector((s) => s.soccer?.soccerData || []);
    const tennis = useSelector((s) => s.tennis?.data || []);

    useEffect(() => {
      // Ensure we have data loaded
      dispatch(fetchCricketData());
      dispatch(fetchSoccerData());
      dispatch(fetchTennisData());
    }, [dispatch]);

    const allMatches = useMemo(() => {
      const tag = (arr, sport) =>
        (Array.isArray(arr) ? arr : []).map((m) => ({ ...m, __sport: sport }));
      return [...tag(cricket, "cricket"), ...tag(soccer, "soccer"), ...tag(tennis, "tennis")];
    }, [cricket, soccer, tennis]);

    const leagues = useMemo(() => {
      const map = new Map();
      for (const m of allMatches) {
        const key = (m?.title || m?.cname || "Unknown League").toString().trim() || "Unknown League";
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(m);
      }
      // Sort by matches count desc
      return [...map.entries()]
        .map(([title, matches]) => ({ title, matches }))
        .sort((a, b) => b.matches.length - a.matches.length);
    }, [allMatches]);

    if (selected) {
      const selectedLeague = leagues.find((l) => l.title === selected);
      const matches = selectedLeague?.matches || [];
    return (
      <div>
        {/* <div className='bg-[#333] w-full h-16 flex items-center gap-2 p-2'>
            <div><IoArrowUndo className='text-2xl text-white'/></div>
            <h3 className='text-xl font-semibold mb-2 text-white'>{selected} Matches</h3>
        </div> */}
        <div className='bg-[#f0f8ff] min-h-screen'>
        <div className='p-4'>
            <button
          className="mb-4 px-4 py-2 bg-[#19A044] text-white rounded"
          onClick={() => setSelected(null)}
        >
          Back
        </button>
        <h3 className='text-xl font-semibold'>{selected}</h3>
        </div>
        <div className='bg-[#f0f8ff]'>
        <div className='p-2 flex flex-col gap-1'>
            {matches.length === 0 ? (
              <div className="bg-white p-4 rounded-lg text-center">No matches</div>
            ) : (
              matches.map((m, idx) => (
                <div
                  key={`${m.__sport}_${m.id}_${idx}`}
                  className="flex flex-col bg-white p-4 rounded-xl"
                  onClick={() => {
                    const to = sportRouteFor(m.__sport);
                    navigate(to(m));
                  }}
                >
                  <span className="text-xs bg-[#e2eaef] w-fit pl-2 pr-2">
                    {m.date || "-"} &nbsp; Matched{m.matched ?? 0}
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="md:text-xl">{m.match}</span>
                    <MdArrowForwardIos />
                  </div>
                </div>
              ))
            )}
        </div>
    </div>
      </div>
      </div>
    );
  }
  return (
    <div className='bg-[#f0f8ff] min-h-[80vh]'>
        <div className='p-4 flex flex-col gap-1'>
            <h3 className='text-xl font-semibold mb-2'>Popular</h3>
            {leagues.map((l) => (
              <div
                key={l.title}
                className="flex items-center justify-between bg-white p-4 rounded-xl"
                onClick={() => setSelected(l.title)}
              >
                <div className="flex justify-center items-center gap-2">
                  <MdArrowCircleUp className="text-2xl" />
                  <span className="md:text-xl">{l.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-[#e2eaef] px-2 py-1 rounded">
                    {l.matches.length}
                  </span>
                  <MdArrowForwardIos />
                </div>
              </div>
            ))}
        </div>
    </div>
  )
}

export default All