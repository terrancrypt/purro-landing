import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  GlobeIcon,
  AlertTriangleIcon,
} from "lucide-react";
import {
  detectBrowser,
  detectRegion,
  detectRegionEnhanced,
  detectRegionSimple,
  type BrowserInfo,
  type RegionInfo,
} from "../lib/detection";

// Supported regions based on Chrome Web Store distribution (excluding Vietnam)
const SUPPORTED_REGIONS = [
  { name: "United States", code: "US", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧" },
  { name: "Canada", code: "CA", flag: "🇨🇦" },
  { name: "Australia", code: "AU", flag: "🇦🇺" },
  { name: "Germany", code: "DE", flag: "🇩🇪" },
  { name: "France", code: "FR", flag: "🇫🇷" },
  { name: "Japan", code: "JP", flag: "🇯🇵" },
  { name: "South Korea", code: "KR", flag: "🇰🇷" },
  { name: "Singapore", code: "SG", flag: "🇸🇬" },
  { name: "Netherlands", code: "NL", flag: "🇳🇱" },
  { name: "Sweden", code: "SE", flag: "🇸🇪" },
  { name: "Norway", code: "NO", flag: "🇳🇴" },
  { name: "Denmark", code: "DK", flag: "🇩🇰" },
  { name: "Finland", code: "FI", flag: "🇫🇮" },
  { name: "Switzerland", code: "CH", flag: "🇨🇭" },
  { name: "Austria", code: "AT", flag: "🇦🇹" },
  { name: "Belgium", code: "BE", flag: "🇧🇪" },
  { name: "Ireland", code: "IE", flag: "🇮🇪" },
  { name: "New Zealand", code: "NZ", flag: "🇳🇿" },
  { name: "Spain", code: "ES", flag: "🇪🇸" },
  { name: "Italy", code: "IT", flag: "🇮🇹" },
  { name: "Portugal", code: "PT", flag: "🇵🇹" },
  { name: "Poland", code: "PL", flag: "🇵🇱" },
  { name: "Czech Republic", code: "CZ", flag: "🇨🇿" },
  { name: "Hungary", code: "HU", flag: "🇭🇺" },
  { name: "Brazil", code: "BR", flag: "🇧🇷" },
  { name: "Mexico", code: "MX", flag: "🇲🇽" },
  { name: "Argentina", code: "AR", flag: "🇦🇷" },
  { name: "Chile", code: "CL", flag: "🇨🇱" },
  { name: "Colombia", code: "CO", flag: "🇨🇴" },
  { name: "Peru", code: "PE", flag: "🇵🇪" },
  { name: "India", code: "IN", flag: "🇮🇳" },
  { name: "Israel", code: "IL", flag: "🇮🇱" },
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪" },
  { name: "South Africa", code: "ZA", flag: "🇿🇦" },
  { name: "Turkey", code: "TR", flag: "🇹🇷" },
  { name: "Thailand", code: "TH", flag: "🇹🇭" },
  { name: "Malaysia", code: "MY", flag: "🇲🇾" },
  { name: "Philippines", code: "PH", flag: "🇵🇭" },
  { name: "Indonesia", code: "ID", flag: "🇮🇩" },
  { name: "Taiwan", code: "TW", flag: "🇹🇼" },
  { name: "Hong Kong", code: "HK", flag: "🇭🇰" },
];

const UNSUPPORTED_REGIONS = [
  { name: "Vietnam", code: "VN", flag: "🇻🇳" },
  { name: "China", code: "CN", flag: "🇨🇳" },
  { name: "Russia", code: "RU", flag: "🇷🇺" },
  { name: "North Korea", code: "KP", flag: "🇰🇵" },
  { name: "Iran", code: "IR", flag: "🇮🇷" },
  { name: "Cuba", code: "CU", flag: "🇨🇺" },
  { name: "Syria", code: "SY", flag: "🇸🇾" },
  { name: "Myanmar", code: "MM", flag: "🇲🇲" },
];

const BROWSER_SUPPORT = [
  { name: "Google Chrome", supported: true, minVersion: "88" },
  { name: "Microsoft Edge", supported: true, minVersion: "88" },
  { name: "Brave Browser", supported: true, minVersion: "88" },
  { name: "Opera", supported: true, minVersion: "88" },
  { name: "Vivaldi", supported: true, minVersion: "88" },
  { name: "Firefox", supported: false, reason: "Not Chromium-based" },
  { name: "Safari", supported: false, reason: "Not Chromium-based" },
];

// Types are now imported from detection.ts

// Custom hook for browser and region detection
const useBrowserDetection = () => {
  const [browser, setBrowser] = useState<BrowserInfo>({
    browserName: "Detecting...",
    browserVersion: "",
    isSupported: false,
  });
  const [region, setRegion] = useState<RegionInfo>({
    regionName: "Detecting...",
    regionCode: "",
    isSupported: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Detection functions are now imported from detection.ts

  useEffect(() => {
    const detectAll = async () => {
      console.log("🚀 Starting detection process...");

      const browserInfo = detectBrowser();
      console.log("🌐 Browser detection result:", browserInfo);

      // Try simple region detection first (more reliable)
      const regionInfo = await detectRegionSimple();
      console.log("🌍 Region detection result:", regionInfo);

      setBrowser(browserInfo);
      setRegion(regionInfo);
      setIsLoading(false);
    };

    const timer = setTimeout(detectAll, 1000); // Simulate loading time

    return () => clearTimeout(timer);
  }, []);

  return { browser, region, isLoading };
};

const RegionSupport: React.FC = () => {
  const { browser, region, isLoading } = useBrowserDetection();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#081919] via-[#0e2a2a] to-[#081919] pt-32 pb-16 sm:pb-20 md:pb-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center scroll-animate mb-12 sm:mb-16">
          <img
            src="/Purro_Logotype_White.png"
            alt="Purro Logo"
            className="h-12 sm:h-14 md:h-16 mx-auto mb-6 sm:mb-8"
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-3 sm:mb-4 px-4">
            Region & Browser Support
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Check if Purro extension is available in your region and compatible
            with your browser
          </p>
        </div>

        {/* Detection Section */}
        <div className="mb-12 sm:mb-16 scroll-animate">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6 sm:mb-8 text-center px-4">
            Your Current Setup
          </h2>

          <div className="space-y-4 sm:space-y-6">
            {/* Browser Detection */}
            <div className="bg-black/30 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#02f1dc]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <GlobeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#02f1dc]" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white">
                        Browser
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-[#02f1dc]"></div>
                        <span className="text-gray-300 text-sm sm:text-base hidden xs:inline">
                          Checking...
                        </span>
                      </>
                    ) : browser.isSupported ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                        <span className="text-green-400 font-semibold text-sm sm:text-base">
                          Supported
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                        <span className="text-red-400 font-semibold text-sm sm:text-base">
                          Not Supported
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="pl-13 sm:pl-14">
                  <p className="text-gray-300 text-sm sm:text-base">
                    {isLoading
                      ? "Detecting your browser..."
                      : `${browser.browserName} ${browser.browserVersion}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Region Detection */}
            <div className="bg-black/30 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#02f1dc]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <GlobeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#02f1dc]" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white">
                        Region
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-[#02f1dc]"></div>
                        <span className="text-gray-300 text-sm sm:text-base hidden xs:inline">
                          Checking...
                        </span>
                      </>
                    ) : region.isSupported ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                        <span className="text-green-400 font-semibold text-sm sm:text-base">
                          Supported
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                        <span className="text-red-400 font-semibold text-sm sm:text-base">
                          Not Supported
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="pl-13 sm:pl-14">
                  <p className="text-gray-300 text-sm sm:text-base">
                    {isLoading
                      ? "Detecting your location..."
                      : `${region.regionName} (${region.regionCode})`}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning if not supported */}
            {!isLoading && (!browser.isSupported || !region.isSupported) && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-red-900/20 border border-red-500/30 rounded-xl sm:rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-2">
                      Extension Not Available
                    </h4>
                    <p className="text-gray-300 text-sm sm:text-base">
                      Purro extension is not available for your current browser
                      or region. Please check the supported browsers and regions
                      below.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Supported Regions */}
        <div className="mb-12 sm:mb-16 scroll-animate">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 sm:mb-8 text-center px-4">
            Supported Regions
          </h2>
          <p className="text-gray-300 text-center mb-8 sm:mb-12 max-w-3xl mx-auto text-sm sm:text-base px-4">
            Purro extension is available in the following regions through Chrome
            Web Store distribution
          </p>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {SUPPORTED_REGIONS.map((region, index) => (
              <div
                key={index}
                className="bg-black/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 hover:border-[#02f1dc]/30 transition-all duration-300"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0">
                    {region.flag}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-white truncate">
                      {region.name}
                    </h3>
                    <p className="text-xs text-gray-400">{region.code}</p>
                  </div>
                  <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unsupported Regions */}
        <div className="mb-12 sm:mb-16 scroll-animate">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 sm:mb-8 text-center px-4">
            Unsupported Regions
          </h2>
          <p className="text-gray-300 text-center mb-8 sm:mb-12 max-w-3xl mx-auto text-sm sm:text-base px-4">
            Purro extension is not available in the following regions due to
            regulatory restrictions
          </p>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {UNSUPPORTED_REGIONS.map((region, index) => (
              <div
                key={index}
                className="bg-red-900/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-red-500/30"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0">
                    {region.flag}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-white truncate">
                      {region.name}
                    </h3>
                    <p className="text-xs text-gray-400">{region.code}</p>
                  </div>
                  <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Browser Compatibility */}
        <div className="mb-12 sm:mb-16 scroll-animate">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 sm:mb-8 text-center px-4">
            Browser Compatibility
          </h2>
          <p className="text-gray-300 text-center mb-8 sm:mb-12 max-w-3xl mx-auto text-sm sm:text-base px-4">
            Purro works with Chromium-based browsers. Check your browser
            compatibility below
          </p>

          <div className="space-y-3 sm:space-y-4">
            {BROWSER_SUPPORT.map((browser, index) => (
              <div
                key={index}
                className="bg-black/20 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#02f1dc]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <GlobeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#02f1dc]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-white">
                          {browser.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {browser.supported ? (
                        <>
                          <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                          <span className="text-green-400 font-semibold text-sm sm:text-base">
                            Supported
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                          <span className="text-red-400 font-semibold text-sm sm:text-base">
                            Not Supported
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="pl-13 sm:pl-14">
                    {browser.supported ? (
                      <p className="text-gray-300 text-sm sm:text-base">
                        Minimum version: {browser.minVersion}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm sm:text-base">
                        {browser.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-900/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-yellow-500/30 mb-12 sm:mb-16 scroll-animate">
          <div className="flex items-start gap-3 sm:gap-4">
            <AlertTriangleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 flex-shrink-0 mt-0.5 sm:mt-1" />
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                Important Notice
              </h3>
              <div className="space-y-3 text-gray-300 text-sm sm:text-base">
                <p>
                  <strong>Vietnam Restriction:</strong> Purro extension is not
                  available in Vietnam due to local regulatory requirements.
                  Users in Vietnam will not be able to install or use the
                  extension.
                </p>
                <p>
                  <strong>VPN Usage:</strong> Using a VPN to access the
                  extension from restricted regions is not recommended and may
                  violate our terms of service.
                </p>
                <p>
                  <strong>Future Support:</strong> We are working to expand
                  support to more regions. Please check back regularly for
                  updates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center scroll-animate">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-3 sm:mb-4 px-4">
            Need Help?
          </h2>
          <p className="text-gray-300 mb-8 sm:mb-10 text-sm sm:text-base px-4">
            Have questions about region support or browser compatibility?
            Contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-8 sm:mb-10 px-4">
            <a
              href="https://discord.gg/pa7aVJy8YG"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#02f1dc] hover:bg-[#02f1dc]/80 text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 no-underline text-base sm:text-lg"
            >
              Join Discord
            </a>
            <a
              href="mailto:hello@purro.xyz"
              className="bg-black/30 hover:bg-black/50 text-[#02f1dc] border border-[#02f1dc]/30 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 no-underline text-base sm:text-lg"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionSupport;
