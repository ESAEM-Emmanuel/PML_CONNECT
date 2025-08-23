// src/components/Caroussel.jsx
import { useTranslation } from 'react-i18next';
import React, { useRef, useState } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { ChevronLeft, ChevronRight } from 'lucide-react'; 
import { Link } from 'react-router-dom';



const Caroussel = () => {
    const { t } = useTranslation();
    const slides = [
        {
          titleTop: t('caroussel.1.titleTop'),
          titleMain: t('caroussel.1.titleMain'),
          buttonText: t('caroussel.1.buttonText'),
          desc: t('caroussel.1.desc'),
          image: t('caroussel.1.image'), // Lien direct vers une image
        },
        {
          titleTop: t('caroussel.2.titleTop'),
          titleMain: t('caroussel.2.titleMain'),
          buttonText: t('caroussel.2.buttonText'),
          desc: t('caroussel.2.desc'),
          image: t('caroussel.2.image'), // Lien direct vers une image
        },
        {
          titleTop: t('caroussel.3.titleTop'),
          titleMain: t('caroussel.3.titleMain'),
          buttonText: t('caroussel.3.buttonText'),
          desc: t('caroussel.3.desc'),
          image: t('caroussel.3.image'), // Lien direct vers une image
        },
        {
          titleTop: t('caroussel.4.titleTop'),
          titleMain: t('caroussel.4.titleMain'),
          buttonText: t('caroussel.4.buttonText'),
          desc: t('caroussel.4.desc'),
          image: t('caroussel.4.image'), // Lien direct vers une image
        },
        
      ];
  const [currentSlide, setCurrentSlide] = useState(0);
  const timeoutRef = useRef(null);
  const mouseOverRef = useRef(false);
  const [loadedImages, setLoadedImages] = useState({});

  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    renderMode: 'performance',
    drag: true,
    created(slider) {
      startAutoPlay(slider);
      slider.container.addEventListener('mouseover', () => {
        mouseOverRef.current = true;
        clearTimeout(timeoutRef.current);
      });
      slider.container.addEventListener('mouseout', () => {
        mouseOverRef.current = false;
        startAutoPlay(slider);
      });
    },
    animationEnded(slider) {
      startAutoPlay(slider);
    },
  });

  function startAutoPlay(slider) {
    clearTimeout(timeoutRef.current);
    if (mouseOverRef.current) return;
    timeoutRef.current = setTimeout(() => {
      slider.next();
    }, 5000);
  }

  const handleImageLoad = (index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl animate-fade-in">
      <div ref={sliderRef} className="keen-slider">
        {slides.map((slide, index) => (
          <div key={index} className="keen-slider__slide relative">
            {!loadedImages[index] && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                <span className="text-gray-500">Chargement...</span>
              </div>
            )}
            <img
              src={slide.image}
              alt={`Slide ${index + 1}`}
              className={`w-full h-[400px] object-cover brightness-75 transition-opacity duration-700 ${loadedImages[index] ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => handleImageLoad(index)}
            />
            <div className="absolute inset-0 flex items-center sm:mx-10 px-10">
              <div className="bg-black bg-opacity-50 p-6 rounded-xl max-w-md space-y-4 animate-fade-in shadow-2xl">
                <h2 className="text-white text-4xl font-extrabold tracking-tight leading-tight">
                  <span className="text-accent-color">{slide.titleTop.toLocaleUpperCase()}</span>
                </h2>
                <p className="text-gray-100 text-lg font-medium">
                  {slide.titleMain.split(' ').map((word, idx) => {
                    const highlightWords = ['meetings', 'calls', 'interviews', 'SUAS'];
                    if (highlightWords.includes(word.replace(/[,.]/g, ''))) {
                      return <span key={idx} className="text-white font-semibold">{word} </span>;
                    }
                    if (word === 'SUAS.') {
                      return <span key={idx} className="text-green-400 font-semibold">{word} </span>;
                    }
                    return word + ' ';
                  })}
                </p>
                <Link
                  to="/events"
                  className="mt-3 inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-all duration-300"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Flèches navigation */}
      <button
        onClick={() => slider.current?.prev()}
        className="hidden lg:flex absolute top-1/2 left-3 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
        aria-label="Slide précédente"
      >
        <ChevronLeft size={24} className="h-6 w-6 text-gray-500" />
      </button>
      <button
        onClick={() => slider.current?.next()}
        className="hidden lg:flex absolute top-1/2 right-3 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
        aria-label="Slide suivante"
      >
        <ChevronRight size={24} className="h-6 w-6 text-gray-500" />
      </button>

      {/* Pagination */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => slider.current?.moveToIdx(idx)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 focus:outline-none ${
              currentSlide === idx ? 'bg-white' : 'bg-gray-400'
            }`}
            aria-label={`Aller à la slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Caroussel;