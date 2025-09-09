import React, { useState, useEffect, useCallback } from "react";
import { truncateAddress } from "../lib/utils";
import ShareModal from "./ShareModal";

interface PointBreakdown {
  from_volume: number;
  from_transactions: number;
  from_unique_tokens: number;
  total: number;
}

interface RecentActivity {
  hash: string;
  block_number: number;
  user_address: string;
  dex_address: string;
  dex_name: string;
  token_in_address: string;
  token_out_address: string;
  token_in_symbol: string;
  token_out_symbol: string;
  amount_in: string;
  amount_out: string;
  amount_in_decimal: number;
  amount_out_decimal: number;
  token_in_price_usd: number;
  token_out_price_usd: number;
  volume_usd: number;
  timestamp: number;
}

interface TraderData {
  address: string;
  rank: number;
  points: number;
  volume_usd: number;
  transactions: number;
  tokens: number;
  point_breakdown: PointBreakdown;
  recent_activity: RecentActivity[];
  start_time: number;
  end_time: number;
}

interface TraderResponse {
  success: boolean;
  data: TraderData;
}

interface TraderDetailReactProps {
  address: string;
}

type TimeframeOption = "1d" | "7d" | "30d" | "all";

const TraderDetailReact: React.FC<TraderDetailReactProps> = ({ address }) => {
  const [traderData, setTraderData] = useState<TraderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeOption>("7d");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const fetchTraderData = useCallback(
    async (selectedTimeframe: TimeframeOption = timeframe) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          timeframe: selectedTimeframe,
        });

        const response = await fetch(
          `https://api.purro.xyz/api/v1/leaderboard/trader/${address}?${params}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Trader not found in the leaderboard");
          }
          throw new Error(`API request failed with status: ${response.status}`);
        }

        const result: TraderResponse = await response.json();

        if (result.success) {
          setTraderData(result.data);
        } else {
          throw new Error("Failed to fetch trader data");
        }
      } catch (err) {
        console.error("Trader fetch error:", err);
        setError(err instanceof Error ? err.message : "Network error occurred");
      } finally {
        setLoading(false);
      }
    },
    [address, timeframe]
  );

  useEffect(() => {
    fetchTraderData(timeframe);
  }, [fetchTraderData, timeframe]);

  const handleTimeframeChange = (newTimeframe: TimeframeOption) => {
    setTimeframe(newTimeframe);
  };

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

  const formatTimeAgo = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
  };

  const formatAmount = (amount: string, decimals: number = 6) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    } else {
      return num.toFixed(decimals);
    }
  };

  const getRankStyle = (rank: number) => {
    if (rank <= 3) return "bg-yellow-500 text-black";
    if (rank <= 10) return "bg-purple-600 text-white";
    if (rank <= 50) return "bg-blue-600 text-white";
    return "bg-gray-600 text-white";
  };

  // Skeleton components
  const SkeletonCard = () => (
    <div className="bg-black/10 border border-gray-700/30 rounded-xl p-8">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="w-24 h-24 bg-gray-700 rounded-full animate-pulse"></div>
        <div className="text-center md:text-left">
          <div className="h-6 bg-gray-700 rounded w-32 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-48 animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="text-center">
            <div className="h-8 bg-gray-700 rounded w-16 animate-pulse mb-2 mx-auto"></div>
            <div className="h-4 bg-gray-700 rounded w-12 animate-pulse mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const SkeletonActivity = () => (
    <div className="bg-gray-800/20 rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <div className="h-6 bg-gray-700 rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
        </div>
        <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 bg-gray-700 rounded w-20 animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-4 animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="h-6 bg-gray-700 rounded w-12 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-4 animate-pulse"></div>
          <div className="h-6 bg-gray-700 rounded w-12 animate-pulse"></div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen pt-32 bg-gradient-to-b from-[#021919] via-[#0e2a2a] to-[#081919] relative py-20">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 text-center">
            <div className="text-red-400 text-xl mb-2">
              Error Loading Trader Data
            </div>
            <p className="text-red-300 mb-6 text-lg">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => fetchTraderData(timeframe)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Try Again
              </button>
              <a
                href="/leaderboard"
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
              >
                Back to Leaderboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#021919] via-[#0e2a2a] to-[#081919] relative py-20">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <a href="/" className="hover:text-white transition-colors">
              Home
            </a>
            <span>/</span>
            <a
              href="/leaderboard"
              className="hover:text-white transition-colors"
            >
              Leaderboard
            </a>
            <span>/</span>
            <span className="text-white">{formatAddress(address)}</span>
          </nav>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl text-white font-bold mb-3">
            Trader Profile
          </h1>
          <p className="text-base md:text-lg text-gray-300 mb-4">
            Performance analytics for {formatAddress(address)}
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="mb-6">
          <div className="bg-black/10 border border-gray-700/30 rounded-lg p-5">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                {(["1d", "7d", "30d", "all"] as TimeframeOption[]).map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => handleTimeframeChange(option)}
                      className={`px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                        timeframe === option
                          ? "bg-white text-black"
                          : "bg-gray-700/30 text-gray-300 hover:bg-gray-600/30"
                      }`}
                    >
                      {option === "all" ? "All Time" : option.toUpperCase()}
                    </button>
                  )
                )}
              </div>

              <div className="flex gap-3 items-center">
                <button
                  onClick={() => fetchTraderData(timeframe)}
                  disabled={loading}
                  className="px-3 py-2 bg-gray-700/30 hover:bg-gray-600/30 text-gray-300 rounded-md transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="space-y-6">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <div className="bg-black/10 border border-gray-700/30 rounded-xl p-8">
                  <div className="h-6 bg-gray-700 rounded w-32 animate-pulse mb-6"></div>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <SkeletonActivity key={index} />
                    ))}
                  </div>
                </div>
              </>
            ) : traderData ? (
              <>
                {/* Trader Overview */}
                <div className="bg-black/10 border border-gray-700/30 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {address.slice(2, 4).toUpperCase()}
                        </span>
                      </div>
                      <div
                        className={`absolute -top-1 -right-1 w-6 h-6 ${getRankStyle(
                          traderData.rank
                        )} rounded-full flex items-center justify-center text-xs font-medium`}
                      >
                        #{traderData.rank}
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <h2 className="text-xl font-semibold text-white mb-1">
                        {formatAddress(address)}
                      </h2>
                      <p className="text-gray-400 font-mono text-xs break-all mb-2">
                        {address}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <button
                          onClick={() => navigator.clipboard.writeText(address)}
                          className="hover:text-white transition-colors"
                          title="Copy address"
                        >
                          Copy
                        </button>
                        <span>•</span>
                        <a
                          href={`https://hyperevmscan.io/address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors"
                        >
                          Explorer
                        </a>
                        <span>•</span>
                        <button
                          onClick={() => setIsShareModalOpen(true)}
                          className="hover:text-white transition-colors"
                          title="Share achievement"
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center bg-gray-800/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white mb-1">
                        #{traderData.rank}
                      </div>
                      <div className="text-gray-400 text-xs">Global Rank</div>
                    </div>
                    <div className="text-center bg-gray-800/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white mb-1">
                        {traderData.points.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-xs">Total Points</div>
                    </div>
                    <div className="text-center bg-gray-800/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white mb-1">
                        {formatVolume(traderData.volume_usd)}
                      </div>
                      <div className="text-gray-400 text-xs">Volume Traded</div>
                    </div>
                    <div className="text-center bg-gray-800/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white mb-1">
                        {traderData.transactions.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-xs">Transactions</div>
                    </div>
                  </div>

                  {/* Share Achievement Button */}
                  <div className="text-center">
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Share Achievement
                    </button>
                  </div>
                </div>

                {/* Point Breakdown */}
                <h3 className="text-xl font-semibold text-white mb-4">
                  Point Breakdown
                  <span className="text-xs bg-gray-700/30 text-gray-300 px-2 py-1 rounded ml-2">
                    {timeframe === "all" ? "All Time" : timeframe.toUpperCase()}
                  </span>
                </h3>
                <div className="bg-black/10 border border-gray-700/30 rounded-lg p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-gray-700/30">
                      <span className="text-gray-300 text-sm">
                        Volume Points
                      </span>
                      <span className="text-white font-medium text-sm">
                        {traderData.point_breakdown.from_volume.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-700/30">
                      <span className="text-gray-300 text-sm">
                        Transaction Points
                      </span>
                      <span className="text-white font-medium text-sm">
                        {traderData.point_breakdown.from_transactions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-700/30">
                      <span className="text-gray-300 text-sm">
                        Diversity Points
                      </span>
                      <span className="text-white font-medium text-sm">
                        {traderData.point_breakdown.from_unique_tokens.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-gray-800/20 rounded-lg px-3">
                      <span className="text-white font-semibold text-base">
                        Total Points
                      </span>
                      <span className="text-white font-bold text-lg">
                        {traderData.point_breakdown.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Recent Activity
                    {traderData.recent_activity &&
                      traderData.recent_activity.length > 0 && (
                        <span className="text-xs bg-gray-700/30 text-gray-300 px-2 py-1 rounded ml-2">
                          {traderData.recent_activity.length} transactions
                        </span>
                      )}
                  </h3>
                  {traderData.recent_activity &&
                  traderData.recent_activity.length > 0 ? (
                    <div className="space-y-3">
                      {traderData.recent_activity.map((activity, index) => (
                        <div
                          key={activity.hash}
                          className="bg-gray-800/20 rounded-lg p-4 hover:bg-gray-800/30 transition-all duration-200"
                        >
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                            <div className="flex items-center gap-2 mb-2 md:mb-0">
                              <span className="text-gray-400 font-mono text-xs bg-gray-700/30 px-2 py-1 rounded">
                                #{index + 1}
                              </span>
                              <a
                                href={`https://hyperevmscan.io/tx/${activity.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-gray-300 font-mono text-xs bg-gray-700/30 px-2 py-1 rounded transition-colors"
                              >
                                {truncateAddress(activity.hash, { length: 8 })}
                              </a>
                              <span className="text-gray-400 text-xs">
                                Block {activity.block_number.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-gray-400 text-xs">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-300 bg-gray-700/30 px-2 py-1 rounded text-xs font-medium">
                                {activity.token_in_symbol}
                              </span>
                              <span className="text-gray-400 text-sm">→</span>
                              <span className="text-gray-300 bg-gray-700/30 px-2 py-1 rounded text-xs font-medium">
                                {activity.token_out_symbol}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-gray-700/20 rounded-lg p-2">
                              <div className="text-gray-400 text-xs mb-1">
                                Amount In
                              </div>
                              <div className="text-white font-medium text-sm">
                                {activity.amount_in_decimal.toFixed(6)}{" "}
                                {activity.token_in_symbol}
                              </div>
                              <div className="text-gray-400 text-xs">
                                ${activity.token_in_price_usd.toFixed(4)}
                              </div>
                            </div>
                            <div className="bg-gray-700/20 rounded-lg p-2">
                              <div className="text-gray-400 text-xs mb-1">
                                Amount Out
                              </div>
                              <div className="text-white font-medium text-sm">
                                {activity.amount_out_decimal.toFixed(6)}{" "}
                                {activity.token_out_symbol}
                              </div>
                              <div className="text-gray-400 text-xs">
                                ${activity.token_out_price_usd.toFixed(4)}
                              </div>
                            </div>
                            <div className="bg-gray-700/20 rounded-lg p-2">
                              <div className="text-gray-400 text-xs mb-1">
                                USD Volume
                              </div>
                              <div className="text-white font-medium text-sm">
                                {formatVolume(activity.volume_usd)}
                              </div>
                            </div>
                            <div className="bg-gray-700/20 rounded-lg p-2">
                              <div className="text-gray-400 text-xs mb-1">
                                Exchange Rate
                              </div>
                              <div className="text-white font-medium text-xs">
                                1 {activity.token_in_symbol} ={" "}
                                {(
                                  activity.amount_out_decimal /
                                  activity.amount_in_decimal
                                ).toFixed(6)}{" "}
                                {activity.token_out_symbol}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-lg mb-2">
                        No recent activity found
                      </p>
                      <p className="text-gray-500 text-sm">
                        This trader might be inactive in the selected timeframe
                      </p>
                    </div>
                  )}
                </div>

                {/* Back Button */}
                <div className="text-center">
                  <a
                    href="/leaderboard"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-white text-black rounded-md transition-colors font-medium hover:bg-gray-100 text-sm"
                  >
                    Back to Leaderboard
                  </a>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {traderData && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          traderData={traderData}
          timeframe={timeframe}
        />
      )}
    </div>
  );
};

export default TraderDetailReact;
