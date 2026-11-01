// import React, { useEffect, useMemo } from "react";
// import { useState } from "react";
// import Rome from '../assets/Rome.jpg';
// import Lviv from '../assets/Lviv.jpg';
// import PortLouis from '../assets/PortLouis.jpg';
// import Bangkok from '../assets/Bangkok.jpg';
// import Zurich from '../assets/Zurich.jpg';
// import Barcelona from '../assets/Barcelona.jpg';
// import Athens from '../assets/Athens.jpg';
// import Sharmel from '../assets/Sharmel-Sheikh.png';
// import Pariss from '../assets/Pariss.jpg';
// import { FiArrowRight} from "react-icons/fi";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchReviews } from "../features/tours/reviewsSlice";

// const des = [
//   { name: "Цюріх", image: Zurich },
//   { name: "Бангкок", image: Bangkok },
//   { name: "Порт-Луї", image: PortLouis },
//   { name: "Львів", image: Lviv },
//   { name: "Рим", image: Rome },
//   { name: "Барселона", image: Barcelona },
//   { name: "Афіни", image: Athens },
//   { name: "Шарм-ель-Шейх", image: Sharmel },
//   { name: "Париж", image: Pariss },
// ];

// import { useNavigate } from 'react-router-dom';
// import { setPopularTours } from '../features/tours/toursSlice'; // додай сюди

// const cityImages = {
//   image1: Zurich,
//   image2: Bangkok,
//   image3: PortLouis,
//   image4: Lviv,
//   image5: Rome,
//   image6: Barcelona,
//   image7: Athens,
//   image8: Sharmel,
//   image9: Pariss
// };

// const DestinationGrid = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const tours = useSelector((state) => state.tours.tours);
//   const allReviews = useSelector((state) => state.reviews.reviews);
//   const reviewsLoading = useSelector((state) => state.reviews.loading);
//   const [groupedTours, setGroupedTours] = useState({});

//   useEffect(() => {
//     if (tours?.length) {
//       const tourIds = tours.map((t) => t.id);
//       dispatch(fetchReviews(tourIds));
//     }
//   }, [tours, dispatch]);

//   useEffect(() => {
//     if (tours?.length && allReviews?.length && !reviewsLoading) {
//       const toursWithReviews = tours.map((tour) => {
//         const tourReviews = allReviews.filter((r) => r.tour === tour.id);
//         return {
//           ...tour,
//           reviewCount: tourReviews.length,
//           averageRating: tourReviews.length
//             ? tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length
//             : 0,
//         };
//       });

//       const grouped = {};
//       toursWithReviews.forEach((tour) => {
//         if (!grouped[tour.reviewCount]) {
//           grouped[tour.reviewCount] = [];
//         }
//         grouped[tour.reviewCount].push(tour);
//       });

//       setGroupedTours(grouped);
//     }
//   }, [tours, allReviews, reviewsLoading]);

//   const handleClick = (reviewCount) => {
//     const toursWithSameReviews = groupedTours[reviewCount] || [];
//     dispatch(setPopularTours(toursWithSameReviews));
//     navigate('/alltours');
//   };

//   const sortedReviewCounts = Object.keys(groupedTours)
//     .map(Number)
//     .sort((a, b) => b - a);

//   return (
//     <div className="w-4/5 mx-auto rounded-xl overflow-hidden rounded-lg mb-12">
//        <div className="grid grid-cols-1 md:grid-cols-3 ">
//         {sortedReviewCounts.map((reviewCount, index) => (
//           <Destination
//             key={reviewCount}
//             tours={groupedTours[reviewCount]}
//             image={cityImages[`image${index + 1}`] || '/images/placeholder.jpg'}
//             onClick={() => handleClick(reviewCount)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// const Destination = ({  tours, image, onClick }) => {
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <div
//       className="relative w-full h-full aspect-[4/3] overflow-hidden cursor-pointer shadow-lg"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       onClick={onClick}
//     >
//       <img
//         src={image}
//         alt={name}
//         className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
//           isHovered ? 'brightness-50 scale-105' : 'brightness-100 scale-100'
//         }`}
//       />
//       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      
//       {isHovered && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
//   <div className="text-center p-4 text-white max-w-full">
//     <div className="text-sm flex flex-wrap justify-center gap-x-4 gap-y-2">
//       {tours.map((tour) => (
//         <span key={tour.id} className="transition-opacity hover:opacity-80">
//           {tour.countries}
//         </span>
//       ))}
//     </div>
//   </div>

//   <button 
//     className="flex items-center gap-1 text-[#edd2cb] px-4 py-2 rounded-full 
//               transition-all hover:bg-white/10 hover:gap-2 active:scale-95"
//   >
//     <span>Переглянути тури</span>
//     <FiArrowRight className="text-xs transition-transform" />
//   </button>
// </div>
//       )}
//     </div>
//   );
// };

// export default DestinationGrid;


import { useMemo, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { setPopularTours } from '../features/tours/toursSlice';

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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const tours = useSelector((state) => state.tours.tours);
  const allReviews = useSelector((state) => state.reviews.reviews);
  const reviewsLoading = useSelector((state) => state.reviews.loading);

  // 2. Замість useEffect + useState використовуємоuseMemo для стабільності та швидкості
  const groupedTours = useMemo(() => {
    if (!tours?.length || reviewsLoading) return {};

    const reviewCounts = allReviews.reduce((counts, review) => {
      counts.set(review.tour, (counts.get(review.tour) || 0) + 1);
      return counts;
    }, new Map());
    const toursWithReviews = tours.map((tour) => {
      return {
        ...tour,
        reviewCount: reviewCounts.get(tour.id) || 0,
      };
    });

    const grouped = {};
    toursWithReviews.forEach((tour) => {
      if (!grouped[tour.reviewCount]) {
        grouped[tour.reviewCount] = [];
      }
      grouped[tour.reviewCount].push(tour);
    });

    return grouped;
  }, [tours, allReviews, reviewsLoading]);

  // 3. Сортуємо ключі (кількість відгуків) від більшого до меншого
  const sortedReviewCounts = useMemo(() => {
    return Object.keys(groupedTours).map(Number).sort((a, b) => b - a);
  }, [groupedTours]);

  const handleClick = (reviewCount) => {
    const toursWithSameReviews = groupedTours[reviewCount] || [];
    dispatch(setPopularTours(toursWithSameReviews));
    navigate('/alltours');
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
