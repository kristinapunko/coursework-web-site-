import { useEffect, useState } from 'react'
import { TbWorldPin, TbRouteSquare  } from "react-icons/tb";
import { FaKey } from "react-icons/fa";
import img from "../assets/pexels-vince-2265876.webp"
import img2 from "../assets/pexels-eberhardgross-1612461.webp"
import img3 from "../assets/pexels-zachtheshoota-1816237.webp"
import img4 from "../assets/pexels-andreimike-1271619.webp"
import img5 from "../assets/pexels-johnny-song-2150145527-31557251.webp"
import img6 from "../assets/pexels-zachtheshoota-1816237.webp"
import img7 from "../assets/pexels-catiamatos-984888.webp"
import img8 from "../assets/pexels-miyou_-77-696995602-31541968.webp"
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import { FaGlobeEurope, FaUserEdit, FaLightbulb, FaGem, FaLeaf } from 'react-icons/fa';

const WORDS = ["Про нас", "Чому вибирають нас?", "Наші переваги"];

const AboutusPage = () => {
    const [currentText, setCurrentText] = useState('');
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [charIndex, setCharIndex] = useState(0);
  
    useEffect(() => {
      const type = () => {
        const currentWord = WORDS[wordIndex];
        
        if (isDeleting) {
          setCurrentText(currentWord.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
          if (charIndex === 0) {
            setIsDeleting(false);
            setWordIndex((prevIndex) => (prevIndex + 1) % WORDS.length);
          }
        } else {
          setCurrentText(currentWord.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
          if (charIndex === currentWord.length) {
            setIsDeleting(true);
          }
        }
      };
  
      const typingSpeed = 250; // Speed of typing in milliseconds
      const deletingSpeed = 150; // Speed of deleting in milliseconds
  
      const timeout = setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
      return () => clearTimeout(timeout); // Clear timeout on re-render
    }, [currentText, charIndex, isDeleting, wordIndex]);
  
    return (
        <>
<div className="w-[90%] md:w-[80%] mx-auto my-6 relative">
  <div className="absolute inset-0 flex items-center justify-center z-10">
    <h1 className="text-[#f1e8e6] flex justify-center text-center items-center w-full h-full text-4xl md:text-6xl font-bold bg-[#543c52]/40 px-4 md:px-6 py-3 rounded-3xl">
      {currentText}
    </h1>
  </div>

  <div className="flex flex-col md:flex-row justify-center items-center gap-4 z-0">
    {/* Visible only on mobile */}
    <div className="relative w-full max-w-[250px] h-[300px] rounded-xl overflow-hidden mx-auto md:hidden">
      <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
      <div className="absolute inset-0 bg-[#543c52]/30 rounded-xl"></div>
    </div>

    {/* Column 1 */}
    <div className="hidden md:flex flex-col gap-4 my-4 md:my-6">
      <div className="relative w-full max-w-[220px] h-[180px] rounded-xl overflow-hidden mx-auto">
        <img src={img2} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-[#543c52]/30 rounded-xl"></div>
      </div>

      <div className="relative w-full max-w-[220px] h-[260px] rounded-xl overflow-hidden mx-auto">
        <img src={img3} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-[#543c52]/30 rounded-xl"></div>
      </div>
    </div>

    {/* Column 2 */}
    <div className="hidden md:flex flex-col gap-4 my-4 md:my-6">
      <div className="relative w-full max-w-[220px] h-[240px] rounded-xl overflow-hidden mx-auto">
        <img src={img4} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-[#543c52]/30 rounded-xl"></div>
      </div>

      <div className="relative w-full max-w-[220px] h-[160px] rounded-xl overflow-hidden mx-auto">
        <img src={img5} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-[#543c52]/30 rounded-xl"></div>
      </div>
    </div>

    {/* Center image visible only on desktop */}
    <div className="hidden md:block relative w-full max-w-[230px] h-[360px] rounded-xl overflow-hidden my-4 md:my-0 mx-auto">
      <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
      <div className="absolute inset-0 bg-[#543c52]/30 rounded-xl"></div>
    </div>

    {/* Column 3 */}
    <div className="hidden md:flex flex-col gap-4 my-4 md:my-6">
      <div className="relative w-full max-w-[220px] h-[200px] rounded-xl overflow-hidden mx-auto">
        <img src={img6} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-[#543c52]/30 rounded-xl"></div>
      </div>

      <div className="relative w-full max-w-[220px] h-[210px] rounded-xl overflow-hidden mx-auto">
        <img src={img7} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-[#543c52]/30 rounded-xl"></div>
      </div>
    </div>

    {/* Last image */}
    <div className="hidden md:block relative w-full max-w-[250px] h-[380px] rounded-xl overflow-hidden mx-auto my-4 md:my-0">
      <img src={img8} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
      <div className="absolute inset-0 bg-[#543c52]/30 rounded-xl"></div>
    </div>
  </div>
</div>



<div className="md:w-[90%] lg:w-[80%] mx-auto px-4 py-8">
  <h1 className="capitalize text-center text-[#361d32] text-xl lg:text-3xl font-semibold mb-6">
    Наша історія
  </h1>

  <div className=" w-full mx-auto bg-[#f1e8e6] rounded-3xl border border-[#edd2cb] p-6 lg:p-8">
    <p className="text-[#361d32] text-base lg:text-lg mb-8">
      Ми почали з маленької ідеї, яка з часом перетворилася на щось більше. Наша історія — це шлях інновацій, співпраці та прагнення до досконалості. Від перших кроків до значних досягнень, ми пишаємося кожним моментом, який сформував нас такими, якими ми є сьогодні.
    </p>
    <h2 className="text-[#361d32] text-lg lg:text-2xl font-semibold mb-6 text-center">
      Хронологія нашої подорожі
    </h2>
    <div className="relative">

      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-[#361d32] h-full"></div>

      {/* 2018 */}
      <div className="mb-8 flex justify-between items-center w-full md:flex-row-reverse">
        <div className="order-1 w-5/12 hidden md:block"></div>
        <div className="order-1 w-full md:w-5/12 md:px-4">
          <h3 className="text-[#361d32] text-lg font-semibold">2018 — Заснування</h3>
          <p className="text-[#361d32] text-sm lg:text-base">
            Все почалося з мрії та невеликої команди однодумців, які вирішили змінити гру.
          </p>
        </div>
        <div className="hidden md:block order-1 w-8 h-8 bg-[#361d32] rounded-full absolute left-1/2 transform -translate-x-1/2"></div>
      </div>

      {/* 2020 */}
      <div className="mb-8 flex justify-between items-center w-full">
        <div className="order-1 w-5/12 hidden md:block"></div>
        <div className="order-1 w-full md:w-5/12  md:px-4">
          <h3 className="text-[#361d32] text-lg font-semibold">2020 — Перший прорив</h3>
          <p className="text-[#361d32] text-sm lg:text-base">
            Ми запустили наш перший продукт, який отримав визнання клієнтів по всьому світу.
          </p>
        </div>
        <div className="hidden md:block order-1 w-8 h-8 bg-[#361d32] rounded-full absolute left-1/2 transform -translate-x-1/2"></div>
      </div>

      {/* 2023 */}
      <div className="mb-8 flex justify-between items-center w-full md:flex-row-reverse">
        <div className="order-1 w-5/12 hidden md:block"></div>
        <div className="order-1 w-full md:w-5/12  md:px-4">
          <h3 className="text-[#361d32] text-lg font-semibold">2023 — Розширення</h3>
          <p className="text-[#361d32] text-sm lg:text-base">
            Відкриття нових офісів та розширення команди для реалізації амбітних цілей.
          </p>
        </div>
        <div className="hidden md:block order-1 w-8 h-8 bg-[#361d32] rounded-full absolute left-1/2 transform -translate-x-1/2"></div>
      </div>

      {/* 2025 */}
      <div className="mb-8 flex justify-between items-center w-full">
        <div className="order-1 w-5/12 hidden md:block"></div>
        <div className="order-1 w-full md:w-5/12  md:px-4">
          <h3 className="text-[#361d32] text-lg font-semibold">2025 — Сьогодні</h3>
          <p className="text-[#361d32] text-sm lg:text-base">
            Ми продовжуємо зростати, впроваджувати інновації та створювати майбутнє разом із нашими клієнтами.
          </p>
        </div>
        <div className="hidden md:block order-1 w-8 h-8 bg-[#361d32] rounded-full absolute left-1/2 transform -translate-x-1/2"></div>
      </div>
      
    </div>
  </div>
</div>

      <div className="md:w-[80%] mx-auto px-4 ">
      <h1 className="capitalize text-center text-[#361d32] text-xl lg:text-3xl font-semibold mb-6">Наші переваги</h1>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
    
    <div className="bg-[#f1e8e6]/30 bg-white  border border-[#361d32] rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col items-center text-center transition hover:scale-105 duration-300">
      <TbWorldPin className="text-2xl md:text-5xl text-[#543c52] mb-4" />
      <h3 className="text-lg md:text-xl font-semibold text-[#361d32] mb-2">Різноманіття турів</h3>
      <p className="text-[#361d32]/80">
        Ми пропонуємо широкий вибір турів для будь-яких уподобань та бюджетів — від екзотичних мандрів до культурних подорожей історичними містами.
      </p>
    </div>

    <div className="bg-[#f1e8e6]/30 border border-[#361d32] rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center transition hover:scale-105 duration-300">
      <TbRouteSquare className="text-2xl md:text-5xl text-[#543c52] mb-4" />
      <h3 className="text-lg md:text-xl font-semibold text-[#361d32] mb-2">Перевірені маршрути</h3>
      <p className="text-[#361d32]/80">
        Тури до вражаючих локацій — від затишних середземноморських містечок до екзотичних куточків Азії. Усі маршрути перевірені та безпечні.
      </p>
    </div>

    <div className="bg-[#f1e8e6]/30 border border-[#361d32] rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center transition hover:scale-105 duration-300">
      <FaKey className="text-2xl md:text-5xl text-[#543c52] mb-4" />
      <h3 className="text-lg md:text-xl font-semibold text-[#361d32] mb-2">Все включено</h3>
      <p className="text-[#361d32]/80">
        У вартість туру вже входить усе: переліт, трансфер, готель, екскурсії та страхування. Вам залишається лише насолоджуватись відпочинком.
      </p>
    </div>

  </div>
</div>
<h1 className="capitalize text-center text-[#361d32] text-xl lg:text-3xl font-semibold my-6">Чому обирають нас</h1>
<section className="flex justify-center items-center pb-12">
<Swiper
  effect={'coverflow'}
  grabCursor={true}
  centeredSlides={true}
  // slidesPerView={1} // базове значення для мобільних
  coverflowEffect={{
    rotate: 50,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  }}
  pagination={{ clickable: true }}
  modules={[EffectCoverflow, Pagination]}
  className="md:w-[90%] max-w-[1200px]"
  breakpoints={{
    768: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  }}
>
    <SwiperSlide className='px-4'>
      <div className="bg-[#543c52]/30 border border-[#361d32] rounded-3xl p-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#f1e8e6]/50 flex justify-center items-center mb-4">
          <FaGlobeEurope className="text-4xl text-[#543c52]" />
        </div>
        <h3 className="text-xl font-semibold text-[#361d32] mb-2">Наша місія</h3>
        <p className="text-[#361d32]/80">
          Створювати незабутні подорожі, що розширюють горизонти, поєднуючи комфорт з автентичними враженнями.
        </p>
      </div>
    </SwiperSlide>

    <SwiperSlide className='px-4'>
      <div className="bg-[#543c52]/30 border border-[#361d32] rounded-3xl p-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#f1e8e6]/50 flex justify-center items-center mb-4">
          <FaUserEdit className="text-4xl text-[#543c52]" />
        </div>
        <h3 className="text-xl font-semibold text-[#361d32] mb-2">Індивідуальний підхід</h3>
        <p className="text-[#361d32]/80">
          Кожен тур створюється з урахуванням ваших уподобань - від вибору готелю до ексклюзивних екскурсій.
        </p>
      </div>
    </SwiperSlide>

    <SwiperSlide className='px-4'>
      <div className="bg-[#543c52]/30 border border-[#361d32] rounded-3xl p-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#f1e8e6]/50 flex justify-center items-center mb-4">
          <FaLightbulb className="text-4xl text-[#543c52]" />
        </div>
        <h3 className="text-xl font-semibold text-[#361d32] mb-2">Експертні знання</h3>
        <p className="text-[#361d32]/80">
          Наші спеціалісти подорожують особисто, щоб запропонувати вам тільки перевірені маршрути та локації.
        </p>
      </div>
    </SwiperSlide>

    <SwiperSlide className='px-4'>
      <div className="bg-[#543c52]/30 border border-[#361d32] rounded-3xl p-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#f1e8e6]/50 flex justify-center items-center mb-4">
          <FaGem className="text-4xl text-[#543c52]" />
        </div>
        <h3 className="text-xl font-semibold text-[#361d32] mb-2">Ексклюзивні пропозиції</h3>
        <p className="text-[#361d32]/80">
          Доступ до закритих регістрів готелів та спеціальних умов, недоступних при самостійному бронюванні.
        </p>
      </div>
    </SwiperSlide>

    <SwiperSlide className='px-4'>
      <div className="bg-[#543c52]/30 border border-[#361d32] rounded-3xl p-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#f1e8e6]/50 flex justify-center items-center mb-4">
          <FaLeaf className="text-4xl text-[#543c52]" />
        </div>
        <h3 className="text-xl font-semibold text-[#361d32] mb-2">Відповідальний туризм</h3>
        <p className="text-[#361d32]/80">
          Ми підтримуємо місцеві спільноти та екологічні ініціативи, пропонуючи етичні варіанти подорожей.
        </p>
      </div>
    </SwiperSlide>
  </Swiper>
</section>


    </>
    );
  };

export default AboutusPage
