import React, { useEffect, useMemo } from 'react'
import { MdArrowCircleUp, MdArrowForwardIos } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSoccerData } from "../../features/sports/soccerSlice";

function Soccer({ selected, setSelected }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const matches = useSelector((s) => s.soccer?.soccerData || []);

  useEffect(() => {
    dispatch(fetchSoccerData());
  }, [dispatch]);

  const leagues = useMemo(() => {
    const map = new Map();
    for (const m of Array.isArray(matches) ? matches : []) {
      const key = (m?.title || m?.cname || "Unknown League").toString().trim() || "Unknown League";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    }
    return [...map.entries()]
      .map(([title, items]) => ({ title, matches: items }))
      .sort((a, b) => b.matches.length - a.matches.length);
  }, [matches]);

  if (selected) {
    const selectedLeague = leagues.find((l) => l.title === selected);
    const list = selectedLeague?.matches || [];
    return (
      <div className="bg-[#f0f8ff] min-h-screen">
        <div className="p-4">
          <button
            className="mb-4 px-4 py-2 bg-[#19A044] text-white rounded"
            onClick={() => setSelected(null)}
          >
            Back
          </button>
          <h3 className="text-xl font-semibold">{selected}</h3>
        </div>
        <div className="p-2 flex flex-col gap-1">
          {list.length === 0 ? (
            <div className="bg-white p-4 rounded-lg text-center">No matches</div>
          ) : (
            list.map((m, idx) => (
              <div
                key={`${m.id}_${idx}`}
                className="flex flex-col bg-white p-4 rounded-xl"
                onClick={() =>
                  navigate(`/sports/soccer/${encodeURIComponent(m.match)}/${m.id}`)
                }
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
    );
  }

  return (
    <div className="bg-[#f0f8ff] min-h-[80vh]">
      <div className="p-4 flex flex-col gap-1">
        <h3 className="text-xl font-semibold mb-2">Popular</h3>
        {leagues.length === 0 ? (
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            No Event
          </div>
        ) : (
          leagues.map((l) => (
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
          ))
        )}
      </div>
    </div>
  );
}

export default Soccer