import React, { useRef, useCallback } from "react";
import { toPng } from "html-to-image";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  traderData: {
    address: string;
    rank: number;
    points: number;
    volume_usd: number;
    transactions: number;
    tokens: number;
  };
  timeframe: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  traderData,
  timeframe,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`;
    } else {
      return `$${volume.toFixed(2)}`;
    }
  };

  const getRankStyle = (rank: number) => {
    if (rank <= 3) return "bg-yellow-500 text-black";
    if (rank <= 10) return "bg-purple-600 text-white";
    if (rank <= 50) return "bg-blue-600 text-white";
    return "bg-gray-600 text-white";
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    if (rank <= 10) return "💎";
    if (rank <= 50) return "🚀";
    return "⭐";
  };

  const downloadImage = useCallback(async () => {
    if (cardRef.current === null) {
      return;
    }

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: 800,
        height: 600,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      const link = document.createElement("a");
      link.download = `purro-leaderboard-${formatAddress(
        traderData.address
      )}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating image:", err);
    }
  }, [traderData.address]);

  const shareOnX = useCallback(() => {
    const text = `${getRankEmoji(traderData.rank)} Just hit rank #${
      traderData.rank
    } on @PurroHQ leaderboard! 

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#021919] border border-gray-700/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
          <h2 className="text-xl font-bold text-white">
            Share Your Achievement
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <svg
              className="w-6 h-6"
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

        {/* Preview Card */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Preview</h3>
            <p className="text-gray-400 text-sm">
              This is how your leaderboard card will look when shared
            </p>
          </div>

          {/* Shareable Card */}
          <div
            ref={cardRef}
            className="bg-gradient-to-br from-[#021919] via-[#0e2a2a] to-[#081919] border border-gray-700/50 rounded-xl p-8 relative overflow-hidden"
            style={{
              width: "800px",
              height: "600px",
              margin: "0 auto",
              transform: "scale(0.6)",
              transformOrigin: "top center",
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/3 rounded-full blur-2xl"></div>
            </div>

            {/* Logo */}
            <div className="relative z-10 flex items-center justify-center mb-8">
              <div className="text-3xl font-bold text-white">PURRO</div>
              <div className="ml-2 text-2xl">🐱</div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center">
              {/* Rank Badge */}
              <div className="flex items-center justify-center mb-6">
                <div
                  className={`${getRankStyle(
                    traderData.rank
                  )} px-6 py-3 rounded-full text-2xl font-bold`}
                >
                  #{traderData.rank}
                </div>
                <div className="ml-3 text-4xl">
                  {getRankEmoji(traderData.rank)}
                </div>
              </div>

              {/* Address */}
              <div className="mb-8">
                <div className="text-2xl font-bold text-white mb-2">
                  {formatAddress(traderData.address)}
                </div>
                <div className="text-gray-400 text-lg">
                  Purro Leaderboard{" "}
                  {timeframe === "all" ? "All Time" : timeframe.toUpperCase()}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-black/20 border border-gray-700/30 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    {traderData.points.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-lg">Points</div>
                </div>
                <div className="bg-black/20 border border-gray-700/30 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatVolume(traderData.volume_usd)}
                  </div>
                  <div className="text-gray-400 text-lg">Volume</div>
                </div>
                <div className="bg-black/20 border border-gray-700/30 rounded-lg p-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    {traderData.transactions.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-lg">Trades</div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-gray-500 text-lg">
                purro.xyz • Hyperliquid Trading Leaderboard
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-700/30">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadImage}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700/30 hover:bg-gray-600/30 text-white rounded-lg transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
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
              Download Image
            </button>
            <button
              onClick={shareOnX}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-3 text-center">
            Show off your trading achievements to the community! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
