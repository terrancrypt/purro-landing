import React, { useState, useEffect, useCallback } from "react";

interface HLName {
  address: string;
  primaryName: string;
  namehash: string;
  tokenid: string;
}

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

type TimeframeOption = "1d" | "7d" | "30d" | "all";

const LeaderboardReact: React.FC = () => {
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeOption>("7d");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchAddress, setSearchAddress] = useState("");
  const [limit] = useState(20);
  const [hlNames, setHlNames] = useState<Map<string, string>>(new Map());

  const fetchHLNames = useCallback(async () => {
    try {
      const response = await fetch(
        "https://api.hlnames.xyz/utils/all_primary_names",
        {
          headers: {
            accept: "application/json",
            "X-API-Key": "CPEPKMI-HUSUX6I-SE2DHEA-YYWFG5Y",
          },
        }
      );

      if (!response.ok) {
        console.warn("Failed to fetch HL Names:", response.status);
        return;
      }

      const hlNamesData: HLName[] = await response.json();
      const namesMap = new Map<string, string>();

      hlNamesData.forEach((item) => {
        namesMap.set(item.address.toLowerCase(), item.primaryName);
      });

      setHlNames(namesMap);
    } catch (err) {
      console.warn("Error fetching HL Names:", err);
    }
  }, []);

  const fetchLeaderboardData = useCallback(
    async (
      page: number = 1,
      selectedTimeframe: TimeframeOption = timeframe
    ) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          timeframe: selectedTimeframe,
          limit: limit.toString(),
          page: page.toString(),
        });

        if (searchAddress.trim()) {
          params.append("search", searchAddress.trim());
        }

        const response = await fetch(
          `https://api.purro.xyz/api/v1/leaderboard?${params}`
        );

        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }

        const result: LeaderboardResponse = await response.json();

        if (result.success) {
          setLeaderboardData(result.data);
          setCurrentPage(page);
        } else {
          throw new Error("Failed to fetch leaderboard data");
        }
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
        setError(err instanceof Error ? err.message : "Network error occurred");
      } finally {
        setLoading(false);
      }
    },
    [timeframe, searchAddress, limit]
  );

  useEffect(() => {
    fetchHLNames();
  }, [fetchHLNames]);

  useEffect(() => {
    fetchLeaderboardData(1, timeframe);
  }, [fetchLeaderboardData, timeframe]);

  const getDisplayName = useCallback(
    (address: string) => {
      const hlName = hlNames.get(address.toLowerCase());
      return hlName || formatAddress(address);
    },
    [hlNames]
  );

  const handleTimeframeChange = (newTimeframe: TimeframeOption) => {
    setTimeframe(newTimeframe);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    fetchLeaderboardData(page, timeframe);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLeaderboardData(1, timeframe);
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

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-black";
    if (rank === 2) return "bg-gray-400 text-black";
    if (rank === 3) return "bg-amber-600 text-white";
    return "bg-gray-600 text-white";
  };

  // Skeleton component for table rows
  const SkeletonRow = () => (
    <tr className="border-t border-gray-700/30">
      <td className="px-6 py-4">
        <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
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
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 text-center">
            <div className="text-red-400 text-lg mb-2">
              Error Loading Leaderboard
            </div>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => fetchLeaderboardData(currentPage, timeframe)}
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
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl text-white font-bold mb-3">
            Leaderboard
          </h1>
          <p className="text-base md:text-lg text-gray-300 mb-4">
            Top traders and users on Purro
          </p>
          {leaderboardData && (
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    leaderboardData.sync_info.sync_in_progress
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                ></div>
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
            </div>
          )}
        </div>

        {/* Point System Description */}
        <div className="mb-6">
          <div className="bg-black/10 border border-gray-700/30 rounded-lg p-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-[#02f1dc] font-medium">0.1 pts</span>
                <span className="text-gray-400">per $1 volume</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#02f1dc] font-medium">100 pts</span>
                <span className="text-gray-400">per transaction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#02f1dc] font-medium">25 pts</span>
                <span className="text-gray-400">per unique token</span>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Controls */}
        <div className="mb-6">
          <div className="bg-black/10 border border-gray-700/30 rounded-lg p-5">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Timeframe Filter */}
              <div className="flex flex-wrap gap-2">
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

              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search address..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-600/30 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/50"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-white text-black rounded-md transition-colors hover:bg-gray-100 text-sm font-medium"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div>
          <div className="bg-black/10 backdrop-blur-sm border border-gray-700/30 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                      Address
                    </th>
                    <th className="px-4 py-3 text-right text-gray-300 text-sm font-medium">
                      Points
                    </th>
                    <th className="px-4 py-3 text-right text-gray-300 text-sm font-medium">
                      Volume
                    </th>
                    <th className="px-4 py-3 text-right text-gray-300 text-sm font-medium">
                      Txs
                    </th>
                    <th className="px-4 py-3 text-right text-gray-300 text-sm font-medium">
                      Tokens
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: limit }).map((_, index) => (
                        <SkeletonRow key={index} />
                      ))
                    : leaderboardData
                    ? leaderboardData.rankings.map((user) => (
                        <tr
                          key={user.address}
                          className="border-t border-gray-700/20 hover:bg-gray-800/10 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div
                              className={`w-7 h-7 ${getRankStyle(
                                user.rank
                              )} rounded-full flex items-center justify-center font-medium text-xs`}
                            >
                              {user.rank}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={`/leaderboard/${user.address}`}
                              className="flex items-center gap-2 hover:bg-gray-800/20 p-2 rounded-md transition-colors w-full text-left group"
                            >
                              <div>
                                <div className="text-white font-mono text-sm group-hover:text-gray-200 transition-colors">
                                  {getDisplayName(user.address)}
                                  {hlNames.has(user.address.toLowerCase()) && (
                                    <span className="ml-2 text-xs text-[#02f1dc] bg-[#02f1dc]/10 px-1.5 py-0.5 rounded">
                                      HL
                                    </span>
                                  )}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  View details
                                </div>
                              </div>
                            </a>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-white font-medium text-sm">
                              {user.points.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-gray-300 text-sm">
                              {formatVolume(user.volume_usd)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-gray-300 text-sm">
                              {user.transactions.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-gray-300 text-sm">
                              {user.tokens}
                            </span>
                          </td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Simple Pagination */}
        {!loading && leaderboardData?.pagination && (
          <div className="mt-5 flex justify-center">
            <div className="flex gap-2 items-center">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-gray-700/30 hover:bg-gray-600/30 disabled:bg-gray-800/30 disabled:text-gray-600 text-white rounded-md transition-colors text-xs"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!leaderboardData.pagination.has_prev}
                className="px-3 py-1.5 bg-gray-700/30 hover:bg-gray-600/30 disabled:bg-gray-800/30 disabled:text-gray-600 text-white rounded-md transition-colors text-xs"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 bg-white text-black rounded-md font-medium text-xs">
                {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!leaderboardData.pagination.has_next}
                className="px-3 py-1.5 bg-gray-700/30 hover:bg-gray-600/30 disabled:bg-gray-800/30 disabled:text-gray-600 text-white rounded-md transition-colors text-xs"
              >
                Next
              </button>
              <button
                onClick={() =>
                  handlePageChange(leaderboardData.pagination.total_pages)
                }
                disabled={
                  currentPage === leaderboardData.pagination.total_pages
                }
                className="px-3 py-1.5 bg-gray-700/30 hover:bg-gray-600/30 disabled:bg-gray-800/30 disabled:text-gray-600 text-white rounded-md transition-colors text-xs"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardReact;
