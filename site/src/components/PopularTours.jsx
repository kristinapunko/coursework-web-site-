import { useMemo, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useTourFilterParams } from '../features/tours/filterParams';

// Імпорти картинок залишаються тими ж...
import Zurich from '../assets/Zurich.webp';
import Bangkok from '../assets/Bangkok.webp';
import PortLouis from '../assets/PortLouis.webp';
import Lviv from '../assets/Lviv.webp';
import Rome from '../assets/Rome.webp';
import Barcelona from '../assets/Barcelona.webp';
import Athens from '../assets/Athens.webp';
import Sharmel from '../assets/Sharmel-Sheikh.webp';
import Pariss from '../assets/Pariss.webp';

const cityImages = {
  image1: Zurich, image2: Bangkok, image3: PortLouis,
  image4: Lviv, image5: Rome, image6: Barcelona,
  image7: Athens, image8: Sharmel, image9: Pariss
};

const DestinationGrid = () => {
  const { resetFilters } = useTourFilterParams();
  
  const tours = useSelector((state) => state.tours.tours);

  // 2. Замість useEffect + useState використовуємоuseMemo для стабільності та швидкості
  const groupedTours = useMemo(() => {
    if (!tours?.length) return {};

    const grouped = {};
    tours.forEach((tour) => {
      const reviewCount = Number(tour.review_count) || 0;
      if (!grouped[reviewCount]) {
        grouped[reviewCount] = [];
      }
      grouped[reviewCount].push(tour);
    });

    return grouped;
  }, [tours]);

  // 3. Сортуємо ключі (кількість відгуків) від більшого до меншого
  const sortedReviewCounts = useMemo(() => {
    return Object.keys(groupedTours).map(Number).sort((a, b) => b - a);
  }, [groupedTours]);

  const handleClick = (reviewCount) => {
    const toursWithSameReviews = groupedTours[reviewCount] || [];
    resetFilters({ tourIds: toursWithSameReviews.map((tour) => tour.id) });
  };

  return (
    <div className="w-4/5 mx-auto rounded-xl overflow-hidden mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {sortedReviewCounts.map((reviewCount, index) => (
          <Destination
            key={reviewCount}
            tours={groupedTours[reviewCount]}
            image={cityImages[`image${index + 1}`] || '/images/placeholder.jpg'}
            onClick={() => handleClick(reviewCount)}
          />
        ))}
      </div>
    </div>
  );
};

const Destination = ({ tours, image, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Отримуємо унікальний список країн для відображення на картці
  const uniqueCountries = useMemo(() => {
    if (!tours) return [];
    return [...new Set(tours.map(t => t.countries).filter(Boolean))];
  }, [tours]);

  // Беремо назву міста з першого туру для тегу alt
  const altName = tours?.[0]?.cities || "Популярний тур";

  return (
    <div
      className="relative w-full h-full aspect-[4/3] overflow-hidden cursor-pointer shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <img
        src={image}
        alt={altName} // Виправлено помилку ReferenceError
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
          isHovered ? 'brightness-50 scale-105' : 'brightness-100 scale-100'
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      
      {isHovered && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
          <div className="text-center p-4 text-white max-w-full">
            <div className="text-sm flex flex-wrap justify-center gap-x-4 gap-y-2 font-medium">
              {uniqueCountries.map((country, i) => (
                <span key={i} className="transition-opacity hover:opacity-80">
                  {country}
                </span>
              ))}
            </div>
          </div>

          <button 
            className="flex items-center gap-1 text-[#edd2cb] px-4 py-2 rounded-full 
                       transition-all hover:bg-white/10 hover:gap-2 active:scale-95"
          >
            <span>Переглянути тури</span>
            <FiArrowRight className="text-xs transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DestinationGrid;
