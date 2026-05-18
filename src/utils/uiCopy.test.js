import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const readProjectFile = (path) => fs.readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

test('visible event copy does not ship stale copyright years', () => {
  const loginScreen = readProjectFile('src/screens/LoginScreen.jsx')
  const aboutScreen = readProjectFile('src/screens/AboutScreen.jsx')
  const gameActions = readProjectFile('supabase/functions/game-actions/index.ts')

  assert.doesNotMatch(loginScreen, /© 2024/)
  assert.match(loginScreen, /© 2026/)
  assert.doesNotMatch(aboutScreen, /ESTABLISHED 2024/)
  assert.match(aboutScreen, /ESTABLISHED 2026/)
  assert.doesNotMatch(gameActions, /2024/)
})

test('wager mode spelling is consistent in visible source copy', () => {
  const wagerOverlay = readProjectFile('src/components/WagerModeOverlay.jsx')
  const screens = [
    wagerOverlay,
    readProjectFile('src/screens/AdminScreen.jsx'),
    readProjectFile('src/screens/ArenaScreen.jsx'),
    readProjectFile('src/data/rulebookData.js'),
  ].join('\n')

  assert.doesNotMatch(screens, /WAGOR|Weger|WEGER|Weger Mode/i)
  assert.match(wagerOverlay, /INITIATING WAGER MODE/)
  assert.match(wagerOverlay, /WAGER MODE ACTIVE/)
})

test('about GDG organizers exclude Pratyush while developer page keeps him', () => {
  const aboutScreen = readProjectFile('src/screens/AboutScreen.jsx')
  const devsScreen = readProjectFile('src/screens/DevsScreen.jsx')

  const organizersBlock = aboutScreen.slice(
    aboutScreen.indexOf('const organizers = ['),
    aboutScreen.indexOf('const connectLinks = ['),
  )
  assert.doesNotMatch(organizersBlock, /Pratyush Jaiswal/)
  assert.match(devsScreen, /Pratyush Jaiswal/)
})

test('wager elimination sound is scoped to the eliminated player only', () => {
  const app = readProjectFile('src/App.jsx')

  assert.match(app, /import \{ playElimination \} from '\.\/utils\/audio'/)
  assert.match(app, /const WagerEliminationAudioCue = \(\) =>/)
  assert.match(app, /user\?\.role !== 'player'/)
  assert.match(app, /gameState\.phase === 'phase2'/)
  assert.match(app, /status === 'eliminated'/)
  assert.match(app, /playElimination\(\)/)
})
