import React, { useState, useEffect, useRef } from "react";

interface NFTCarouselProps {
  nfts: Array<any>;
}

const THUMBNAILS_SHOWN = 4;
const AUTOPLAY_INTERVAL = 2500;

const NFTCarousel: React.FC<NFTCarouselProps> = ({ nfts }) => {
  // Index of the current group (0, 1, 2, ...)
  const [groupIndex, setGroupIndex] = useState(0);
  // Index in the current group (0, 1, 2, 3)
  const [selectedInGroup, setSelectedInGroup] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate the actual index in the nfts array for each thumbnail
  const getThumbIndex = (groupIdx: number, idxInGroup: number) => {
    return (groupIdx * THUMBNAILS_SHOWN + idxInGroup) % nfts.length;
  };

  // The main image index
  const selectedIndex = getThumbIndex(groupIndex, selectedInGroup);

  // Build the 4 thumbnails, wrapping if needed
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
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Big Image */}
      <img
        src={nfts[selectedIndex].src}
        alt={`NFT Cat ${selectedIndex + 1}`}
        className="w-100 max-h-[400px] h-auto rounded-xl shadow-lg mb-5  object-contain bg-white"
      />
      <div className="flex items-center gap-6 mt-6">
        {/* Icon "<" */}
        <button
          onClick={handleLeft}
          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-[#00e6c7]/20 flex items-center justify-center text-2xl text-[#005b4a] transition-colors shadow-sm mr-2"
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
            className={`w-27 h-27 rounded-lg cursor-pointer object-contain bg-white transition-all duration-200
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
          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-[#00e6c7]/20 flex items-center justify-center text-2xl text-[#005b4a] transition-colors shadow-sm ml-2"
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
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NFTCarousel;
