import React from 'react';
import SlickSlider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Img1 from "../../assets/sliderimg/image_241615.jpg";
import Img2 from "../../assets/sliderimg/image_241703.jpg";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';

const banner = [
  Img1,
  Img2
];
const Slider = ({sidebarOpen}) =>{
   const PrevArrow = ({ onClick }) => {
    return (
      <div
        className={`absolute  ${sidebarOpen ? "left-[4%]":"left-[10%]"} top-1/2 z-1 transform -translate-y-1/2 bg-gray-800 text-white w-8 h-8 flex justify-center items-center rounded-[3px] cursor-pointer`}
        onClick={onClick}
      >
        <MdKeyboardArrowLeft size={22}/>
      </div>
    );
  };
  const NextArrow = ({ onClick }) => {
    return (
      <div
        className={`absolute ${sidebarOpen ? "right-[4%]":"right-[10%]"} top-1/2 transform -translate-y-1/2 bg-gray-800 text-white w-8 h-8 flex justify-center items-center rounded-[3px] cursor-pointer`}
        onClick={onClick}
      >
        <MdKeyboardArrowRight size={22}/>
      </div>
    );
  };
 
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true, 
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div className="w-full">
      <SlickSlider {...sliderSettings}>
        {banner.map((item, i) => (
          <img key={i} src={item} alt="banner" className="object-cover h-[200px] w-full block" />
        ))}
      </SlickSlider>
    </div>
  )
}

export default Slider;