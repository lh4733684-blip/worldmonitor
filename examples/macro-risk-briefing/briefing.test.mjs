import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs, collect, render } from './briefing.mjs';

const opts = { ...parseArgs(['--fixture', '--countries', 'IR,SD']) };

test('fixture briefing renders all sections', async () => {
  const out = render(await collect(opts), opts);
  assert.match(out, /Iran \(IR\) \| 71/);
  assert.match(out, /Strait of Hormuz/);
  assert.match(out, /XLE: 91.2 \(\+1.8%\)/);
  assert.match(out, /UNKNOWN: unavailable \(NOT_FOUND\)/);
});

test('withheld chokepoint fields render as n/a, not zero', async () => {
  const out = render(await collect(opts), opts);
  const suez = out.split('\n').find((l) => l.includes('Suez'));
  assert.match(suez, /warnings n\/a/);
  assert.match(suez, /congestion n\/a/);
});

test('upstream outage is "no data", never all-clear', () => {
  const out = render({ countries: [], chokepoints: { chokepoints: [], upstreamUnavailable: true }, quotes: { error: 'x' } }, opts);
  assert.match(out, /not an all-clear/);
});
