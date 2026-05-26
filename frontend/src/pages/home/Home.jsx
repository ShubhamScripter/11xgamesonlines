import React, { useState } from "react";
import Slider from "../../components/slider/Slider";
import Category from "../../components/category/Category";
import Navbar from "../../components/Header/Navbar";
import Popular from "../../components/casinocomp/popular/Popular";
import Slot from "../../components/casinocomp/gameType/Slot";
import Table from "../../components/casinocomp/gameType/Table";
import Casino from "../../components/casinocomp/gameType/Casino";
import Crash from "../../components/casinocomp/gameType/Crash";
import Arcade from "../../components/casinocomp/gameType/Arcade";
import Fishing from "../../components/casinocomp/gameType/Fishing";
import Lottery from "../../components/casinocomp/gameType/Lottery";
import SportsBetting from "../../components/casinocomp/gameType/SportsBetting";
import Sports from "../../components/sports/Sports";
import ExclusiveGames from "../../components/casinocomp/exclusive/ExclusiveGames";

function Home() {
  const [selected, setSelected] = useState("Popular");

  let content;

  if (selected === "Popular") {
    content = <Popular />;
  } else if (selected === "Sports") {
    content = <SportsBetting />;
  } else if (selected === "Crash") {
    content = <Crash />;
  } else if (selected === "Table") {
    content = <Table />;
  } else if (selected === "Slot") {
    content = <Slot />;
  } else if (selected === "Fishing") {
    content = <Fishing />;
  } else if (selected === "Casino") {
    content = <Casino />;
  } else if (selected === "Arcade") {
    content = <Arcade />;
  } else if (selected === "Lottery") {
    content = <Lottery />;
  } else {
    content = (
      <div className="p-4 text-gray-400 bg-[#141515]">No Games for {selected}</div>
    );
  }

  return (
    <div className="bg-[#141515] min-h-screen">
      <Slider />
      <Category active={selected} setActive={setSelected} />
      {content}
      <Sports />
      <ExclusiveGames />
    </div>
  );
}

export default Home;
