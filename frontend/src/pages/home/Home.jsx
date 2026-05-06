import React, { useState } from "react";
import Header from "../../components/Header/Header";
import HeaderLogin from "../../components/Header/HeaderLogin";
import Slider from "../../components/slider/Slider";
import Category from "../../components/category/Category";
import Main from "../../components/Homemain/Main";
import Navbar from "../../components/Header/Navbar";
import { useSelector } from "react-redux";
import Egame from '../../components/casinocomp/egame/Egame';
import Fishing from '../../components/casinocomp/gameType/Fishing';
import Live from '../../components/casinocomp/live/Live';
import Popular from "../../components/casinocomp/popular/Popular";
import Slot from "../../components/casinocomp/gameType/Slot";
import Table from '../../components/casinocomp/gameType/Table';
import Casino from "../../components/casinocomp/gameType/Casino";
import Crash from "../../components/casinocomp/gameType/Crash";
import Arcade from "../../components/casinocomp/gameType/Arcade";


function Home() {
  const [selected, setSelected] = useState('Casino');

  let content;
  
  if (selected === 'Popular') {
    content = <Popular/>;
  } else if (selected === 'Crash') {
    content = <Crash/>;
  } else if (selected === 'Table') {
    content = <Table/>;
  } else if (selected === 'Slot') {
    content = <Slot/>;
  } else if (selected === 'Fishing') {
    content = <Fishing/>;
  } else if (selected === 'Casino') {
    content = <Casino/>;
  } else if (selected === 'Arcade') {
    content = <Arcade/>;
  } else {
    content = <div className="p-4 text-white">No Games for {selected}</div>;
  }

  return (
    <div>
      <Slider/>
      <Category active={selected} setActive={setSelected}/>
      {content}
    </div>
  );
}

export default Home;
