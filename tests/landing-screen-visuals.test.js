import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const landingScreen = readFileSync('src/screens/LandingScreen.jsx', 'utf8')
const landingStyles = readFileSync('src/screens/LandingScreen.css', 'utf8')

test('Rio section includes a hover lightning layer for the black side', () => {
  assert.match(landingScreen, /className="reol-black-lightning"/)
  assert.match(landingStyles, /\.reol-black-lightning/)
  assert.match(landingStyles, /@keyframes reolLightningFlicker/)
})

test('final heist CTA lines use the high-visibility subtitle treatment', () => {
  assert.match(landingScreen, /THROW THE DICE/)
  assert.match(landingScreen, /LET THE HEIST BEGIN/)
  assert.match(landingScreen, /berlin-subtitle--cta/)
  assert.match(landingStyles, /\.berlin-subtitle--cta/)
})
