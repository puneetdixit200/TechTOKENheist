import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const landingScreen = readFileSync('src/screens/LandingScreen.jsx', 'utf8')
const landingStyles = readFileSync('src/screens/LandingScreen.css', 'utf8')

test('final heist CTA lines use the high-visibility subtitle treatment', () => {
  assert.match(landingScreen, /THROW THE DICE/)
  assert.match(landingScreen, /LET THE HEIST BEGIN/)
  assert.match(landingScreen, /berlin-subtitle--cta/)
  assert.match(landingStyles, /\.berlin-subtitle--cta/)
})

test('Rio section does not include the reverted hover lightning layer', () => {
  assert.doesNotMatch(landingScreen, /reol-black-lightning/)
  assert.doesNotMatch(landingStyles, /reol-black-lightning/)
  assert.doesNotMatch(landingStyles, /reolLightningFlicker/)
})
