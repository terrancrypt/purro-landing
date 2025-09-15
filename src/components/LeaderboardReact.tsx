import React, { useState, useEffect, useCallback, useRef } from "react";

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

interface Transaction {
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

interface TransactionsResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    start_time: number;
    end_time: number;
  };
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);
  const [displayedTransaction, setDisplayedTransaction] =
    useState<Transaction | null>(null);
  const [isShowingTransaction, setIsShowingTransaction] = useState(false);
  const [isDisplayCycleActive, setIsDisplayCycleActive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

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

  // Function to fetch 20 latest transactions
  const fetchTransactionsData = useCallback(async () => {
    try {
      console.log("Fetching transactions data...");
      const response = await fetch(
        "https://api.purro.xyz/api/v1/transactions?page=1&limit=50&sort_by=timestamp&sort_order=desc"
      );

      if (!response.ok) {
        console.error("Failed to fetch transactions:", response.status);
        return;
      }

      const result: TransactionsResponse = await response.json();
      console.log("Transactions data:", result);

      if (result.success && result.data.transactions) {
        // Reverse the array to show from oldest to newest
        const reversedTransactions = [...result.data.transactions].reverse();
        setTransactions(reversedTransactions);
        setCurrentTransactionIndex(0);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  }, []);

  // LocalStorage functions for managing displayed transactions
  const getDisplayedTransactions = useCallback(() => {
    try {
      const stored = localStorage.getItem("purro_displayed_transactions");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.warn(
        "Error reading displayed transactions from localStorage:",
        err
      );
      return [];
    }
  }, []);

  const saveDisplayedTransaction = useCallback(
    (transactionHash: string) => {
      try {
        const displayed = getDisplayedTransactions();
        const updated = [...displayed, transactionHash];

        // Keep only the latest 20 transactions
        if (updated.length > 20) {
          updated.splice(0, updated.length - 20);
        }

        localStorage.setItem(
          "purro_displayed_transactions",
          JSON.stringify(updated)
        );
      } catch (err) {
        console.warn(
          "Error saving displayed transaction to localStorage:",
          err
        );
      }
    },
    [getDisplayedTransactions]
  );

  const isTransactionDisplayed = useCallback(
    (transactionHash: string) => {
      const displayed = getDisplayedTransactions();
      return displayed.includes(transactionHash);
    },
    [getDisplayedTransactions]
  );

  // Function to show next transaction
  const showNextTransaction = useCallback(() => {
    if (transactions.length === 0) return;

    console.log(
      `Showing next transaction, current index: ${currentTransactionIndex}`
    );

    // Find next transaction that hasn't been displayed
    let nextIndex = currentTransactionIndex;
    let attempts = 0;

    while (attempts < transactions.length) {
      const transaction = transactions[nextIndex];

      if (!isTransactionDisplayed(transaction.hash)) {
        console.log(`Displaying transaction: ${transaction.hash}`);
        setDisplayedTransaction(transaction);
        setIsShowingTransaction(true);
        saveDisplayedTransaction(transaction.hash);

        setCurrentTransactionIndex((nextIndex + 1) % transactions.length);
        return;
      }

      nextIndex = (nextIndex + 1) % transactions.length;
      attempts++;
    }

    // If all transactions have been displayed, reset and start over
    console.log("All transactions displayed, resetting...");
    setCurrentTransactionIndex(0);
  }, [
    transactions,
    currentTransactionIndex,
    isTransactionDisplayed,
    saveDisplayedTransaction,
  ]);

  // Function to start the transaction display cycle (idempotent)
  const startTransactionDisplay = useCallback(() => {
    if (intervalRef.current) return; // already running
    console.log("Starting transaction display cycle");
    setIsDisplayCycleActive(true);

    // Show first transaction immediately
    showNextTransaction();

    // Then show every 10 seconds
    intervalRef.current = window.setInterval(() => {
      showNextTransaction();
    }, 10000);
  }, [showNextTransaction]);

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

  // Fetch transactions data on component mount
  useEffect(() => {
    fetchTransactionsData();
  }, [fetchTransactionsData]);

  // Start transaction display when transactions are loaded
  useEffect(() => {
    if (transactions.length > 0 && !intervalRef.current) {
      console.log(
        `Starting transaction display with ${transactions.length} transactions`
      );
      startTransactionDisplay();
    }
  }, [transactions.length, startTransactionDisplay]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsDisplayCycleActive(false);
    };
  }, []);

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

  // Function to format transaction display
  const formatTransactionDisplay = (transaction: Transaction) => {
    const address = getDisplayName(transaction.user_address);
    const tokenIn = transaction.token_in_symbol;
    const tokenOut = transaction.token_out_symbol;
    const amountOut = transaction.amount_out_decimal.toFixed(4);

    return `${address} swapped ${tokenIn} → ${tokenOut}`;
  };

  // Skeleton component for table rows
  const SkeletonRow = () => (
    <tr className="border-t border-gray-700/30">
      <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 lg:py-4">
        <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gray-700 rounded-full animate-pulse"></div>
      </td>
      <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 lg:py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gray-700 rounded-full animate-pulse"></div>
          <div>
            <div className="h-3 sm:h-4 bg-gray-700 rounded w-16 sm:w-20 animate-pulse mb-1"></div>
            <div className="h-2 sm:h-3 bg-gray-700 rounded w-20 sm:w-24 animate-pulse"></div>
          </div>
        </div>
      </td>
      <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 lg:py-4 text-right">
        <div className="h-3 sm:h-4 bg-gray-700 rounded w-12 sm:w-16 animate-pulse ml-auto"></div>
      </td>
      <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 lg:py-4 text-right hidden sm:table-cell">
        <div className="h-3 sm:h-4 bg-gray-700 rounded w-10 sm:w-12 animate-pulse ml-auto"></div>
      </td>
      <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 lg:py-4 text-right hidden sm:table-cell">
        <div className="h-3 sm:h-4 bg-gray-700 rounded w-6 sm:w-8 animate-pulse ml-auto"></div>
      </td>
      <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 lg:py-4 text-right hidden lg:table-cell">
        <div className="h-3 sm:h-4 bg-gray-700 rounded w-6 sm:w-8 animate-pulse ml-auto"></div>
      </td>
      <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 lg:py-4 text-center">
        <div className="h-6 sm:h-7 bg-gray-700 rounded w-16 sm:w-20 animate-pulse mx-auto"></div>
      </td>
    </tr>
  );

  if (error) {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 lg:pt-32 bg-gradient-to-b from-[#021919] via-[#0e2a2a] to-[#081919] relative py-20">
        <div className="container max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 sm:p-6 lg:p-8 text-center">
            <div className="text-red-400 text-base sm:text-lg mb-2">
              Error Loading Leaderboard
            </div>
            <p className="text-red-300 mb-3 sm:mb-4 px-2">{error}</p>
            <button
              onClick={() => fetchLeaderboardData(currentPage, timeframe)}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base"
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
      <div className="container max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl text-white font-bold mb-2 sm:mb-3">
            Leaderboard
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-3 sm:mb-4 px-2">
            Top traders and users on Purro
          </p>
          {leaderboardData && (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5 sm:gap-2">
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
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>
                  Block:{" "}
                  {leaderboardData.sync_info.current_block.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Transaction Display */}
        <div className="mb-4 sm:mb-5 lg:mb-6">
          <div className="bg-black/10 border border-gray-700/30 rounded-lg relative overflow-hidden">
            {displayedTransaction && (
              <div
                key={displayedTransaction.hash}
                className="flex items-center justify-center animate-live-shake p-3 sm:p-4"
                style={{
                  background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(${Math.floor(
                    Math.random() * 256
                  )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
                    Math.random() * 256
                  )}, 0.12) 50%, rgba(0,0,0,0) 100%)`,
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm sm:text-base font-mono">
                    {formatTransactionDisplay(displayedTransaction)}
                  </span>
                </div>
                {/* Removed time-ago as requested */}
              </div>
            )}
          </div>
        </div>

        {/* Point System Description */}
        <div className="mb-4 sm:mb-5 lg:mb-6">
          <div className="bg-black/10 border border-gray-700/30 rounded-lg p-3 sm:p-4">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[#02f1dc] font-medium">0.1 pts</span>
                <span className="text-gray-400">per $1 volume</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[#02f1dc] font-medium">100 pts</span>
                <span className="text-gray-400">per transaction</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[#02f1dc] font-medium">25 pts</span>
                <span className="text-gray-400">per unique token</span>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Controls */}
        <div className="mb-4 sm:mb-5 lg:mb-6">
          <div className="bg-black/10 border border-gray-700/30 rounded-lg p-3 sm:p-4 lg:p-5">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
              {/* Timeframe Filter */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
                {(["1d", "7d", "30d", "all"] as TimeframeOption[]).map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => handleTimeframeChange(option)}
                      className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md transition-colors text-xs sm:text-sm font-medium ${
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
              <form
                onSubmit={handleSearch}
                className="flex gap-1.5 sm:gap-2 w-full sm:w-auto"
              >
                <input
                  type="text"
                  placeholder="Search address..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-800/50 border border-gray-600/30 rounded-md text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/50 flex-1 sm:flex-none sm:w-40 lg:w-48"
                />
                <button
                  type="submit"
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white text-black rounded-md transition-colors hover:bg-gray-100 text-xs sm:text-sm font-medium"
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
                    <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-left text-gray-300 text-xs sm:text-sm font-medium">
                      Rank
                    </th>
                    <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-left text-gray-300 text-xs sm:text-sm font-medium">
                      Address
                    </th>
                    <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-right text-gray-300 text-xs sm:text-sm font-medium">
                      Points
                    </th>
                    <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-right text-gray-300 text-xs sm:text-sm font-medium hidden sm:table-cell">
                      Volume
                    </th>
                    <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-right text-gray-300 text-xs sm:text-sm font-medium hidden sm:table-cell">
                      Txs
                    </th>
                    <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-right text-gray-300 text-xs sm:text-sm font-medium hidden lg:table-cell">
                      Tokens
                    </th>
                    <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-right text-gray-300 text-xs sm:text-sm font-medium">
                      Action
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
                          <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3">
                            <div
                              className={`w-6 h-6 sm:w-7 sm:h-7 ${getRankStyle(
                                user.rank
                              )} rounded-full flex items-center justify-center font-medium text-xs`}
                            >
                              {user.rank}
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div>
                                <div className="text-white font-mono text-xs sm:text-sm">
                                  {getDisplayName(user.address)}
                                  {hlNames.has(user.address.toLowerCase()) && (
                                    <span className="ml-1 sm:ml-2 text-xs text-[#02f1dc] bg-[#02f1dc]/10 px-1 sm:px-1.5 py-0.5 rounded">
                                      HL
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 text-right">
                            <span className="text-white font-medium text-xs sm:text-sm">
                              {user.points.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 text-right hidden sm:table-cell">
                            <span className="text-gray-300 text-xs sm:text-sm">
                              {formatVolume(user.volume_usd)}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 text-right hidden sm:table-cell">
                            <span className="text-gray-300 text-xs sm:text-sm">
                              {user.transactions.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 text-right hidden lg:table-cell">
                            <span className="text-gray-300 text-xs sm:text-sm">
                              {user.tokens}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 lg:px-4 py-2.5 sm:py-3 text-right">
                            <a
                              href={`/leaderboard/${user.address}`}
                              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-white hover:bg-gray-100 text-black rounded-md transition-colors text-xs font-medium group"
                            >
                              <span>Details</span>
                              <svg
                                className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </a>
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
          <div className="mt-4 sm:mt-5 flex justify-center">
            <div className="flex gap-1.5 sm:gap-2 items-center flex-wrap justify-center">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-2.5 sm:px-3 py-1.5 bg-gray-700/30 hover:bg-gray-600/30 disabled:bg-gray-800/30 disabled:text-gray-600 text-white rounded-md transition-colors text-xs"
              >
                <span className="hidden sm:inline">First</span>
                <span className="sm:hidden">‹‹</span>
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!leaderboardData.pagination.has_prev}
                className="px-2.5 sm:px-3 py-1.5 bg-gray-700/30 hover:bg-gray-600/30 disabled:bg-gray-800/30 disabled:text-gray-600 text-white rounded-md transition-colors text-xs"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">‹</span>
              </button>
              <span className="px-2.5 sm:px-3 py-1.5 bg-white text-black rounded-md font-medium text-xs">
                {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!leaderboardData.pagination.has_next}
                className="px-2.5 sm:px-3 py-1.5 bg-gray-700/30 hover:bg-gray-600/30 disabled:bg-gray-800/30 disabled:text-gray-600 text-white rounded-md transition-colors text-xs"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">›</span>
              </button>
              <button
                onClick={() =>
                  handlePageChange(leaderboardData.pagination.total_pages)
                }
                disabled={
                  currentPage === leaderboardData.pagination.total_pages
                }
                className="px-2.5 sm:px-3 py-1.5 bg-gray-700/30 hover:bg-gray-600/30 disabled:bg-gray-800/30 disabled:text-gray-600 text-white rounded-md transition-colors text-xs"
              >
                <span className="hidden sm:inline">Last</span>
                <span className="sm:hidden">››</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardReact;
