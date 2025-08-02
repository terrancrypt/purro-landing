import React, { useState, useEffect, useRef } from "react";

interface NFTCarouselProps {
  nfts: Array<any>;
}

const THUMBNAILS_SHOWN_LG = 4;
const THUMBNAILS_SHOWN_SM = 3;
const AUTOPLAY_INTERVAL = 2500;

const NFTCarousel: React.FC<NFTCarouselProps> = ({ nfts }) => {
  // Index of the current group (0, 1, 2, ...)
  const [groupIndex, setGroupIndex] = useState(0);
  // Index in the current group (0, 1, 2, 3)
  const [selectedInGroup, setSelectedInGroup] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1200); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const THUMBNAILS_SHOWN = isSmallScreen
    ? THUMBNAILS_SHOWN_SM
    : THUMBNAILS_SHOWN_LG;

  // Calculate the actual index in the nfts array for each thumbnail
  const getThumbIndex = (groupIdx: number, idxInGroup: number) => {
    return (groupIdx * THUMBNAILS_SHOWN + idxInGroup) % nfts.length;
  };

  // The main image index
  const selectedIndex = getThumbIndex(groupIndex, selectedInGroup);

  // Build the thumbnails, wrapping if needed
  const thumbnails = Array.from({ length: THUMBNAILS_SHOWN }, (_, i) => {
    return nfts[getThumbIndex(groupIndex, i)];
  });

  // Handle left/right arrow
  const handleLeft = () => {
    let newSelected = selectedInGroup - 1;
    let newGroup = groupIndex;
    if (newSelected < 0) {
      newGroup =
        (groupIndex - 1 + Math.ceil(nfts.length / THUMBNAILS_SHOWN)) %
        Math.ceil(nfts.length / THUMBNAILS_SHOWN);
      newSelected = THUMBNAILS_SHOWN - 1;
    }
    setGroupIndex(newGroup);
    setSelectedInGroup(newSelected);
    resetAutoplay();
  };
  const handleRight = () => {
    let newSelected = selectedInGroup + 1;
    let newGroup = groupIndex;
    if (newSelected >= THUMBNAILS_SHOWN) {
      newGroup = (groupIndex + 1) % Math.ceil(nfts.length / THUMBNAILS_SHOWN);
      newSelected = 0;
    }
    setGroupIndex(newGroup);
    setSelectedInGroup(newSelected);
    resetAutoplay();
  };

  // Handle thumbnail click
  const handleThumbClick = (idx: number) => {
    setSelectedInGroup(idx);
    resetAutoplay();
  };

  // Autoplay logic
  const resetAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setSelectedInGroup((prev) => {
        let next = prev + 1;
        if (next >= THUMBNAILS_SHOWN) {
          setGroupIndex(
            (g) => (g + 1) % Math.ceil(nfts.length / THUMBNAILS_SHOWN)
          );
          return 0;
        }
        return next;
      });
    }, AUTOPLAY_INTERVAL);
  };

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [THUMBNAILS_SHOWN]);

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-3 max-w-full overflow-hidden">
      {/* Big Image */}
      <div
        className="w-[220px] sm:w-[270px] md:w-[300px] lg:w-[270px] xl:w-[400px] 
        aspect-square rounded-xl shadow-lg mb-5 bg-white flex items-center justify-center"
      >
        <img
          src={nfts[selectedIndex].src}
          alt={`NFT Cat ${selectedIndex + 1}`}
          className="w-full h-full object-contain rounded-xl"
        />
      </div>
      <div className="flex items-center gap-2 mb-4">
        {/* Icon "<" */}
        <button
          onClick={handleLeft}
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-8 md:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-lg sm:text-2xl text-white transition-colors hover:text-[#00e6c7] cursor-pointer"
          aria-label="Previous"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Smail Thumbnail Image */}
        {thumbnails.map((nft, idx) => (
          <img
            key={getThumbIndex(groupIndex, idx)}
            src={nft.src}
            alt={`NFT Cat ${getThumbIndex(groupIndex, idx) + 1}`}
            className={`w-[80px] sm:w-[100px] xl:w-[110px] 
              mx-2 md:mx-4 lg:mx-2 rounded-lg cursor-pointer object-contain bg-white transition-all duration-200
              ${
                selectedInGroup === idx
                  ? "ring-4 ring-[#00e6c7] scale-110"
                  : "hover:ring-2 hover:ring-[#00e6c7] hover:scale-105 hover:shadow-lg"
              }
            `}
            onClick={() => handleThumbClick(idx)}
          />
        ))}
        {/* Icon ">" */}
        <button
          onClick={handleRight}
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-8 md:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-lg sm:text-2xl text-white transition-colors hover:text-[#00e6c7] cursor-pointer"
          aria-label="Next"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NFTCarousel;
