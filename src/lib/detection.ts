import { UAParser } from "ua-parser-js";

export interface BrowserInfo {
    browserName: string;
    browserVersion: string;
    isSupported: boolean;
}

export interface RegionInfo {
    regionName: string;
    regionCode: string;
    isSupported: boolean;
}

// Enhanced timezone to region mapping
const TIMEZONE_MAP: Record<string, { name: string; code: string }> = {
    "America/New_York": { name: "United States", code: "US" },
    "America/Los_Angeles": { name: "United States", code: "US" },
    "America/Chicago": { name: "United States", code: "US" },
    "America/Denver": { name: "United States", code: "US" },
    "America/Phoenix": { name: "United States", code: "US" },
    "America/Anchorage": { name: "United States", code: "US" },
    "America/Honolulu": { name: "United States", code: "US" },
    "America/Detroit": { name: "United States", code: "US" },
    "America/Indiana/Indianapolis": { name: "United States", code: "US" },
    "America/Kentucky/Louisville": { name: "United States", code: "US" },
    "Europe/London": { name: "United Kingdom", code: "GB" },
    "Europe/Paris": { name: "France", code: "FR" },
    "Europe/Berlin": { name: "Germany", code: "DE" },
    "Europe/Rome": { name: "Italy", code: "IT" },
    "Europe/Madrid": { name: "Spain", code: "ES" },
    "Europe/Amsterdam": { name: "Netherlands", code: "NL" },
    "Europe/Stockholm": { name: "Sweden", code: "SE" },
    "Europe/Oslo": { name: "Norway", code: "NO" },
    "Europe/Copenhagen": { name: "Denmark", code: "DK" },
    "Europe/Helsinki": { name: "Finland", code: "FI" },
    "Europe/Zurich": { name: "Switzerland", code: "CH" },
    "Europe/Vienna": { name: "Austria", code: "AT" },
    "Europe/Brussels": { name: "Belgium", code: "BE" },
    "Europe/Dublin": { name: "Ireland", code: "IE" },
    "Europe/Lisbon": { name: "Portugal", code: "PT" },
    "Europe/Warsaw": { name: "Poland", code: "PL" },
    "Europe/Prague": { name: "Czech Republic", code: "CZ" },
    "Europe/Budapest": { name: "Hungary", code: "HU" },
    "Asia/Tokyo": { name: "Japan", code: "JP" },
    "Asia/Seoul": { name: "South Korea", code: "KR" },
    "Asia/Shanghai": { name: "China", code: "CN" },
    "Asia/Ho_Chi_Minh": { name: "Vietnam", code: "VN" },
    "Asia/Saigon": { name: "Vietnam", code: "VN" },
    "Asia/Singapore": { name: "Singapore", code: "SG" },
    "Asia/Bangkok": { name: "Thailand", code: "TH" },
    "Asia/Kuala_Lumpur": { name: "Malaysia", code: "MY" },
    "Asia/Manila": { name: "Philippines", code: "PH" },
    "Asia/Jakarta": { name: "Indonesia", code: "ID" },
    "Asia/Taipei": { name: "Taiwan", code: "TW" },
    "Asia/Hong_Kong": { name: "Hong Kong", code: "HK" },
    "Asia/Kolkata": { name: "India", code: "IN" },
    "Asia/Dubai": { name: "United Arab Emirates", code: "AE" },
    "Asia/Tel_Aviv": { name: "Israel", code: "IL" },
    "Asia/Istanbul": { name: "Turkey", code: "TR" },
    "Australia/Sydney": { name: "Australia", code: "AU" },
    "Australia/Melbourne": { name: "Australia", code: "AU" },
    "Australia/Perth": { name: "Australia", code: "AU" },
    "Pacific/Auckland": { name: "New Zealand", code: "NZ" },
    "America/Toronto": { name: "Canada", code: "CA" },
    "America/Vancouver": { name: "Canada", code: "CA" },
    "America/Montreal": { name: "Canada", code: "CA" },
    "America/Sao_Paulo": { name: "Brazil", code: "BR" },
    "America/Mexico_City": { name: "Mexico", code: "MX" },
    "America/Buenos_Aires": { name: "Argentina", code: "AR" },
    "America/Santiago": { name: "Chile", code: "CL" },
    "America/Bogota": { name: "Colombia", code: "CO" },
    "America/Lima": { name: "Peru", code: "PE" },
    "Africa/Johannesburg": { name: "South Africa", code: "ZA" },
};

