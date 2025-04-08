import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const images = [
  {
    src: '/images/Game Of Squids 1.webp',
    fallback: '/images/Game Of Squids 1.jpg',
    alt: 'Game Of Squids 1'
  },
  {
    src: '/images/Game Of Squids 2.jpg',
    alt: 'Game Of Squids 2'
  },
  {
    src: '/images/Game Of Squids 3.png',
    alt: 'Game Of Squids 3'
  }
];

const ImageSlider = () => {
  return (
    <div className="w-full max-w-5xl mx-auto mb-8 mt-4">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        effect="fade"
        loop={true}
        className="rounded-lg shadow-2xl aspect-[16/9]"
        style={{
          '--swiper-navigation-color': '#ec4899',
          '--swiper-pagination-color': '#ec4899',
        } as React.CSSProperties}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full">
              <picture>
                {image.fallback && <source srcSet={image.src} type="image/webp" />}
                <img
                  src={image.fallback || image.src}
                  alt={image.alt}
                  className="w-full h-[400px] object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;