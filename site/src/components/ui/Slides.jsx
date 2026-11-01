import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import kyiv from '../../assets/Kyiv.webp';
import lakePragsItaly from '../../assets/LakePragsItaly.webp';
import london from '../../assets/london.webp';
import newYorkCity from '../../assets/NewYorkCity.webp';
import norway from '../../assets/Norway.webp';
import paris from '../../assets/paris.webp';
import japan from '../../assets/Japan.webp';
import greece from '../../assets/Greece.webp';
import bali from '../../assets/Bali.webp';
import '../../App.css'

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay'; 

const Slides = () => {
  return (
    <>
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={0}
      slidesPerView={1}
      navigation
      pagination={{
        clickable: true,
      }}
      autoplay={{
        delay: 3000, 
        disableOnInteraction: false, 
      }}
      loop={true}
      className='slides-container -z-10 h-[30vh] lg:h-full'
    >
      <SwiperSlide>
        <div className="relative">
          <img className="w-full h-[30vh] lg:h-[50vh] object-cover" src={kyiv} alt="Kyiv" fetchPriority="high" decoding="async" />
          <div className="absolute top-0 left-0 w-full h-full bg-[black] bg-opacity-50 flex items-center justify-center text-[#f1e8e6] text-xl lg:text-3xl font-bold">
            Відкрийте для себе Київ
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="relative">
          <img className="w-full h-[30vh] lg:h-[50vh] object-cover" src={lakePragsItaly} alt="Lake Prags Italy" loading="lazy" decoding="async" />
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center text-[#f1e8e6] text-xl lg:text-3xl font-bold">
            Відкрийте для себе озеро Прагс в Італії
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="relative">
          <img className="w-full h-[30vh] lg:h-[50vh] object-cover" src={london} alt="London" loading="lazy" decoding="async" />
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center text-[#f1e8e6] text-xl lg:text-3xl font-bold">
            Лондон — місто контрастів
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="relative">
          <img className="w-full h-[30vh] lg:h-[50vh] object-cover" src={newYorkCity} alt="New York City" loading="lazy" decoding="async" />
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center text-[#f1e8e6] text-xl lg:text-3xl font-bold">
            Нью-Йорк — місто, яке ніколи не спить
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="relative">
          <img className="w-full h-[30vh] lg:h-[50vh] object-cover" src={norway} alt="Norway" loading="lazy" decoding="async" />
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center text-[#f1e8e6] text-xl lg:text-3xl font-bold">
            Норвегія — природа в найкращому вигляді
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="relative">
          <img className="w-full h-[30vh] lg:h-[50vh] object-cover" src={paris} alt="Paris" loading="lazy" decoding="async" />
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center text-[#f1e8e6] text-xl lg:text-3xl font-bold">
          Париж — місто вогнів і мистецтва
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="relative">
          <img className="w-full h-[30vh] lg:h-[50vh] object-cover" src={japan} alt="Japan" loading="lazy" decoding="async" />
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center text-[#f1e8e6] text-xl lg:text-3xl font-bold">
            Японія — країна традицій і технологій
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="relative">
          <img className="w-full h-[30vh] lg:h-[50vh] object-cover" src={greece} alt="Greece" loading="lazy" decoding="async" />
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center text-[#f1e8e6] text-xl lg:text-3xl font-bold">
            Греція — стародавня культура
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="relative">
          <img className="w-full h-[30vh] lg:h-[50vh] object-cover" src={bali} alt="Bali" loading="lazy" decoding="async" />
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center text-[#f1e8e6] text-xl lg:text-3xl font-bold">
            Балі — рай для мандрівників
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
    </>
  );
};


export default Slides;
