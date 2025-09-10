import React, { useRef, useCallback, useState } from "react";
import { toPng } from "html-to-image";
import type { ShareModalProps } from "../types/template";
import { templates, getTemplate } from "../config/templates";
import TemplateManager from "./TemplateManager";
import Button from "./Button";
import ExportCard from "./ExportCard";
import ReactDOM from "react-dom/client";

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

// Template list is now imported from config/templates.ts

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  traderData,
  timeframe,
  hlName,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [templateId, setTemplateId] = useState<string>("template1");
  const [generatedTime] = useState<Date>(() => new Date());

  const downloadImage = useCallback(async () => {
    try {
      let imageLoadedResolve: () => void;
      const imageLoadedPromise = new Promise<void>((resolve) => {
        imageLoadedResolve = resolve;
      });

      // Create the export card with fixed dimensions and image load callback
      const exportCardElement = React.createElement(ExportCard, {
        traderData,
        templateId,
        hlName,
        timeframe,
        generatedTime,
        onImageLoaded: () => {
          imageLoadedResolve();
        },
      });

      // Create a temporary container
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.top = "-9999px";
      tempContainer.style.left = "-9999px";
      tempContainer.style.width = "1600px";
      tempContainer.style.height = "900px";

      // Create a div to hold the React element
      const reactContainer = document.createElement("div");
      document.body.appendChild(tempContainer);
      tempContainer.appendChild(reactContainer);

      // Render the React component
      const root = ReactDOM.createRoot(reactContainer);
      root.render(exportCardElement);

      // Wait for image to load completely
      await imageLoadedPromise;

      // Additional wait for rendering to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dataUrl = await toPng(reactContainer.firstChild as HTMLElement, {
        cacheBust: true,
        pixelRatio: 2,
        width: 1600,
        height: 900,
        backgroundColor: "#ffffff",
        quality: 1.0,
      });

      // Cleanup
      root.unmount();
      document.body.removeChild(tempContainer);

      // Download
      const link = document.createElement("a");
      const displayName = hlName || formatAddress(traderData.address);
      const timestamp = generatedTime
        .toISOString()
        .slice(0, 16)
        .replace(/[-:T]/g, "");
      link.download = `purro-leaderboard-${displayName.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}-${timestamp}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating image:", err);
    }
  }, [traderData, templateId, hlName, timeframe, generatedTime]);

  const shareOnX = useCallback(() => {
    const text = `${getRankEmoji(traderData.rank)} Just hit rank #${
      traderData.rank
    } on @purro_xyz leaderboard! 

📊 ${traderData.points.toLocaleString()} points
💰 ${formatVolume(traderData.volume_usd)} volume
🔄 ${traderData.transactions.toLocaleString()} transactions

Ready to climb the ranks? 🐱

