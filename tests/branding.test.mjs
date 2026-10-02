import test from 'node:test';
import assert from 'node:assert/strict';
import { siteTitle, heroTitle, socialSubtitle } from '../app/branding.mjs';
import { readFileSync } from 'node:fs';

test('the trip is branded for KK and no longer refers to a boy', () => {
  assert.equal(siteTitle, '和KK一起读一遍长安｜西安亲子旅行攻略');
  assert.equal(heroTitle, '和KK一起读一遍长安');
  assert.equal(socialSubtitle, 'KK的西安亲子历史文化之旅 · 2026.10.23—10.28');
  assert.equal(`${siteTitle}${heroTitle}${socialSubtitle}`.includes('少年'), false);
});

test('the KK artwork is visible in the page hero with useful alt text', () => {
  const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /import heroArtwork from '\.\.\/public\/hero-kk\.png'/);
  assert.match(page, /src=\{heroArtwork\}/);
  assert.match(page, /alt="和KK一起读一遍长安，西安亲子历史文化之旅"/);
});
