import React, { useState } from "react";
import Header from "../../components/Header/Header";
import HeaderLogin from "../../components/Header/HeaderLogin";
import Slider from "../../components/slider/Slider";
import Category from "../../components/category/Category";
import Main from "../../components/Homemain/Main";
import Live from "../../components/Homelive/Live";
import Tables from "../../components/Hometable/Hometable";
import Slot from "../../components/HomeSlot/HomeSlot";
import Fishing from "../../components/HomeFishing/HomeFishing";
import Egame from "../../components/HomeEgame/Homeegame";
import { useSelector } from "react-redux";

function Home() {
  const [activeCategory, setActiveCategory] = useState("Sports");
  const { user } = useSelector((state) => state.auth);

  let content;
  if (activeCategory === "Sports") {
    content = <Main />;
  } else if (activeCategory === "Live") {
    content = <Live />;
  } else if (activeCategory === "Table") {
    content = <Tables />;
  } else if (activeCategory === "Slot") {
    content = <Slot />;
  } else if (activeCategory === "Fishing") {
    content = <Fishing />;
  } else if (activeCategory === "Egame") {
    content = <Egame />;
  } else {
    content = <div className="p-4">No component for {activeCategory}</div>;
  }

  return (
    <div>
      {user ? <HeaderLogin /> : <Header />}
      <Slider />
      <Category active={activeCategory} setActive={setActiveCategory} />
      {content}
    </div>
  );
}

export default Home;
