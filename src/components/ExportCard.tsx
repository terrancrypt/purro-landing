import React, { useState, useEffect } from "react";
import { getTemplate } from "../config/templates";

interface ExportCardProps {
  traderData: any;
  templateId: string;
  hlName?: string;
  timeframe: string;
  generatedTime: Date;
  onImageLoaded?: () => void;
}

const ExportCard: React.FC<ExportCardProps> = ({
  traderData,
  templateId,
  hlName,
  timeframe,
  generatedTime,
  onImageLoaded,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(1)}B`;
    } else if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    } else {
      return `$${volume.toFixed(2)}`;
    }
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    if (rank <= 10) return "💎";
    if (rank <= 50) return "🚀";
    return "⭐";
  };

  const template = getTemplate(templateId);

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (onImageLoaded) {
      onImageLoaded();
    }
  };

  useEffect(() => {
    if (template?.img) {
      console.log(
        "ExportCard: Starting to load background image:",
        template.img
      );
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        console.log("ExportCard: Background image loaded successfully");
        // Additional check to ensure image is fully loaded
        if (img.complete && img.naturalWidth > 0) {
          handleImageLoad();
        } else {
          console.log("ExportCard: Image loaded but not complete, waiting...");
          setTimeout(() => handleImageLoad(), 100);
        }
      };
      img.onerror = (error) => {
        console.warn("ExportCard: Failed to load background image:", error);
        // Still proceed even if image fails to load
        handleImageLoad();
      };
      img.src = template.img;
    } else {
      console.log("ExportCard: No template image, setting loaded immediately");
      setImageLoaded(true);
      if (onImageLoaded) {
        onImageLoaded();
      }
    }
  }, [template?.img, onImageLoaded]);

  return (
    <div
      className="relative overflow-hidden flex justify-center items-center"
      style={{
        width: "1600px",
        height: "900px",
        fontFamily: "Inter, system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {template && (
          <>
            {/* Fallback background color */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: template.colors.primary + "10",
              }}
            />
            {/* Background image */}
            <img
              src={template.img}
              alt={template.name}
              className="w-full h-full object-cover"
              style={{
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.3s ease",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              onLoad={(e) => {
                console.log("ExportCard img element onLoad triggered");
                const img = e.target as HTMLImageElement;
                if (img.complete && img.naturalWidth > 0) {
                  handleImageLoad();
                }
              }}
              onError={(e) => {
                console.warn("ExportCard img element failed to load:", e);
                handleImageLoad(); // Still proceed
              }}
              crossOrigin="anonymous"
            />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center w-full px-32">
        {/* Rank Badge */}
        <div className="flex items-center justify-center mb-12">
          <div
            className="flex items-center gap-6 rounded-full backdrop-blur-sm border"
            style={{
              backgroundColor:
                template?.mode === "light"
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(0, 0, 0, 0.6)",
              borderColor: template?.colors.primary + "40",
              padding: "20px 40px",
              fontSize: "52px",
              fontWeight: "bold",
            }}
          >
            <div style={{ color: template?.colors.primary }}>
              #{traderData.rank}
            </div>
            <div style={{ fontSize: "60px" }}>
              {getRankEmoji(traderData.rank)}
            </div>
          </div>
        </div>

        {/* Name/Address */}
        <div className="mb-16">
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              marginBottom: "20px",
              color: template?.mode === "light" ? "#2C3E50" : "#FFFFFF",
            }}
          >
            {hlName || formatAddress(traderData.address)}
          </div>
          <div className="flex items-center justify-center gap-5">
            <div
              style={{
                fontSize: "24px",
                fontWeight: "500",
                padding: "12px 28px",
                borderRadius: "50px",
                backgroundColor: template?.colors.primary + "20",
                color: template?.colors.primary,
              }}
            >
              Purro Leaderboard
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "500",
                padding: "12px 28px",
                borderRadius: "50px",
                backgroundColor:
                  template?.mode === "light"
                    ? "rgba(0, 0, 0, 0.1)"
                    : "rgba(255, 255, 255, 0.1)",
                color: template?.mode === "light" ? "#666666" : "#CCCCCC",
              }}
            >
              {timeframe === "all" ? "All Time" : timeframe.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-10 mb-20">
          <div
            style={{
              borderRadius: "28px",
              padding: "36px",
              backgroundColor:
                template?.mode === "light"
                  ? "rgba(255, 255, 255, 0.8)"
                  : "rgba(0, 0, 0, 0.4)",
              border: `2px solid ${template?.colors.primary}30`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "56px",
                fontWeight: "bold",
                marginBottom: "12px",
                color: template?.colors.primary,
              }}
            >
              {traderData.points.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: template?.mode === "light" ? "#666666" : "#CCCCCC",
              }}
            >
              Points
            </div>
          </div>
          <div
            style={{
              borderRadius: "28px",
              padding: "36px",
              backgroundColor:
                template?.mode === "light"
                  ? "rgba(255, 255, 255, 0.8)"
                  : "rgba(0, 0, 0, 0.4)",
              border: `2px solid ${template?.colors.primary}30`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "56px",
                fontWeight: "bold",
                marginBottom: "12px",
                color: template?.colors.primary,
              }}
            >
              {formatVolume(traderData.volume_usd)}
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: template?.mode === "light" ? "#666666" : "#CCCCCC",
              }}
            >
              Volume
            </div>
          </div>
          <div
            style={{
              borderRadius: "28px",
              padding: "36px",
              backgroundColor:
                template?.mode === "light"
                  ? "rgba(255, 255, 255, 0.8)"
                  : "rgba(0, 0, 0, 0.4)",
              border: `2px solid ${template?.colors.primary}30`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "56px",
                fontWeight: "bold",
                marginBottom: "12px",
                color: template?.colors.primary,
              }}
            >
              {traderData.transactions.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: template?.mode === "light" ? "#666666" : "#CCCCCC",
              }}
            >
              Trades
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "500",
              marginBottom: "12px",
              color: template?.mode === "light" ? "#2C3E50" : "#FFFFFF",
            }}
          >
            purro.xyz • The Purr-fect Web3 Wallet
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "400",
              opacity: 0.7,
              color: template?.mode === "light" ? "#666666" : "#CCCCCC",
            }}
          >
            Generated on{" "}
            {generatedTime.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportCard;
