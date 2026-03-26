import React from 'react';
import { useNavigate } from 'react-router-dom';
import banner1 from '../../assets/mainhome/banner1.webp';
import banner2 from '../../assets/mainhome/banner2.webp';
import banner3 from '../../assets/mainhome/banner3.webp';
import banner4 from '../../assets/mainhome/banner4.webp';

const bannerImages = {
  All: banner1,
  Cricket: banner2,
  Soccer: banner3,
  Tennis: banner4
};

function Today({ data }) {
  const navigate = useNavigate();

  const banners = [
    { name: "All", total: data.all.length },
    { name: "Cricket", total: data.cricket.length },
    { name: "Soccer", total: data.soccer.length },
    { name: "Tennis", total: data.tennis.length },
  ];

  return (
    <div>
      {banners.map((banner) => (
        <div
          key={banner.name}
          className="w-full h-30 bg-cover bg-center rounded-xl mb-3 relative overflow-hidden shadow-2xl"
          style={{ backgroundImage: `url(${bannerImages[banner.name]})` }}
          onClick={() =>
            navigate('/sports', { state: { filter: banner.name, active: "Today" } })
          }
        >
          <div className="flex flex-col p-3">
            <span className="text-[17px] font-semibold">{banner.name}</span>
            <span className="text-[40px] font-bold">{banner.total}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Today;