// Unsupported regions
const UNSUPPORTED_COUNTRIES = ["VN", "CN", "RU", "KP", "IR", "CU", "SY", "MM"];

/**
 * Detect browser information using ua-parser-js library
 */
export const detectBrowser = (): BrowserInfo => {
    const parser = new UAParser();
    const result = parser.getResult();

    let browserName = result.browser.name || "Unknown Browser";
    let browserVersion = result.browser.version || "Unknown";
    let isSupported = false;

    // Normalize browser names and check support
    if (browserName.toLowerCase().includes("chrome") &&
        !navigator.userAgent.includes("Edg") &&
        !navigator.userAgent.includes("Brave")) {
        browserName = "Google Chrome";
        isSupported = parseInt(browserVersion.split('.')[0]) >= 88;
    } else if (navigator.userAgent.includes("Edg")) {
        browserName = "Microsoft Edge";
        isSupported = parseInt(browserVersion.split('.')[0]) >= 88;
    } else if (navigator.userAgent.includes("Brave")) {
        browserName = "Brave Browser";
        isSupported = parseInt(browserVersion.split('.')[0]) >= 88;
    } else if (browserName.toLowerCase().includes("firefox")) {
        browserName = "Mozilla Firefox";
        isSupported = false;
    } else if (browserName.toLowerCase().includes("safari") &&
        !navigator.userAgent.includes("Chrome")) {
        browserName = "Safari";
        isSupported = false;
    } else if (browserName.toLowerCase().includes("opera")) {
        browserName = "Opera";
        isSupported = parseInt(browserVersion.split('.')[0]) >= 88;
    }

    return { browserName, browserVersion, isSupported };
};

/**
 * Detect region using IP geolocation with timezone fallback
 */
export const detectRegion = async (): Promise<RegionInfo> => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let regionName = "Unknown";
    let regionCode = "Unknown";
    let isSupported = true;

    console.log('🌍 Starting region detection...');
    console.log('📍 Current timezone:', timezone);

    // Try IP geolocation first (more accurate)
    try {
        console.log('🔍 Trying IP geolocation API...');
        const response = await fetch('https://ipapi.co/json/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        console.log('📡 API Response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('📊 API Response data:', data);

            regionName = data.country_name || "Unknown";
            regionCode = data.country_code || "Unknown";
            isSupported = !UNSUPPORTED_COUNTRIES.includes(regionCode);

            console.log('✅ IP geolocation successful:', { regionName, regionCode, isSupported });
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        // Fallback to timezone detection
        console.warn('❌ IP geolocation failed, using timezone detection:', error);

        if (TIMEZONE_MAP[timezone]) {
            regionName = TIMEZONE_MAP[timezone].name;
            regionCode = TIMEZONE_MAP[timezone].code;
            isSupported = !UNSUPPORTED_COUNTRIES.includes(regionCode);
            console.log('🕐 Timezone fallback successful:', { regionName, regionCode, isSupported });
        } else {
            console.log('❌ No timezone mapping found for:', timezone);
        }
    }

    console.log('🎯 Final region result:', { regionName, regionCode, isSupported });
    return { regionName, regionCode, isSupported };
};

/**
 * Alternative region detection using different API
 */
