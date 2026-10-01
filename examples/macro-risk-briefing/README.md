# Macro risk briefing (example toolkit)

Chains three published World Monitor skills into one Markdown briefing:

| Section | Skill | Endpoint |
|---|---|---|
| Country risk | [`check-country-risk`](../../skills/check-country-risk/SKILL.md) | `/api/intelligence/v1/get-country-risk` |
| Chokepoints | [`check-chokepoint-status`](../../skills/check-chokepoint-status/SKILL.md) | `/api/supply-chain/v1/get-chokepoint-status` |
| Markets | [`get-market-quotes`](../../skills/get-market-quotes/SKILL.md) | `/api/market/v1/list-market-quotes` |

No dependencies; needs Node 18+.

```bash
node briefing.mjs --fixture                                  # offline sample data
WM_API_KEY=wm_... node briefing.mjs --countries IR,SD --symbols SPY,XLE,ITA --min-score 30
node --test briefing.test.mjs
```

It follows the skills' contracts: `X-WorldMonitor-Key` auth, retry on 429/503, `upstreamUnavailable` and withheld fields shown as `n/a` (never as zero or "all clear"), `unavailableSymbols` surfaced, and response text sanitised because it is data, not instructions.

Status: tested against fixtures only. It has not been run against the live API because no key was available in this session.
