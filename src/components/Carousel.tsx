import { useEffect, useState, useRef } from "react";
import {
  motion,
  type PanInfo,
  useMotionValue,
  useTransform,
  type Transition,
} from "motion/react";
import React, { type JSX } from "react";

export interface CarouselImage {
  src: string;
  alt?: string;
}

export interface CarouselProps {
  images: CarouselImage[];
  baseWidth?: number;
  height?: number;
  aspectRatio?: number; // height / width, used if height not provided
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
  fit?: React.CSSProperties["objectFit"]; // e.g., 'contain' | 'cover' | 'fill'
  contentScale?: number; // 0..1, scales inner image size
}

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};
const RESET_TRANSITION: Transition = { duration: 0 };

export default function Carousel({
  images,
  baseWidth = 300,
  height,
  aspectRatio,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = true,
  loop = false,
  round = false,
  fit = "cover",
  contentScale = 1,
}: CarouselProps): JSX.Element {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const slidesBase = images;
  const slideCount = slidesBase.length;
  const carouselSlides =
    loop && slideCount > 0 ? [...slidesBase, slidesBase[0]] : slidesBase;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered) && slideCount > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === slideCount - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselSlides.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    loop,
    slideCount,
    carouselSlides.length,
    pauseOnHover,
  ]);

  const effectiveTransition: Transition = isResetting
    ? RESET_TRANSITION
    : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselSlides.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ): void => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === slideCount - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) =>
          Math.min(prev + 1, carouselSlides.length - 1)
        );
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(slideCount - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselSlides.length - 1),
          right: 0,
        },
      };

  const fallbackRatio = 0.6; // default when nothing specified
  const computedHeight = round
    ? itemWidth
    : height ?? Math.round(baseWidth * (aspectRatio ?? fallbackRatio));

  const innerScale = Math.max(
    0,
    Math.min(1, round ? Math.min(0.9, contentScale) : contentScale)
  );
  const innerPct = `${Math.round(innerScale * 100)}%`;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden p-4 ${
        round
          ? "rounded-full border border-white"
          : "rounded-[24px] border border-[#222]"
      }`}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px` }),
      }}
    >
      <motion.div
        className="flex"
        drag="x"
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${
            currentIndex * trackItemOffset + itemWidth / 2
          }px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselSlides.map((slide, index) => {
          const range = [
            -(index + 1) * trackItemOffset,
            -index * trackItemOffset,
            -(index - 1) * trackItemOffset,
          ];
          const outputRange = [90, 0, -90];
          const rotateY = useTransform(x, range, outputRange, { clamp: false });
          return (
            <motion.div
              key={index}
              className={`relative shrink-0 flex items-center justify-center bg-[#060010] overflow-hidden cursor-grab active:cursor-grabbing ${
                round ? "border-0" : "border border-[#222] rounded-[12px]"
              }`}
              style={{
                width: itemWidth,
                height: computedHeight,
                rotateY: rotateY,
                ...(round && { borderRadius: "50%" }),
              }}
              transition={effectiveTransition}
            >
              <img
                src={slide.src}
                alt={slide.alt ?? "carousel image"}
                style={{ objectFit: fit, width: innerPct, height: innerPct }}
                draggable={false}
              />
            </motion.div>
          );
        })}
      </motion.div>
      {slideCount > 1 && (
        <div
          className={`flex w-full justify-center ${
            round ? "absolute z-20 bottom-12 left-1/2 -translate-x-1/2" : ""
          }`}
        >
          <div className="mt-4 flex w-[150px] justify-between px-8">
            {slidesBase.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${
                  currentIndex % slideCount === index
                    ? round
                      ? "bg-white"
                      : "bg-[#000000]"
                    : round
                    ? "bg-[#000000]"
                    : "bg-[rgba(0,0,0,0.4)]"
                }`}
                animate={{
                  scale: currentIndex % slideCount === index ? 1.2 : 1,
                }}
                onClick={() => setCurrentIndex(index)}
                transition={{ duration: 0.15 }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