export const detectRegionAlternative = async (): Promise<RegionInfo> => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let regionName = "Unknown";
    let regionCode = "Unknown";
    let isSupported = true;

    console.log('🔄 Trying alternative IP geolocation API...');

    try {
        const response = await fetch('https://ip-api.com/json/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        console.log('📡 Alternative API Response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('📊 Alternative API Response data:', data);

            if (data.status === 'success') {
                regionName = data.country || "Unknown";
                regionCode = data.countryCode || "Unknown";
                isSupported = !UNSUPPORTED_COUNTRIES.includes(regionCode);
                console.log('✅ Alternative IP geolocation successful:', { regionName, regionCode, isSupported });
            } else {
                throw new Error('API returned error status');
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        // Fallback to timezone detection
        console.warn('❌ Alternative IP geolocation failed, using timezone detection:', error);

        if (TIMEZONE_MAP[timezone]) {
            regionName = TIMEZONE_MAP[timezone].name;
            regionCode = TIMEZONE_MAP[timezone].code;
            isSupported = !UNSUPPORTED_COUNTRIES.includes(regionCode);
            console.log('🕐 Timezone fallback successful:', { regionName, regionCode, isSupported });
        }
    }

    return { regionName, regionCode, isSupported };
};

/**
 * Enhanced region detection with multiple API fallbacks
 */
export const detectRegionEnhanced = async (): Promise<RegionInfo> => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('🚀 Starting enhanced region detection...');
    console.log('📍 Current timezone:', timezone);

    // List of APIs to try in order
    const apis = [
        {
            name: 'ipapi.co',
            url: 'https://ipapi.co/json/',
            parser: (data: any) => ({
                regionName: data.country_name,
                regionCode: data.country_code
            })
        },
        {
            name: 'ip-api.com',
            url: 'https://ip-api.com/json/',
            parser: (data: any) => ({
                regionName: data.country,
                regionCode: data.countryCode
            })
        },
        {
            name: 'ipinfo.io',
            url: 'https://ipinfo.io/json',
            parser: (data: any) => ({
                regionName: data.country,
                regionCode: data.country
            })
        }
    ];

    // Try each API
    for (const api of apis) {
        try {
            console.log(`🔍 Trying ${api.name}...`);
            const response = await fetch(api.url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`📊 ${api.name} response:`, data);

                const parsed = api.parser(data);
                if (parsed.regionName && parsed.regionCode) {
                    const regionName = parsed.regionName;
                    const regionCode = parsed.regionCode;
                    const isSupported = !UNSUPPORTED_COUNTRIES.includes(regionCode);

                    console.log(`✅ ${api.name} successful:`, { regionName, regionCode, isSupported });
                    return { regionName, regionCode, isSupported };
                }
            }
        } catch (error) {
            console.warn(`❌ ${api.name} failed:`, error);
        }
    }

    // Final fallback to timezone
    console.log('🕐 All APIs failed, using timezone detection...');
    if (TIMEZONE_MAP[timezone]) {
        const regionName = TIMEZONE_MAP[timezone].name;
        const regionCode = TIMEZONE_MAP[timezone].code;
        const isSupported = !UNSUPPORTED_COUNTRIES.includes(regionCode);
        console.log('✅ Timezone fallback successful:', { regionName, regionCode, isSupported });
        return { regionName, regionCode, isSupported };
    }

    console.log('❌ All detection methods failed');
    return { regionName: "Unknown", regionCode: "Unknown", isSupported: true };
};

/**
 * Get timezone-based region info (synchronous fallback)
 */
export const getTimezoneRegion = (): RegionInfo => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let regionName = "Unknown";
    let regionCode = "Unknown";
    let isSupported = true;

    console.log('🕐 Getting timezone region for:', timezone);

    if (TIMEZONE_MAP[timezone]) {
        regionName = TIMEZONE_MAP[timezone].name;
        regionCode = TIMEZONE_MAP[timezone].code;
        isSupported = !UNSUPPORTED_COUNTRIES.includes(regionCode);
        console.log('✅ Timezone region found:', { regionName, regionCode, isSupported });
    } else {
        console.log('❌ No timezone mapping found for:', timezone);
    }

    return { regionName, regionCode, isSupported };
};

/**
 * Simple region detection that always works (for testing)
 */
export const detectRegionSimple = async (): Promise<RegionInfo> => {
    console.log('🚀 Starting simple region detection...');

    // Always return timezone-based detection for now
    const timezoneResult = getTimezoneRegion();

    // If timezone detection worked, return it
    if (timezoneResult.regionName !== "Unknown") {
        console.log('✅ Simple detection successful:', timezoneResult);
        return timezoneResult;
    }

    // Fallback to a default
    console.log('⚠️ Using default fallback');
    return { regionName: "United States", regionCode: "US", isSupported: true };
};
