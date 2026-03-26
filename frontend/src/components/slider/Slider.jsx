import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
// import "swiper/css/navigation";
import Img1 from "../../assets/sliderimg/img1.png";
import Img2 from "../../assets/sliderimg/img2.png";
import Img3 from "../../assets/sliderimg/img3.jpeg";
import Img4 from "../../assets/sliderimg/img4.png";
import Img5 from "../../assets/sliderimg/img5.png";
import Img6 from "../../assets/sliderimg/img6.png";
const images = [
  Img1,
  Img2,
  Img3,
  Img4,
  Img5,
  Img6
];

function Slider() {
  return (
    <div className="w-full max-w-3xl ">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        navigation
        loop
      >
        {images.map((src, idx) => (
          <SwiperSlide key={idx}>
            <img src={src} alt={`Slide ${idx}`} className="w-full h-30 object-cover" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default Slider