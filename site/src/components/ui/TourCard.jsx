import { Link } from 'react-router-dom';
import { FaBus, FaCalendarAlt, FaPlaneDeparture, FaUtensils } from "react-icons/fa";
import FormattedPrice from './FormattedPrice';
import LikeButton from './LikeButton';
import HotAndPromotionButton from './HotAndPromotionButton';
import { formatDate, calculateDaysAndNights } from '../../utils/utils';
import CountOfPeople from './CountOfPeople';
import SafeImage from './SafeImage';

const TourCard = ({ 
  tour, 
  details, 
  onLikeClick,
  isLiked = false
}) => {
  const rating = tour.average_rating == null
    ? null
    : Number(tour.average_rating).toFixed(1);
  const reviewCount = Number(tour.review_count) || 0;
  const tourEndDate = new Date(tour.end_date);
  const today = new Date();
  const isActive = tourEndDate >= today;
      
  return (
    <div className={` ${isActive ? "bg-[#f1e8e6]/20" : "bg-[#f1e8e6]/80"} border border-[#361d32]-200 rounded-2xl shadow-lg p-4 flex flex-col items-center relative`}>
      {!isActive && <h1 className='absolute z-10 top-[80px] text-[#f1e8e6] font-bold text-[24px]'>Не активний</h1>}
      <Link to={`/tour/${tour.id}`} className="w-full">
        <div className="relative w-full overflow-hidden bg-black/50 rounded-2xl">
          <div className={`absolute inset-0 bg-black ${isActive ? "opacity-30" : "opacity-50"} `}></div>

          <SafeImage
            className="w-full h-40 object-cover"
            src={details?.photos?.[0]?.image}
            alt={`Tour ${tour.name}`}
            loading="lazy"
            decoding="async"
          />

        <div className="absolute top-3 right-3 flex flex-col gap-2">
                   <LikeButton 
                    liked={isLiked}
                    onClick={onLikeClick}
                  />
                </div>
                <HotAndPromotionButton 
                  tour={tour} 
                  containerClass="absolute top-12 right-3 flex flex-col gap-2"
                />
              </div>
        
        <div className="text-center mt-4 w-full">
          <div className="flex justify-between items-center text-sm px-2">
            <h3 className="font-semibold text-[#361d32] truncate w-1/2 pr-2">
              {tour.name}
            </h3>
            <p className="text-[#361d32] truncate w-1/2 pl-2">
              {tour.countries}
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 my-2 text-sm">
            <span className="text-[#f55951] font-bold">{rating ?? '—'}</span>
            <span className="text-[#361d32]">({reviewCount} відгуків)</span>
          </div>
          
          <div className="flex flex-col gap-1 text-gray-700 text-xs px-2">
            <p className="flex items-center gap-2 text-[#543c52]">
              <FaCalendarAlt className="text-[#361d32]" />
              з {formatDate(tour.start_date)} по {formatDate(tour.end_date)} ({calculateDaysAndNights(tour.start_date, tour.end_date)})
            </p>
            <p className="flex items-center gap-2 text-[#543c52]">
              {tour.departure_by === "Автобус" ? <FaBus className="text-[#361d32]" /> : <FaPlaneDeparture className="text-[#361d32]" />}
              Виїзд з {tour.departure_from}
            </p>
            <p className="flex items-center gap-2 text-[#543c52]">
              <FaUtensils className="text-[#361d32]" />
              {tour.food}
            </p>
          </div>
          
          <div className="mt-3 px-2 w-full">
                    <div className="text-right mt-1"> 
                      <CountOfPeople tour={tour} />
                    </div>
                    <div className="text-left text-2xl font-bold">
                      <FormattedPrice tour={tour}/>
                    </div>
                  </div>

                  <button className="mt-4 w-full bg-[#543c52] text-[#f1e8e6] py-2 rounded-xl hover:bg-[#361d32] transition">
                    Детальніше
                  </button>
        </div>
      </Link>
      
     
    </div>
  );
};

export default TourCard;
