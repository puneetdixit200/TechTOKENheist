import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const landingCss = fs.readFileSync(
  new URL('../screens/LandingScreen.css', import.meta.url),
  'utf8',
)

test('landing vault background keeps a slow fixed-image zoom', () => {
  assert.match(
    landingCss,
    /\.vault-bg-inner\s*\{[\s\S]*animation:\s*vaultBackgroundSlowZoom\s+48s\s+ease-in-out\s+infinite\s+alternate/,
  )
  assert.match(
    landingCss,
    /\.vault-bg-inner\s*\{[\s\S]*will-change:\s*transform/,
  )
  assert.match(
    landingCss,
    /@keyframes\s+vaultBackgroundSlowZoom\s*\{[\s\S]*0%\s*\{[\s\S]*transform:\s*scale\(1\)[\s\S]*100%\s*\{[\s\S]*transform:\s*scale\(1\.06\)/,
  )
  assert.match(
    landingCss,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*\.vault-bg-inner\s*\{[\s\S]*animation:\s*none[\s\S]*transform:\s*scale\(1\)/,
  )
})