#Purro #DeFi #Hyperliquid`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank");
  }, [traderData]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#021919] border border-gray-700/30 rounded-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between py-2 px-4 border-b border-gray-700/30 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Share Your Achievement
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 touch-manipulation"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Preview Card */}
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Preview
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                This is how your leaderboard card will look when shared
              </p>
            </div>

            {/* Shareable Card */}
            <div className="overflow-hidden rounded-lg border border-gray-600/20">
              <div
                ref={cardRef}
                className="border border-gray-700/50 rounded-xl p-4 sm:p-6 lg:p-8 relative overflow-hidden w-full transition-all duration-300 flex justify-center items-center"
                style={{
                  aspectRatio: "16/9",
                  minHeight: "200px",
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0">
                  {(() => {
                    const selectedTemplate = getTemplate(templateId);
                    if (selectedTemplate) {
                      return (
                        <img
                          src={selectedTemplate.img}
                          alt={selectedTemplate.name}
                          className="w-full h-full object-cover transition-all duration-500"
                        />
                      );
                    }
                    return <div className="w-full h-full bg-gray-800"></div>;
                  })()}
                </div>

                {/* Main Content */}
                <div className="relative z-10 text-center w-full">
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 rounded-xl"></div>
                  <div className="relative z-10">
                    {/* Rank Badge */}
                    <div className="flex items-center justify-center mb-2">
                      <div className="relative">
                        <div
                          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm border"
                          style={{
                            backgroundColor:
                              getTemplate(templateId)?.mode === "light"
                                ? "rgba(255, 255, 255, 0.9)"
                                : "rgba(0, 0, 0, 0.6)",
                            borderColor:
                              getTemplate(templateId)?.colors.primary + "40",
                            boxShadow: `0 4px 12px ${
                              getTemplate(templateId)?.colors.primary
                            }20`,
                          }}
                        >
                          <div
                            className="text-sm sm:text-lg font-bold"
                            style={{
                              color: getTemplate(templateId)?.colors.primary,
                            }}
                          >
                            #{traderData.rank}
                          </div>
                          <div className="text-base sm:text-xl">
                            {getRankEmoji(traderData.rank)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address/Name */}
                    <div className="mb-3 sm:mb-4">
                      <div
                        className="text-base sm:text-xl font-bold mb-2"
                        style={{
                          color:
                            getTemplate(templateId)?.mode === "light"
                              ? "#2C3E50"
                              : "#FFFFFF",
                        }}
                      >
                        {hlName || formatAddress(traderData.address)}
                      </div>
                      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                        <div
                          className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              getTemplate(templateId)?.colors.primary + "20",
                            color: getTemplate(templateId)?.colors.primary,
                          }}
                        >
                          Purro Leaderboard
                        </div>
                        <div
                          className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              getTemplate(templateId)?.mode === "light"
                                ? "rgba(0, 0, 0, 0.1)"
                                : "rgba(255, 255, 255, 0.1)",
                            color:
                              getTemplate(templateId)?.mode === "light"
                                ? "#666666"
                                : "#CCCCCC",
                          }}
                        >
                          {timeframe === "all"
                            ? "All Time"
                            : timeframe.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4 sm:mb-6">
                      <div
                        className="rounded-lg sm:rounded-xl p-1.5 sm:p-3 backdrop-blur-sm text-center min-w-0"
                        style={{
                          backgroundColor:
                            getTemplate(templateId)?.mode === "light"
                              ? "rgba(255, 255, 255, 0.8)"
                              : "rgba(0, 0, 0, 0.4)",
                          border: `1px solid ${
                            getTemplate(templateId)?.colors.primary
                          }30`,
                          boxShadow: `0 2px 8px ${
                            getTemplate(templateId)?.colors.primary
                          }10`,
                        }}
                      >
                        <div
                          className="text-sm sm:text-lg lg:text-xl font-bold mb-0.5 sm:mb-1 truncate"
                          style={{
                            color: getTemplate(templateId)?.colors.primary,
                          }}
                          title={traderData.points.toLocaleString()}
                        >
                          {traderData.points.toLocaleString()}
                        </div>
                        <div
                          className="text-xs font-medium uppercase tracking-wider truncate"
                          style={{
                            color:
                              getTemplate(templateId)?.mode === "light"
                                ? "#666666"
                                : "#CCCCCC",
                          }}
                        >
                          Points
                        </div>
                      </div>
                      <div
                        className="rounded-lg sm:rounded-xl p-1.5 sm:p-3 backdrop-blur-sm text-center min-w-0"
                        style={{
                          backgroundColor:
                            getTemplate(templateId)?.mode === "light"
                              ? "rgba(255, 255, 255, 0.8)"
                              : "rgba(0, 0, 0, 0.4)",
                          border: `1px solid ${
                            getTemplate(templateId)?.colors.primary
                          }30`,
                          boxShadow: `0 2px 8px ${
                            getTemplate(templateId)?.colors.primary
                          }10`,
                        }}
                      >
                        <div
                          className="text-sm sm:text-lg lg:text-xl font-bold mb-0.5 sm:mb-1 truncate"
                          style={{
                            color: getTemplate(templateId)?.colors.primary,
                          }}
                          title={formatVolume(traderData.volume_usd)}
                        >
                          {formatVolume(traderData.volume_usd)}
                        </div>
                        <div
                          className="text-xs font-medium uppercase tracking-wider truncate"
                          style={{
                            color:
                              getTemplate(templateId)?.mode === "light"
                                ? "#666666"
                                : "#CCCCCC",
                          }}
                        >
                          Volume
                        </div>
                      </div>
                      <div
                        className="rounded-lg sm:rounded-xl p-1.5 sm:p-3 backdrop-blur-sm text-center min-w-0"
                        style={{
                          backgroundColor:
                            getTemplate(templateId)?.mode === "light"
                              ? "rgba(255, 255, 255, 0.8)"
                              : "rgba(0, 0, 0, 0.4)",
                          border: `1px solid ${
                            getTemplate(templateId)?.colors.primary
                          }30`,
                          boxShadow: `0 2px 8px ${
                            getTemplate(templateId)?.colors.primary
                          }10`,
                        }}
                      >
                        <div
                          className="text-sm sm:text-lg lg:text-xl font-bold mb-0.5 sm:mb-1 truncate"
                          style={{
                            color: getTemplate(templateId)?.colors.primary,
                          }}
                          title={traderData.transactions.toLocaleString()}
                        >
                          {traderData.transactions.toLocaleString()}
                        </div>
                        <div
                          className="text-xs font-medium uppercase tracking-wider truncate"
                          style={{
                            color:
                              getTemplate(templateId)?.mode === "light"
                                ? "#666666"
                                : "#CCCCCC",
                          }}
                        >
                          Trades
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center">
                      <div
                        className="text-xs sm:text-sm font-medium mb-1"
                        style={{
                          color:
                            getTemplate(templateId)?.mode === "light"
                              ? "#2C3E50"
                              : "#FFFFFF",
                        }}
                      >
                        purro.xyz • The Purr-fect Web3 Wallet
                      </div>
                      <div
                        className="text-xs opacity-70"
                        style={{
                          color:
                            getTemplate(templateId)?.mode === "light"
                              ? "#666666"
                              : "#CCCCCC",
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
              </div>
            </div>
          </div>

          {/* Template Selector */}
          <div className="p-4 border-t border-gray-700/30">
            <TemplateManager
              templates={templates}
              selectedTemplateId={templateId}
              onTemplateSelect={setTemplateId}
            />
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="px-4 py-2 border-t border-gray-700/30 flex-shrink-0 bg-[#021919]">
          <div className="flex gap-3">
            <Button
              onClick={downloadImage}
              className="flex-1 bg-gray-800/40 hover:bg-gray-700/40 border border-gray-600/30 hover:border-gray-500/30 text-white transition-all touch-manipulation min-h-[44px]"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm sm:text-base">Download</span>
            </Button>
            <Button
              onClick={shareOnX}
              className="flex-1 touch-manipulation min-h-[44px]"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-sm sm:text-base">Share on X</span>
            </Button>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm mt-3 sm:mt-4 text-center">
            💡 Share your trading achievements and inspire others! 🐱
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
