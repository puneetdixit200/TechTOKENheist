import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import {
  canAccessPlayerPath,
  getAuthenticatedHomePath,
  getRoleRedirectPath,
  isGameStartedForPlayers,
  isAdminUser,
  isPlayerUser,
} from './routeAccess.js'

const readProjectFile = (path) => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

test('route access helpers separate admin and player sessions', () => {
  const admin = { role: 'admin', token: 'session-token' }
  const player = { role: 'player', teamId: 'alpha' }
  const activeGame = { status: 'active', isGameActive: true }
  const waitingGame = { status: 'not_started', isGameActive: false }

  assert.equal(isAdminUser(admin), true)
  assert.equal(isAdminUser({ role: 'admin' }), false)
  assert.equal(isAdminUser({ role: 'admin', adminSessionToken: 'session-token', adminSessionExpiresAt: Date.now() - 1 }), false)
  assert.equal(isPlayerUser(admin), false)
  assert.equal(isPlayerUser(player), true)
  assert.equal(isPlayerUser({ role: 'player' }), false)
  assert.equal(isAdminUser(player), false)
  assert.equal(getAuthenticatedHomePath(admin, waitingGame), '/admin')
  assert.equal(getAuthenticatedHomePath(player, activeGame), '/lobby')
  assert.equal(getAuthenticatedHomePath(player, waitingGame), '/about')
  assert.equal(getAuthenticatedHomePath({ role: 'player' }), null)
  assert.equal(getAuthenticatedHomePath({ role: 'guest' }), null)
  assert.equal(getRoleRedirectPath(admin, waitingGame), '/admin')
  assert.equal(getRoleRedirectPath(player, activeGame), '/lobby')
  assert.equal(getRoleRedirectPath(player, waitingGame), '/about')
  assert.equal(getRoleRedirectPath(null), '/login')
})

test('player mission routes stay locked until the admin-started match is active', () => {
  const waitingGame = { status: 'not_started', isGameActive: false }
  const startingGame = { status: 'starting', isGameActive: false }
  const activeGame = { status: 'active', isGameActive: true }

  assert.equal(isGameStartedForPlayers(waitingGame), false)
  assert.equal(isGameStartedForPlayers(startingGame), false)
  assert.equal(isGameStartedForPlayers(activeGame), true)
  assert.equal(canAccessPlayerPath('/about', waitingGame), true)
  assert.equal(canAccessPlayerPath('/devs.html', waitingGame), true)
  assert.equal(canAccessPlayerPath('/lobby', waitingGame), false)
  assert.equal(canAccessPlayerPath('/arena.html', startingGame), false)
  assert.equal(canAccessPlayerPath('/rulebook', activeGame), true)
})

test('app routes use role-specific guards instead of truthy user checks', () => {
  const app = readProjectFile('src/App.jsx')

  assert.match(app, /const PlayerRoute = \(\{ children \}\) =>/)
  assert.match(app, /const AdminRoute = \(\{ children \}\) =>/)
  assert.match(app, /canAccessPlayerPath\(location\.pathname, gameState\)/)
  assert.match(app, /getRoleRedirectPath\(user, gameState\)/)
  assert.match(app, /isGameStartedForPlayers\(gameState\)/)
  assert.match(app, /isPlayerUser\(user\)/)
  assert.match(app, /isAdminUser\(user\)/)
  assert.doesNotMatch(app, /user \? <PlayerLayout>/)
  assert.doesNotMatch(app, /user && user\.role === 'admin' \?/)
})

test('legacy html entrypoint URLs redirect to canonical React routes', () => {
  const app = readProjectFile('src/App.jsx')

  assert.match(app, /LEGACY_HTML_ROUTE_REDIRECTS/)
  assert.match(app, /\['\/index\.html', '\/'\]/)
  assert.match(app, /\['\/login\.html', '\/login'\]/)
  assert.match(app, /\['\/admin\.html', '\/admin'\]/)
  assert.match(app, /\['\/rulebook\.html', '\/rulebook'\]/)
  assert.match(app, /LEGACY_HTML_ROUTE_REDIRECTS\.map\(\(\[legacyPath, canonicalPath\]\) => \(/)
  assert.match(app, /path=\{legacyPath\}/)
  assert.match(app, /<Navigate to=\{canonicalPath\} replace \/>/)
})

test('player startup uses only the TechToken loading video, countdown, and text', () => {
  const app = readProjectFile('src/App.jsx')
  const matchStartOverlay = readProjectFile('src/components/MatchStartOverlay.jsx')
  const matchStartCss = readProjectFile('src/components/MatchStartOverlay.css')

  assert.doesNotMatch(app, /CountdownOverlay/)
  assert.match(app, /user\?\.role === 'player' && <MatchStartOverlay \/>/)
  assert.match(matchStartOverlay, /const START_DURATION_MS = 10_000/)
  assert.match(matchStartOverlay, /gameState\.status === 'starting'/)
  assert.match(matchStartOverlay, /gameState\.countdownStartedAt/)
  assert.match(matchStartOverlay, /import\.meta\.glob/)
  assert.match(matchStartOverlay, /techtoken-loading\.\{mp4,webm\}/)
  assert.match(matchStartOverlay, /loading-video-bg/)
  assert.match(matchStartOverlay, /TECHTOKEN HEIST/)
  assert.match(matchStartOverlay, /MATCH STARTS IN/)
  assert.doesNotMatch(matchStartOverlay, /fetch\(/)
  assert.doesNotMatch(matchStartOverlay, /void-aura/)
  assert.doesNotMatch(matchStartOverlay, /infinite-void-ring/)
  assert.doesNotMatch(matchStartOverlay, /void-eye-mark/)
  assert.doesNotMatch(matchStartOverlay, /tear-part/)
  assert.doesNotMatch(matchStartOverlay, /ANANT SHUNYATA/)
  assert.doesNotMatch(matchStartOverlay, /INFINITE VOID/)
  assert.match(matchStartCss, /loading-video-bg/)
  assert.match(matchStartCss, /void-countdown-shell/)
  assert.doesNotMatch(matchStartCss, /infinite-void-ring/)
  assert.doesNotMatch(matchStartCss, /void-eye-mark/)
  assert.doesNotMatch(matchStartCss, /tear-part/)
})
