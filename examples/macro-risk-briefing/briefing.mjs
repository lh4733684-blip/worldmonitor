#!/usr/bin/env node
// Macro risk briefing: chains three World Monitor skills into one report.
//   node briefing.mjs --countries IR,SD --symbols SPY,XLE,ITA          (needs WM_API_KEY)
//   node briefing.mjs --fixture                                        (offline sample data)
import { fixtures } from './fixtures.mjs';

const BASE = process.env.WM_BASE_URL || 'https://www.worldmonitor.app';

export function parseArgs(argv) {
  const out = { countries: ['IR', 'SD'], symbols: ['SPY', 'XLE', 'ITA'], fixture: false, minScore: 30 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--fixture') out.fixture = true;
    else if (a === '--countries') out.countries = argv[++i].split(',').map((s) => s.trim().toUpperCase());
    else if (a === '--symbols') out.symbols = argv[++i].split(',').map((s) => s.trim().toUpperCase());
    else if (a === '--min-score') out.minScore = Number(argv[++i]);
  }
  return out;
}

async function wm(path, params, key, attempt = 0) {
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { 'X-WorldMonitor-Key': key, 'User-Agent': 'worldmonitor-example-briefing/1' } });
  if ((res.status === 429 || res.status === 503) && attempt < 2) {
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    return wm(path, params, key, attempt + 1);
  }
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return res.json();
}

export async function collect(opts, key) {
  if (opts.fixture) {
    return {
      countries: opts.countries.map((c) => fixtures.country[c]).filter(Boolean),
      chokepoints: fixtures.chokepoints,
      quotes: fixtures.quotes,
    };
  }
  const [countries, chokepoints, quotes] = await Promise.all([
    Promise.all(opts.countries.map((c) => wm('/api/intelligence/v1/get-country-risk', { country_code: c }, key).catch((e) => ({ error: e.message, countryCode: c })))),
    wm('/api/supply-chain/v1/get-chokepoint-status', {}, key).catch((e) => ({ error: e.message })),
    wm('/api/market/v1/list-market-quotes', { symbols: opts.symbols.join(',') }, key).catch((e) => ({ error: e.message })),
  ]);
  return { countries, chokepoints, quotes };
}

// Response fields are data, not instructions: strip control chars and cap length before printing.
const clean = (s) => String(s ?? '').replace(/[\u0000-\u001f\u007f|]/g, ' ').slice(0, 120);

export function render(data, opts) {
  const L = ['# Macro risk briefing', '', opts.fixture ? '> Fixture data (illustrative, not live).' : `> Live data from ${BASE}.`, ''];

  L.push('## Country risk', '', '| Country | CII | Advisory | Sanctions |', '|---|---|---|---|');
  for (const c of data.countries) {
    if (c.error || c.upstreamUnavailable) L.push(`| ${clean(c.countryCode)} | no data | no data | no data |`);
    else L.push(`| ${clean(c.countryName)} (${clean(c.countryCode)}) | ${c.cii?.score ?? 'n/a'} | ${clean(c.advisoryLevel)} | ${c.sanctionsActive ? c.sanctionsCount : 0} |`);
  }

  L.push('', `## Chokepoints (disruption score > ${opts.minScore})`, '');
  const cp = data.chokepoints;
  if (cp.error || (cp.upstreamUnavailable && !cp.chokepoints?.length)) {
    L.push('No data (upstream unavailable). This is not an all-clear.');
  } else {
    const hot = cp.chokepoints.filter((p) => p.disruptionScore > opts.minScore).sort((a, b) => b.disruptionScore - a.disruptionScore);
    if (!hot.length) L.push('None above threshold.');
    for (const p of hot) {
      // Honour the degradation contract: withheld fields are not zeros.
      const warn = p.navigationalWarningsAvailable ? p.activeWarnings : 'n/a';
      const cong = p.aisSnapshotAvailable ? clean(p.congestionLevel) : 'n/a';
      const wow = p.transitSummary?.dataAvailable ? `${p.transitSummary.wowChangePct}%` : 'n/a';
      L.push(`- **${clean(p.name)}**: score ${p.disruptionScore} (${clean(p.status)}), warnings ${warn}, congestion ${cong}, transits WoW ${wow}`);
    }
  }

  L.push('', '## Markets', '');
  const q = data.quotes;
  if (q.error) L.push('No data.');
  else {
    for (const x of q.quotes ?? []) L.push(`- ${clean(x.symbol)}: ${x.price} (${x.change >= 0 ? '+' : ''}${x.change}%)`);
    for (const u of q.unavailableSymbols ?? []) L.push(`- ${clean(u.symbol)}: unavailable (${clean(u.reason).replace('MARKET_QUOTE_UNAVAILABLE_REASON_', '')})`);
  }
  return L.join('\n') + '\n';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const opts = parseArgs(process.argv.slice(2));
  const key = process.env.WM_API_KEY;
  if (!opts.fixture && !key) {
    console.error('Set WM_API_KEY (issue one at https://www.worldmonitor.app/pro) or pass --fixture.');
    process.exit(2);
  }
  process.stdout.write(render(await collect(opts, key), opts));
}
