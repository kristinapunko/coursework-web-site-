import { useTourFilterParams } from '../features/tours/filterParams';

import extreme from '../assets/extreme.webp';
import beach from '../assets/beach.webp';
import festival from '../assets/festival.webp';
import gastronomic from '../assets/gastronomic.webp';
import nature from '../assets/nature.webp';
import winter from '../assets/winter.webp';

const thematicTours = [
  {
    id: 'extreme',
    image: extreme,
    title: "Екстремальні та спортивні тури",
    items: [
      "Гірськолижні тури",
      "Дайвінг та снорклінг",
      "Стрибки з парашутом"
    ],
    filterField: "extreme_tour"
  },
  {
    id: 'beach',
    image: beach,
    title: "Пляжні тури",
    items: [
      "Екзотичні пляжні тури",
      "Європейські пляжні тури"
    ],
    filterField: "beach_tour"
  },
  {
    id: 'festival',
    image: festival,
    title: "Фестивальні тури",
    items: [
      "Октаберфест у Німеччині",
      "Карнавал у Ріо-де-Жанейро",
      "Фестиваль ліхтарів у Таїланді"
    ],
    filterField: "festivals"
  },
  {
    id: 'gastronomic',
    image: gastronomic,
    title: "Гастрономічні тури",
    items: [
      "Дегустації вин та сирів",
      "Фермерські еко-тури"
    ],
    filterField: "gastronomic_tour"
  },
  {
    id: 'nature',
    image: nature,
    title: "Природні та еко-тури",
    items: [
      "Походи в гори (Карпати, Альпи)",
      "Сафарі в національних парках"
    ],
    filterField: "natural_tour"
  },
  {
    id: 'winter',
    image: winter,
    title: "Зимові тури",
    items: [
      "Різдвяна Європа",
      "Класика альпійських лиж"
    ],
    filterField: "winter_tour"
  }
];

const TourList = () => {
  const { resetFilters } = useTourFilterParams();

  const handleThematicTourSelect = (filterField) => {
    resetFilters({}, { thematicFilter: filterField });
  };

  return (
    <div className="w-[90%] lg:w-5/6 mx-auto mb-1">
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 p-6">
        {thematicTours.map((tour) => (
          <div 
            key={tour.id}
            onClick={() => handleThematicTourSelect(tour.filterField)}
            className="flex bg-[#361d32]/25 shadow-lg rounded-2xl overflow-hidden border border-gray-200 max-w-xl transition-transform transform hover:scale-105 cursor-pointer"
          >
            <img 
              src={tour.image} 
              alt={tour.title} 
              className="w-1/3 h-auto md:h-32 object-cover" 
              loading="lazy"
              decoding="async"
            />
            <div className="w-2/3 p-4">
              <h3 className="lg:text-xl text-sm font-semibold text-[#361d32]">
                {tour.title}
              </h3>
              <ul className="text-[#543c52] text-[10px] lg:text-sm mt-2">
                {tour.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TourList;
