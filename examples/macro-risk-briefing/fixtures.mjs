// Offline sample payloads shaped like the documented skill responses
// (skills/check-country-risk, check-chokepoint-status, get-market-quotes).
// Values are illustrative test data, not live readings.
export const fixtures = {
  country: {
    IR: { countryCode: 'IR', countryName: 'Iran', cii: { score: 71 }, advisoryLevel: 'reconsider-travel', sanctionsActive: true, sanctionsCount: 38, upstreamUnavailable: false },
    SD: { countryCode: 'SD', countryName: 'Sudan', cii: { score: 78 }, advisoryLevel: 'do-not-travel', sanctionsActive: true, sanctionsCount: 41, upstreamUnavailable: false },
    NO: { countryCode: 'NO', countryName: 'Norway', cii: { score: 9 }, advisoryLevel: 'normal', sanctionsActive: false, sanctionsCount: 0, upstreamUnavailable: false },
  },
  chokepoints: {
    chokepoints: [
      { id: 'hormuz_strait', name: 'Strait of Hormuz', disruptionScore: 42, status: 'yellow', activeWarnings: 2, navigationalWarningsAvailable: true, congestionLevel: 'elevated', aisSnapshotAvailable: true, transitSummary: { wowChangePct: -4.2, dataAvailable: true } },
      { id: 'suez_canal', name: 'Suez Canal', disruptionScore: 55, status: 'orange', activeWarnings: 0, navigationalWarningsAvailable: false, congestionLevel: 'normal', aisSnapshotAvailable: false, transitSummary: { wowChangePct: -18.5, dataAvailable: true } },
      { id: 'panama_canal', name: 'Panama Canal', disruptionScore: 12, status: 'green', activeWarnings: 0, navigationalWarningsAvailable: true, congestionLevel: 'normal', aisSnapshotAvailable: true, transitSummary: { wowChangePct: 1.1, dataAvailable: true } },
    ],
    upstreamUnavailable: false,
  },
  quotes: {
    quotes: [
      { symbol: 'SPY', name: 'SPDR S&P 500', price: 612.4, change: -0.6 },
      { symbol: 'XLE', name: 'Energy Select Sector', price: 91.2, change: 1.8 },
      { symbol: 'ITA', name: 'US Aerospace & Defense', price: 168.9, change: 0.9 },
    ],
    unavailableSymbols: [{ symbol: 'UNKNOWN', reason: 'MARKET_QUOTE_UNAVAILABLE_REASON_NOT_FOUND' }],
  },
};
