import React, { useState, useEffect } from "react";

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
  volume_usd: number;
  timestamp: string;
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
}

interface TraderResponse {
  success: boolean;
  data: TraderData;
}

interface TraderDetailReactProps {
  address: string;
}

const TraderDetailReact: React.FC<TraderDetailReactProps> = ({ address }) => {
  const [traderData, setTraderData] = useState<TraderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTraderData();
  }, [address]);

  const fetchTraderData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.purro.xyz/leaderboard/trader/${address}?timeframe=7d`
      );

      if (!response.ok) {
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
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

  // Skeleton components
  const SkeletonCard = () => (
    <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
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
    <div className="bg-gray-800/50 rounded-lg p-6">
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
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 text-center">
            <div className="text-red-400 text-lg mb-2">
              ⚠️ Error Loading Trader Data
            </div>
            <p className="text-red-300 mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={fetchTraderData}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
              <a
                href="/leaderboard"
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Back to Leaderboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!traderData) {
    return null;
  }

  return (
    <div className="min-h-screen pt-32 bg-gradient-to-b from-[#021919] via-[#0e2a2a] to-[#081919] relative py-20">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <a href="/" className="hover:text-cyan-400 transition-colors">
              Home
            </a>
            <span>/</span>
            <a
              href="/leaderboard"
              className="hover:text-cyan-400 transition-colors"
            >
              Leaderboard
            </a>
            <span>/</span>
            <span className="text-white">{formatAddress(address)}</span>
          </nav>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="scroll-animate">
            <h1 className="text-4xl md:text-6xl text-white font-semibold mb-4">
              Trader Details
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6">
              Detailed performance and activity for {formatAddress(address)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="scroll-animate delay-200">
          <div className="space-y-8">
            {loading ? (
              // Show skeleton when loading
              <>
                <SkeletonCard />
                <SkeletonCard />
                <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
                  <div className="h-6 bg-gray-700 rounded w-32 animate-pulse mb-6"></div>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <SkeletonActivity key={index} />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="h-10 bg-gray-700 rounded w-40 animate-pulse mx-auto"></div>
                </div>
              </>
            ) : traderData ? (
              // Show actual data when loaded
              <>
                {/* Trader Overview */}
                <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {address.slice(2, 4).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl font-semibold text-white mb-2">
                        {formatAddress(address)}
                      </h2>
                      <p className="text-gray-400 font-mono text-sm break-all">
                        {address}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400 mb-2">
                        #{traderData.rank}
                      </div>
                      <div className="text-gray-400 text-sm">Rank</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        {traderData.points.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-sm">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">
                        {formatVolume(traderData.volume_usd)}
                      </div>
                      <div className="text-gray-400 text-sm">Volume</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400 mb-2">
                        {traderData.transactions}
                      </div>
                      <div className="text-gray-400 text-sm">Transactions</div>
                    </div>
                  </div>
                </div>

                {/* Point Breakdown */}
                <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
                  <h3 className="text-2xl font-semibold text-white mb-6">
                    Point Breakdown
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-700">
                      <span className="text-gray-300 text-lg">From Volume</span>
                      <span className="text-blue-400 font-semibold text-lg">
                        {traderData.point_breakdown.from_volume}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-700">
                      <span className="text-gray-300 text-lg">
                        From Transactions
                      </span>
                      <span className="text-green-400 font-semibold text-lg">
                        {traderData.point_breakdown.from_transactions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-700">
                      <span className="text-gray-300 text-lg">
                        From Unique Tokens
                      </span>
                      <span className="text-purple-400 font-semibold text-lg">
                        {traderData.point_breakdown.from_unique_tokens}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-4 bg-gray-800/30 rounded-lg px-4">
                      <span className="text-white font-semibold text-xl">
                        Total
                      </span>
                      <span className="text-cyan-400 font-bold text-2xl">
                        {traderData.point_breakdown.total}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
                  <h3 className="text-2xl font-semibold text-white mb-6">
                    Recent Activity
                  </h3>
                  {traderData.recent_activity &&
                  traderData.recent_activity.length > 0 ? (
                    <div className="space-y-4">
                      {traderData.recent_activity.map((activity) => (
                        <div
                          key={activity.hash}
                          className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                            <div className="flex items-center gap-3 mb-2 md:mb-0">
                              <span className="text-cyan-400 font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                                {activity.hash.slice(0, 8)}...
                              </span>
                              <span className="text-gray-400 text-sm">
                                Block {activity.block_number}
                              </span>
                            </div>
                            <span className="text-gray-400 text-sm">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-white font-semibold text-lg">
                              {activity.dex_name}
                            </span>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-300 bg-gray-700 px-2 py-1 rounded text-sm">
                                {activity.token_in_symbol}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="text-gray-300 bg-gray-700 px-2 py-1 rounded text-sm">
                                {activity.token_out_symbol}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                            <div className="text-gray-400 text-sm">
                              Volume:{" "}
                              <span className="text-green-400 font-semibold">
                                {formatVolume(activity.volume_usd)}
                              </span>
                            </div>
                            <a
                              href={`https://explorer.sui.io/txblock/${activity.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                            >
                              View on Sui Explorer →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-lg">
                        No recent activity found
                      </p>
                    </div>
                  )}
                </div>

                {/* Back Button */}
                <div className="text-center">
                  <a
                    href="/leaderboard"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
                  >
                    ← Back to Leaderboard
                  </a>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraderDetailReact;
