import React, { useEffect, useState } from 'react';

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showShapes, setShowShapes] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Show shapes after a small delay for the animation sequence
    const shapesTimer = setTimeout(() => {
      setShowShapes(true);
    }, 500);

    // Start fade out animation
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2000);

    return () => {
      clearTimeout(shapesTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      onTransitionEnd={() => {
        if (isFading) {
          setIsVisible(false);
          onComplete();
        }
      }}
    >
      <div className="relative">
        {/* Shapes container */}
        <div className="flex items-center justify-center gap-8 md:gap-12">
          {/* Circle */}
          <div 
            className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-pink-500 
              ${showShapes ? 'animate-[spin_3s_linear_infinite] animate-scale-in' : 'opacity-0'}`}
            style={{ animationDelay: '0s' }}
          />
          
          {/* Triangle */}
          <div 
            className={`w-12 h-12 md:w-16 md:h-16 relative 
              ${showShapes ? 'animate-[bounce_1s_ease-in-out_infinite] animate-scale-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}
          >
            <div 
              className="absolute inset-0 border-4 border-green-500" 
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            />
          </div>
          
          {/* Square */}
          <div 
            className={`w-12 h-12 md:w-16 md:h-16 border-4 border-purple-500 
              ${showShapes ? 'animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] animate-scale-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          />
        </div>
        
        {/* Loading text */}
        <div className="text-center mt-8">
          <p className={`font-squid text-3xl md:text-4xl text-white opacity-0 ${
            showShapes ? 'animate-scale-in' : ''
          }`} style={{ animationDelay: '0.6s' }}>
            BARYS GAME
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;