import { useEffect, useState } from "react";

const CatEyes = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculateEyePosition = (eyeCenterX: number, eyeCenterY: number) => {
    const rect = document
      .querySelector(".cat-container")
      ?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    const eyeX = rect.left + eyeCenterX;
    const eyeY = rect.top + eyeCenterY;

    const deltaX = mousePosition.x - eyeX;
    const deltaY = mousePosition.y - eyeY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const maxDistance = 8; // Maximum distance the pupil can move
    const normalizedX = (deltaX / distance) * Math.min(distance, maxDistance);
    const normalizedY = (deltaY / distance) * Math.min(distance, maxDistance);

    return {
      x: isNaN(normalizedX) ? 0 : normalizedX,
      y: isNaN(normalizedY) ? 0 : normalizedY,
    };
  };

  const leftEyePosition = calculateEyePosition(120, 80);
  const rightEyePosition = calculateEyePosition(180, 80);

  return (
    <div className="absolute inset-0 pointer-events-none cat-container">
      {/* Left Eye */}
      <svg
        className="absolute"
        style={{
          left: "35%",
          top: "25%",
          transform: "translate(-50%, -50%)",
        }}
        width="40"
        height="40"
        viewBox="0 0 40 40"
      >
        {/* Eye white */}
        <ellipse
          cx="20"
          cy="20"
          rx="18"
          ry="15"
          fill="white"
          stroke="#005b4a"
          strokeWidth="2"
        />
        {/* Pupil */}
        <circle
          cx={20 + leftEyePosition.x}
          cy={20 + leftEyePosition.y}
          r="8"
          fill="#005b4a"
        />
        {/* Highlight */}
        <circle
          cx={20 + leftEyePosition.x + 2}
          cy={20 + leftEyePosition.y - 2}
          r="3"
          fill="white"
        />
      </svg>

      {/* Right Eye */}
      <svg
        className="absolute"
        style={{
          left: "65%",
          top: "25%",
          transform: "translate(-50%, -50%)",
        }}
        width="40"
        height="40"
        viewBox="0 0 40 40"
      >
        {/* Eye white */}
        <ellipse
          cx="20"
          cy="20"
          rx="18"
          ry="15"
          fill="white"
          stroke="#005b4a"
          strokeWidth="2"
        />
        {/* Pupil */}
        <circle
          cx={20 + rightEyePosition.x}
          cy={20 + rightEyePosition.y}
          r="8"
          fill="#005b4a"
        />
        {/* Highlight */}
        <circle
          cx={20 + rightEyePosition.x + 2}
          cy={20 + rightEyePosition.y - 2}
          r="3"
          fill="white"
        />
      </svg>
    </div>
  );
};

export default CatEyes;
