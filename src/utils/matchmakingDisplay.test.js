import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const readProjectFile = (relativePath) => fs.readFileSync(
  new URL(`../../${relativePath}`, import.meta.url),
  'utf8'
)

test('battle screen renders queue pair locks from matched_with state', () => {
  const battleScreen = readProjectFile('src/screens/BattleScreen.jsx')

  assert.match(battleScreen, /myQueueEntry/)
  assert.match(battleScreen, /const myMatchedWith = myQueueEntry\?\.matchedWith \|\| myQueueEntry\?\.matched_with \|\| null/)
  assert.match(battleScreen, /if \(myMatchedWith\)/)
  assert.doesNotMatch(battleScreen, /status === 'matched'/)
})

test('player shell counts only valid ready queue pairs', () => {
  const app = readProjectFile('src/App.jsx')

  assert.match(app, /import \{ buildReadyQueuePairs \} from '\.\/utils\/matchmaking'/)
  assert.match(app, /const readyPairs = buildReadyQueuePairs\(\{/)
  assert.match(app, /matchConstraints/)
  assert.doesNotMatch(app, /buildQueuePairsFromEntries\(matchmakingQueue\)\.length/)
})

test('queue diagnostics receive active match context', () => {
  const adminScreen = readProjectFile('src/screens/AdminScreen.jsx')
  const arenaScreen = readProjectFile('src/screens/ArenaScreen.jsx')

  assert.match(adminScreen, /buildQueueDiagnostics\(\{\s*gameState,\s*teams,\s*matchmakingQueue,\s*matchConstraints,\s*activeMatches\s*\}\)/)
  assert.match(arenaScreen, /buildQueueDiagnostics\(\{\s*gameState,\s*teams,\s*matchmakingQueue,\s*matchConstraints,\s*activeMatches\s*\}\)/)
})

test('admin rematch button invokes queue-only rematching', () => {
  const adminScreen = readProjectFile('src/screens/AdminScreen.jsx')

  assert.match(adminScreen, /rematchQueue/)
  assert.match(adminScreen, /onClick=\{\(\) => safeAction\('rematchQueue', rematchQueue\)\}/)
  assert.match(adminScreen, /REMATCH/)
  assert.doesNotMatch(adminScreen, /FORCE ASSIGN/)
  assert.doesNotMatch(adminScreen, /onClick=\{\(\) => safeAction\('autoMatchPairs', autoMatchPairs\)\}/)
  assert.doesNotMatch(adminScreen, /onClick=\{enrollAllEligible\}/)
})

test('admin confirms wheel-selected domain before creating a match', () => {
  const adminScreen = readProjectFile('src/screens/AdminScreen.jsx')

  assert.match(adminScreen, /pendingDomainConfirm/)
  assert.match(adminScreen, /const pairTeamA = teams\.find\(\(team\) => team\.id === pair\.teamAId\)/)
  assert.match(adminScreen, /const pairTeamB = teams\.find\(\(team\) => team\.id === pair\.teamBId\)/)
  assert.match(adminScreen, /pairTeamA\?\.tokens \?\? 0/)
  assert.match(adminScreen, /pairTeamB\?\.tokens \?\? 0/)
  assert.match(adminScreen, /const handleQueueDomainSpin = \(pair, domain\) =>/)
  assert.match(adminScreen, /setPendingDomainConfirm\(\{\s*pair,\s*domain\s*\}\)/)
  assert.match(adminScreen, /value=\{pendingDomainConfirm\.domain\}/)
  assert.match(adminScreen, /onChange=\{\(e\) => setPendingDomainConfirm\(\(current\) => \(\{\s*\.\.\.current,\s*domain: e\.target\.value\s*\}\)\)\}/)
  assert.match(adminScreen, /CONTINUE TO VAULTS/)
  assert.match(adminScreen, /safeAction\(`createMatch:\$\{pair\.teamAId\}:\$\{pair\.teamBId\}`, async \(\) => \{[\s\S]*createMatch\(pair\.teamAId, pair\.teamBId, domain\)/)
  assert.doesNotMatch(adminScreen, /onSpin=\{\(domain\) => createMatch\(pair\.teamAId, pair\.teamBId, domain\)\}/)
})

test('admin delete team action uses confirmation modal', () => {
  const adminScreen = readProjectFile('src/screens/AdminScreen.jsx')

  assert.match(adminScreen, /const handleDeleteTeam = \(team\) =>/)
  assert.match(adminScreen, /title: 'DELETE PROFILE'/)
  assert.match(adminScreen, /onConfirm: \(\) => safeAction\(`deleteTeam:\$\{team\.id\}`, \(\) => deleteTeam\(team\.id\)\)/)
  assert.match(adminScreen, /onClick=\{\(\) => handleDeleteTeam\(t\)\}/)
  assert.doesNotMatch(adminScreen, /onClick=\{\(\) => deleteTeam\(t\.id\)\}/)
})

test('arena shows player matchmaking field diagnostics and removes crew roster', () => {
  const arenaScreen = readProjectFile('src/screens/ArenaScreen.jsx')

  assert.match(arenaScreen, /buildTeamMatchmakingDiagnostics/)
  assert.match(arenaScreen, /MATCHMAKING FIELD/)
  assert.match(arenaScreen, /LOCK POSSIBLE/)
  assert.match(arenaScreen, /TELEMETRY LOGS/)
  assert.match(arenaScreen, /INTEL FEED/)
  assert.doesNotMatch(arenaScreen, /CREW ROSTER/)
})

test('admin recruit views expose connection status and all-team match diagnostics', () => {
  const adminScreen = readProjectFile('src/screens/AdminScreen.jsx')

  assert.match(adminScreen, /ConnectionBadge/)
  assert.match(adminScreen, /isConnected/)
  assert.match(adminScreen, /RECRUIT MATCH MATRIX/)
  assert.match(adminScreen, /buildTeamMatchmakingDiagnostics/)
})

test('admin logs split global intel feed from match telemetry history', () => {
  const adminScreen = readProjectFile('src/screens/AdminScreen.jsx')

  assert.match(adminScreen, /buildIntelFeedLogs/)
  assert.match(adminScreen, /buildTelemetryLogs/)
  assert.doesNotMatch(adminScreen, /const telemetryLogs = useMemo\(\(\) => \{\s*return \[\.\.\.notifications\]\.reverse\(\)/)
})

test('leaderboards display token update timestamps', () => {
  const adminScreen = readProjectFile('src/screens/AdminScreen.jsx')
  const lobbyScreen = readProjectFile('src/screens/LobbyScreen.jsx')

  assert.match(adminScreen, /formatLeaderboardTimestamp\(t\.lastTokenUpdateTime\)/)
  assert.match(adminScreen, /LAST TOKEN UPDATE/)
  assert.match(lobbyScreen, /formatLeaderboardTimestamp\(team\.lastTokenUpdateTime\)/)
  assert.match(lobbyScreen, /LAST TOKEN/)
})

test('finale screen avoids emoji glyph alignment and exposes music controls before victory', () => {
  const finaleOverlay = readProjectFile('src/components/FinaleOverlay.jsx')
  const finaleCss = readProjectFile('src/components/FinaleOverlay.css')

  assert.match(finaleOverlay, /const FinaleAudioPlayer = \(/)
  assert.match(finaleOverlay, /<FinaleAudioPlayer/)
  assert.doesNotMatch(finaleOverlay, /🐺/)
  assert.match(finaleCss, /\.finale-audio-player/)
  assert.match(finaleCss, /\.victory-championship-panel/)
})
