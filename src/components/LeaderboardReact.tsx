import React, { useState, useEffect } from "react";

interface Trader {
  rank: number;
  address: string;
  points: number;
  volume_usd: number;
  transactions: number;
  tokens: number;
}

interface LeaderboardData {
  timeframe: string;
  rankings: Trader[];
  pagination: {
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  sync_info: {
    last_sync_time: string;
    next_sync_time: string;
    seconds_to_next: number;
    sync_in_progress: boolean;
    last_synced_block: number;
    current_block: number;
  };
}

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardData;
}

const LeaderboardReact: React.FC = () => {
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://api.purro.xyz/leaderboard?timeframe=7d&limit=20"
      );

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const result: LeaderboardResponse = await response.json();

      if (result.success) {
        setLeaderboardData(result.data);
      } else {
        throw new Error("Failed to fetch leaderboard data");
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-black text-sm font-bold">👑</span>;
      case 2:
        return <span className="text-black text-sm font-bold">🥈</span>;
      case 3:
        return <span className="text-white text-sm font-bold">🥉</span>;
      default:
        return (
          <span className="text-gray-300 text-sm font-medium">{rank}</span>
        );
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-800";
      default:
        return "bg-gray-700";
    }
  };

  // Skeleton component for table rows
  const SkeletonRow = () => (
    <tr className="border-t border-gray-800">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
          <div>
            <div className="h-4 bg-gray-700 rounded w-20 animate-pulse mb-1"></div>
            <div className="h-3 bg-gray-700 rounded w-24 animate-pulse"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-4 bg-gray-700 rounded w-16 animate-pulse ml-auto"></div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-4 bg-gray-700 rounded w-12 animate-pulse ml-auto"></div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-4 bg-gray-700 rounded w-8 animate-pulse ml-auto"></div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-4 bg-gray-700 rounded w-8 animate-pulse ml-auto"></div>
      </td>
    </tr>
  );

  if (error) {
    return (
      <div className="min-h-screen pt-32 bg-gradient-to-b from-[#021919] via-[#0e2a2a] to-[#081919] relative py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 text-center">
            <div className="text-red-400 text-lg mb-2">
              ⚠️ Error Loading Leaderboard
            </div>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchLeaderboardData}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 bg-gradient-to-b from-[#021919] via-[#0e2a2a] to-[#081919] relative py-20">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="scroll-animate">
            <h1 className="text-4xl md:text-6xl text-white font-semibold mb-4">
              Leaderboard
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6">
              Top traders and users on Purro
            </p>
            {leaderboardData ? (
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    Last sync:{" "}
                    {formatTimeAgo(leaderboardData.sync_info.last_sync_time)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>
                    Block:{" "}
                    {leaderboardData.sync_info.current_block.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Timeframe: {leaderboardData.timeframe}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="scroll-animate delay-200">
          <div className="space-y-6">
            {/* Rankings Table */}
            <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-gray-300 font-medium">
                        Address
                      </th>
                      <th className="px-6 py-4 text-right text-gray-300 font-medium">
                        Points
                      </th>
                      <th className="px-6 py-4 text-right text-gray-300 font-medium">
                        Volume
                      </th>
                      <th className="px-6 py-4 text-right text-gray-300 font-medium">
                        Transactions
                      </th>
                      <th className="px-6 py-4 text-right text-gray-300 font-medium">
                        Tokens
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? // Show skeleton rows when loading
                        Array.from({ length: 10 }).map((_, index) => (
                          <SkeletonRow key={index} />
                        ))
                      : leaderboardData
                      ? // Show actual data when loaded
                        leaderboardData.rankings.map((user) => (
                          <tr
                            key={user.address}
                            className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 ${getRankBgColor(
                                    user.rank
                                  )} rounded-full flex items-center justify-center`}
                                >
                                  {getRankIcon(user.rank)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <a
                                href={`/leaderboard/${user.address}`}
                                className="flex items-center gap-3 hover:bg-gray-800/50 p-2 rounded-lg transition-colors w-full text-left"
                              >
                                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {user.address.slice(2, 4).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-white font-mono text-sm">
                                    {formatAddress(user.address)}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    Click to view details
                                  </div>
                                </div>
                              </a>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-cyan-400 font-semibold">
                                {user.points.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-green-400 font-semibold">
                                {formatVolume(user.volume_usd)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-white">
                                {user.transactions}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-white">{user.tokens}</span>
                            </td>
                          </tr>
                        ))
                      : null}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Info */}
            {loading ? (
              <div className="flex justify-between items-center text-gray-400 text-sm">
                <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
                  <div className="h-8 bg-gray-700 rounded w-16 animate-pulse"></div>
                  <div className="h-8 bg-gray-700 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            ) : leaderboardData?.pagination ? (
              <div className="flex justify-between items-center text-gray-400 text-sm">
                <div>
                  Showing {leaderboardData.rankings.length} of{" "}
                  {leaderboardData.pagination.total_pages *
                    leaderboardData.pagination.limit}{" "}
                  users
                </div>
                <div className="flex gap-2">
                  {leaderboardData.pagination.has_prev && (
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                      Previous
                    </button>
                  )}
                  <span className="px-4 py-2 bg-cyan-600 text-white rounded-lg">
                    Page {leaderboardData.pagination.page}
                  </span>
                  {leaderboardData.pagination.has_next && (
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                      Next
                    </button>
                  )}
                </div>
              </div>
            ) : null}

            {/* Sync Status */}
            <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-3 h-3 bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
                    </>
                  ) : leaderboardData ? (
                    <>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          leaderboardData.sync_info.sync_in_progress
                            ? "bg-yellow-500 animate-pulse"
                            : "bg-green-500"
                        }`}
                      ></div>
                      <span className="text-gray-300">
                        {leaderboardData.sync_info.sync_in_progress
                          ? "Syncing..."
                          : "Synced"}
                      </span>
                    </>
                  ) : null}
                </div>
                <div className="text-gray-400 text-sm">
                  {loading ? (
                    <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                  ) : leaderboardData ? (
                    `Next sync in ${leaderboardData.sync_info.seconds_to_next}s`
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardReact;
