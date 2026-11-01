import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import SafeImage from '../ui/SafeImage';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

const TourGallery = ({ photos: photoData, tourName }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const photos = Array.isArray(photoData) ? photoData.filter(Boolean) : [];
  const hasMultiplePhotos = photos.length > 1;
  const activeThumbsSwiper = thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null;

  if (photos.length === 0) {
    return (
      <SafeImage
        className="w-full h-48 sm:h-64 md:h-80 my-4 sm:my-6 rounded-2xl object-cover"
        alt={`Tour ${tourName}`}
      />
    );
  }

  return (
    <>
      <Swiper
        navigation={hasMultiplePhotos}
        modules={[Navigation, Thumbs]}
        thumbs={hasMultiplePhotos ? { swiper: activeThumbsSwiper } : undefined}
        className="w-full h-auto my-4 sm:my-6 rounded-2xl overflow-hidden"
      >
        {photos.map((photo, index) => (
          <SwiperSlide key={photo.id ?? index}>
            <SafeImage
              src={photo?.image}
              alt={`Tour image ${index + 1}`}
              decoding="async"
              className="w-full h-48 sm:h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-10" />
          </SwiperSlide>
        ))}
      </Swiper>

      {hasMultiplePhotos && (
        <Swiper
          navigation
          modules={[Navigation, Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={Math.min(4, photos.length)}
          watchSlidesProgress
          className="w-full"
        >
          {photos.map((photo, index) => (
            <SwiperSlide key={photo.id ?? index}>
              <SafeImage
                src={photo?.image}
                alt={`Tour image ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full rounded-2xl h-9/10 md:h-24 object-cover cursor-pointer"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10" />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </>
  );
};

export default TourGallery;
