import React from 'react';
import SlickSlider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Img1 from '../../assets/sliderimg/image_241615.jpg';
import Img2 from '../../assets/sliderimg/image_241703.jpg';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import './Slider.css';

const banner = [Img1, Img2];

const Slider = () => {
  const PrevArrow = ({ onClick }) => (
    <button
      type="button"
      aria-label="Previous slide"
      className="home-slider-arrow home-slider-arrow--prev"
      onClick={onClick}
    >
      <MdKeyboardArrowLeft size={22} />
    </button>
  );

  const NextArrow = ({ onClick }) => (
    <button
      type="button"
      aria-label="Next slide"
      className="home-slider-arrow home-slider-arrow--next"
      onClick={onClick}
    >
      <MdKeyboardArrowRight size={22} />
    </button>
  );

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
    <div className="home-slider">
      <SlickSlider {...sliderSettings}>
        {banner.map((item, i) => (
          <div key={i} className="home-slider-slide">
            <img
              src={item}
              alt=""
              className="home-slider-image"
              draggable={false}
            />
          </div>
        ))}
      </SlickSlider>
    </div>
  );
};

export default Slider;
