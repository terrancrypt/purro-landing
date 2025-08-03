import React, { useState, useEffect } from "react";

interface FeatureSlide {
  id: number;
  title: string;
  description: string;
  description2?: string;
  image: string;
  imageAlt: string;
}

interface InteractiveFeaturesProps {
  features: FeatureSlide[];
}

const InteractiveFeatures: React.FC<InteractiveFeaturesProps> = ({
  features,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const updateSlide = (index: number) => {
    setCurrentSlide(index);

    // Update content with animation
    const titleEl = document.getElementById("slide-title");
    const descriptionEl = document.getElementById("slide-description");
    const imageEl = document.getElementById("slide-image") as HTMLImageElement;

    if (titleEl) {
      // Fade out and slide up using Tailwind classes
      titleEl.classList.remove("translate-y-0", "opacity-100");
      titleEl.classList.add("translate-y-[-10px]", "opacity-0");

      setTimeout(() => {
        titleEl.textContent = features[index].title || "";
        titleEl.classList.remove("translate-y-[-10px]", "opacity-0");
        titleEl.classList.add("translate-y-0", "opacity-100");
      }, 250);
    }

    if (descriptionEl) {
      // Fade out and slide up using Tailwind classes
      descriptionEl.classList.remove("translate-y-0", "opacity-100");
      descriptionEl.classList.add("translate-y-[-10px]", "opacity-0");

      setTimeout(() => {
        descriptionEl.textContent = features[index].description || "";
        descriptionEl.classList.remove("translate-y-[-10px]", "opacity-0");
        descriptionEl.classList.add("translate-y-0", "opacity-100");
      }, 250);
    }

    // Update second description if it exists
    const description2El = document.getElementById("slide-description2");
    if (description2El && features[index].description2) {
      // Fade out and slide up using Tailwind classes
      description2El.classList.remove("translate-y-0", "opacity-100");
      description2El.classList.add("translate-y-[-10px]", "opacity-0");

      setTimeout(() => {
        description2El.textContent = features[index].description2 || "";
        description2El.classList.remove("translate-y-[-10px]", "opacity-0");
        description2El.classList.add("translate-y-0", "opacity-100");
      }, 250);
    }
    if (imageEl) {
      // Fade out and scale down using Tailwind classes
      imageEl.classList.remove("scale-100", "opacity-100");
      imageEl.classList.add("scale-95", "opacity-0");

      setTimeout(() => {
        imageEl.src = features[index].image;
        imageEl.alt = features[index].imageAlt;
        imageEl.classList.remove("scale-95", "opacity-0");
        imageEl.classList.add("scale-100", "opacity-100");
      }, 250);
    }

    // Update navigation dots (mobile)
    const dots = document.querySelectorAll("#navigation-dots button");
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.remove("bg-gray-600", "hover:bg-gray-500");
        dot.classList.add("bg-white");
      } else {
        dot.classList.remove("bg-white");
        dot.classList.add("bg-gray-600", "hover:bg-gray-500");
      }
    });

    // Update navigation dots (desktop)
    const dotsDesktop = document.querySelectorAll(
      "#navigation-dots-desktop button"
    );
    dotsDesktop.forEach((dot, i) => {
      if (i === index) {
        dot.classList.remove("bg-gray-600", "hover:bg-gray-500");
        dot.classList.add("bg-white");
      } else {
        dot.classList.remove("bg-white");
        dot.classList.add("bg-gray-600", "hover:bg-gray-500");
      }
    });

    // Update navigation arrows
    const prevBtn = document.getElementById("prev-btn") as HTMLButtonElement;
    const nextBtn = document.getElementById("next-btn") as HTMLButtonElement;

    if (prevBtn) {
      if (index === 0) {
        prevBtn.classList.remove(
          "text-[#02f1dc]",
          "hover:text-[#02f1dc]/80",
          "hover:bg-[#02f1dc]/10"
        );
        prevBtn.classList.add("text-gray-400", "cursor-pointer");
        prevBtn.disabled = true;
      } else {
        prevBtn.classList.remove("text-gray-400", "cursor-pointer");
        prevBtn.classList.add(
          "text-[#02f1dc]",
          "hover:text-[#02f1dc]/80",
          "hover:bg-[#02f1dc]/10"
        );
        prevBtn.disabled = false;
      }
    }

    if (nextBtn) {
      if (index === features.length - 1) {
        nextBtn.classList.remove(
          "text-[#02f1dc]",
          "hover:text-[#02f1dc]/80",
          "hover:bg-[#02f1dc]/10"
        );
        nextBtn.classList.add("text-gray-400", "cursor-pointer");
        nextBtn.disabled = true;
      } else {
        nextBtn.classList.remove("text-gray-400", "cursor-pointer");
        nextBtn.classList.add(
          "text-[#02f1dc]",
          "hover:text-[#02f1dc]/80",
          "hover:bg-[#02f1dc]/10"
        );
        nextBtn.disabled = false;
      }
    }
  };

  const nextSlide = () => {
    if (currentSlide < features.length - 1) {
      // Add bounce effect
      const nextBtn = document.getElementById("next-btn");
      if (nextBtn) {
        nextBtn.style.transition = "transform 0.075s ease-out";
        nextBtn.style.transform = "translateX(-8px)";
        setTimeout(() => {
          nextBtn.style.transform = "translateX(0)";
          setTimeout(() => {
            nextBtn.style.transition = "all 0.3s";
          }, 75);
        }, 75);
      }
      updateSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      // Add bounce effect
      const prevBtn = document.getElementById("prev-btn");
      if (prevBtn) {
        prevBtn.style.transition = "transform 0.075s ease-out";
        prevBtn.style.transform = "translateX(8px)";
        setTimeout(() => {
          prevBtn.style.transform = "translateX(0)";
          setTimeout(() => {
            prevBtn.style.transition = "all 0.3s";
          }, 75);
        }, 75);
      }
      updateSlide(currentSlide - 1);
    }
  };

  useEffect(() => {
    // Navigation dots (mobile)
    const dots = document.querySelectorAll("#navigation-dots button");
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const slideIndex = parseInt(dot.getAttribute("data-slide") || "0");
        updateSlide(slideIndex);
      });
    });

    // Navigation dots (desktop)
    const dotsDesktop = document.querySelectorAll(
      "#navigation-dots-desktop button"
    );
    dotsDesktop.forEach((dot) => {
      dot.addEventListener("click", () => {
        const slideIndex = parseInt(dot.getAttribute("data-slide") || "0");
        updateSlide(slideIndex);
      });
    });

    // Navigation arrows
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    if (prevBtn) {
      prevBtn.addEventListener("click", prevSlide);
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", nextSlide);
    }

    // Cleanup event listeners
    return () => {
      dots.forEach((dot) => {
        dot.removeEventListener("click", () => {});
      });
      dotsDesktop.forEach((dot) => {
        dot.removeEventListener("click", () => {});
      });
      if (prevBtn) prevBtn.removeEventListener("click", prevSlide);
      if (nextBtn) nextBtn.removeEventListener("click", nextSlide);
    };
  }, [currentSlide, features.length]);

  // This component doesn't render anything, it just handles logic
  return null;
};

export default InteractiveFeatures;
