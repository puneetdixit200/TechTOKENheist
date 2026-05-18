import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const readProjectFile = (relativePath) => fs.readFileSync(
  new URL(`../../${relativePath}`, import.meta.url),
  'utf8'
)

const getCaseBlock = (source, startCase, endCase) => {
  const start = source.indexOf(startCase)
  const end = source.indexOf(endCase, start)
  assert.notEqual(start, -1, `${startCase} block missing`)
  assert.notEqual(end, -1, `${endCase} block missing`)
  return source.slice(start, end)
}

test('edge game actions do not read sysCheck before it is initialized', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')

  const createTeamBlock = getCaseBlock(edgeFunction, "case 'createTeam':", "case 'editTeam':")
  assert.doesNotMatch(createTeamBlock, /phase:\s*sysCheck\?\./)
  const createTeamQueueInsert = createTeamBlock.match(/from\('matchmaking_queue'\)[\s\S]*?insert\(\[\s*\{[\s\S]*?\}\s*,?\s*\]\)/)?.[0] || ''
  assert.match(createTeamQueueInsert, /team_id:\s*teamId/)
  assert.match(createTeamQueueInsert, /team_name:\s*name/)
  assert.match(createTeamQueueInsert, /team_tokens:\s*payloadData\.tokens \?\? 1/)
  assert.doesNotMatch(createTeamQueueInsert, /\bphase\s*:/)

  const declareWinnerBlock = getCaseBlock(edgeFunction, "case 'declareWinner':", "case 'spinDomain':")
  assert.doesNotMatch(declareWinnerBlock, /phase:\s*sysCheck\?\./)
  assert.match(declareWinnerBlock, /phase:\s*system\?\.phase \|\| 'phase1'/)
})

test('wager phase transition rematches queued teams without clearing active matches', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')
  const togglePhaseBlock = getCaseBlock(edgeFunction, "case 'togglePhase':", "case 'createTeam':")

  assert.doesNotMatch(togglePhaseBlock, /from\('active_matches'\)\.delete/)
  assert.match(togglePhaseBlock, /from\('matchmaking_queue'\)[\s\S]{0,120}\.update\(\{\s*matched_with:\s*null\s*\}\)[\s\S]{0,120}\.not\('matched_with', 'is', null\)/)
  assert.match(togglePhaseBlock, /await autoMatchPairs\(\)/)
})

test('edge automatching passes current phase into largest-difference wager scoring', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')
  const sharedMatchmaking = readProjectFile('supabase/functions/_shared/matchmaking.ts')
  const matchQueuedBlock = getCaseBlock(edgeFunction, 'const matchQueuedTeams = async', 'const autoMatchPairs = async')

  assert.match(matchQueuedBlock, /const system = await getGameSystem\(\)/)
  assert.match(matchQueuedBlock, /gameState:\s*\{\s*phase:\s*system\?\.phase \|\| 'phase1',\s*domains:\s*system\?\.domains \|\| DEFAULT_DOMAINS\s*\}/)
  assert.match(sharedMatchmaking, /function scorePhase2\(teamA, teamB\)[\s\S]*return -Math\.abs\(\(teamA\.tokens \|\| 0\) - \(teamB\.tokens \|\| 0\)\)/)
  assert.match(sharedMatchmaking, /isPhase2[\s\S]{0,160}\? scorePhase2\(eligible\[i\], eligible\[j\]\)/)
})

test('edge wager matchmaking applies only consecutive-domain safety from match history', () => {
  const sharedMatchmaking = readProjectFile('supabase/functions/_shared/matchmaking.ts')

  assert.match(sharedMatchmaking, /const isPhase2 = gameState\?\.phase === 'phase2'/)
  assert.match(sharedMatchmaking, /if \(!isPhase2 && \(cA\.opponents\?\.\[teamB\.id\] \|\| 0\) >= 2\)/)
  assert.doesNotMatch(sharedMatchmaking, /BOTH PHASES: No consecutive repeat opponent/)
  assert.match(sharedMatchmaking, /if \(!isPhase2\) \{[\s\S]*cA\.combos\?\.\[comboKeyA\][\s\S]*\}/)
  assert.match(sharedMatchmaking, /if \(cA\.lastDomain === domain\) return false/)
  assert.match(sharedMatchmaking, /lastDomainByTeamId/)
})

test('wager automatching keeps teams queued until admin confirms a spun domain', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')
  const matchQueuedBlock = getCaseBlock(edgeFunction, 'const matchQueuedTeams = async', 'const autoMatchPairs = async')
  const createMatchBlock = getCaseBlock(edgeFunction, "case 'createMatch':", "case 'declareWinner':")

  assert.doesNotMatch(matchQueuedBlock, /from\('active_matches'\)\.insert/)
  assert.doesNotMatch(matchQueuedBlock, /from\('teams'\)\.update\(\{\s*status:\s*'fighting'\s*\}\)/)
  assert.doesNotMatch(matchQueuedBlock, /from\('matchmaking_queue'\)\.delete\(\)\.in\('team_id'/)
  assert.match(matchQueuedBlock, /from\('matchmaking_queue'\)\.update\(\{\s*matched_with:\s*p\.teamBId\s*\}\)\.eq\('team_id', p\.teamAId\)/)
  assert.match(matchQueuedBlock, /from\('matchmaking_queue'\)\.update\(\{\s*matched_with:\s*p\.teamAId\s*\}\)\.eq\('team_id', p\.teamBId\)/)
  assert.match(createMatchBlock, /const system = await getGameSystem\(\)/)
  assert.match(createMatchBlock, /is_wager:\s*system\?\.phase === 'phase2'/)
})

test('active matches use current wager phase when declaring a winner', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')
  const declareWinnerBlock = getCaseBlock(edgeFunction, "case 'declareWinner':", "case 'spinDomain':")

  assert.match(declareWinnerBlock, /const system = await getGameSystem\(\)/)
  assert.match(declareWinnerBlock, /const isWager = Boolean\(match\?\.is_wager \|\| match\?\.isWager \|\| system\?\.phase === 'phase2'\)/)
  assert.match(declareWinnerBlock, /calculateWagerOutcome\(winnerTeam, loserTeam\)/)
  assert.match(declareWinnerBlock, /reason: isWager \? 'Wager win' : 'Match win'/)
})

test('winner declaration claims the active match before editing guarded team rows', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')
  const declareWinnerBlock = getCaseBlock(edgeFunction, "case 'declareWinner':", "case 'spinDomain':")

  const claimIndex = declareWinnerBlock.indexOf("from('active_matches')")
  const teamUpdateIndex = declareWinnerBlock.indexOf("from('teams').update")
  assert.ok(claimIndex > -1, 'active match claim is missing')
  assert.ok(teamUpdateIndex > -1, 'team update is missing')
  assert.ok(claimIndex < teamUpdateIndex, 'active match must be claimed before guarded team updates')
  assert.match(declareWinnerBlock, /if \(winnerUpdate\.error\) return fail\(500, winnerUpdate\.error\.message\)/)
  assert.match(declareWinnerBlock, /if \(loserUpdate\.error\) return fail\(500, loserUpdate\.error\.message\)/)
})

test('enrollment repairs orphan fighting teams before building the queue', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')
  const repairBlock = getCaseBlock(edgeFunction, 'const releaseOrphanedFightingTeams = async () => {', 'const enrollAllEligibleTeams = async () => {')
  const enrollBlock = getCaseBlock(edgeFunction, 'const enrollAllEligibleTeams = async () => {', 'const matchQueuedTeams = async')

  assert.match(repairBlock, /from\('active_matches'\)\.select\('team_a, team_b'\)/)
  assert.match(repairBlock, /from\('matchmaking_queue'\)\.select\('team_id, team_name, team_tokens'\)/)
  assert.match(repairBlock, /const queuedOrphans = orphanedTeams\.filter/)
  assert.match(repairBlock, /tokens: Number\(queueRow\.team_tokens \?\? team\.tokens \?\? 1\)/)
  assert.match(repairBlock, /const unqueuedOrphanIds = orphanedTeams/)
  assert.match(repairBlock, /const unqueuedStatus = system\?\.phase === 'phase2' \? 'eliminated' : 'timeout'/)
  assert.match(enrollBlock, /await releaseOrphanedFightingTeams\(\)/)
})

test('force enrollment action runs the matcher after repairing queue state', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')
  const enrollCaseBlock = getCaseBlock(edgeFunction, "case 'enrollAllEligible':", "case 'startGame':")

  assert.match(enrollCaseBlock, /const pairs = await autoMatchPairs\(\)/)
  assert.match(enrollCaseBlock, /return ok\(\{\s*pairs\s*\}\)/)
  assert.doesNotMatch(enrollCaseBlock, /await enrollAllEligibleTeams\(\);\s*return ok\(\)/)
})

test('rematch queue action resets queue locks without enrolling extra teams', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')
  const useGameState = readProjectFile('src/hooks/useGameState.jsx')
  const matchQueuedBlock = getCaseBlock(edgeFunction, 'const matchQueuedTeams = async', 'const autoMatchPairs = async')
  const rematchCaseBlock = getCaseBlock(edgeFunction, "case 'rematchQueue':", "case 'autoMatchPairs':")

  assert.match(edgeFunction, /'rematchQueue'/)
  assert.match(matchQueuedBlock, /if \(enrollEligibleTeams\) \{\s*await enrollAllEligibleTeams\(\);\s*\}/)
  assert.match(matchQueuedBlock, /if \(resetExistingLocks\) \{[\s\S]*from\('matchmaking_queue'\)[\s\S]*update\(\{\s*matched_with:\s*null\s*\}\)[\s\S]*not\('matched_with', 'is', null\)/)
  assert.match(edgeFunction, /const rematchQueuedTeams = async \(\) => matchQueuedTeams\(\{\s*enrollEligibleTeams:\s*false,\s*resetExistingLocks:\s*true\s*\}\)/)
  assert.match(rematchCaseBlock, /const pairs = await rematchQueuedTeams\(\)/)
  assert.match(rematchCaseBlock, /return ok\(\{\s*pairs\s*\}\)/)
  assert.match(useGameState, /rematchQueue: async \(\) => get\(\)\._invoke\('rematchQueue'\)/)
})

test('admin winner buttons surface declare-winner failures', () => {
  const adminScreen = readProjectFile('src/screens/AdminScreen.jsx')

  assert.match(adminScreen, /const handleDeclareWinner = \(match, winningTeam\) =>/)
  assert.match(adminScreen, /safeAction\(`declareWinner:\$\{match\.id\}`, \(\) => declareWinner\(match\.id, winningTeam\.id\)\)/)
  assert.doesNotMatch(adminScreen, /onClick=\{\(\) => declareWinner\(m\.id, m\.teamA\.id\)\}/)
  assert.doesNotMatch(adminScreen, /onClick=\{\(\) => declareWinner\(m\.id, m\.teamB\.id\)\}/)
})

test('admin token adjustments keep queued token cache in sync', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')
  const updateTokensBlock = getCaseBlock(edgeFunction, "case 'updateTokens':", "case 'recoverFromTimeout':")

  assert.match(updateTokensBlock, /const teamUpdate = await supabaseAdmin\.from\('teams'\)\.update\(updates\)\.eq\('id', teamId\)/)
  assert.match(updateTokensBlock, /if \(teamUpdate\.error\) return fail\(500, teamUpdate\.error\.message\)/)
  assert.match(updateTokensBlock, /from\('matchmaking_queue'\)[\s\S]*\.update\(\{\s*team_tokens:\s*Math\.max\(0, newTokens\),\s*matched_with:\s*null\s*\}\)[\s\S]*\.eq\('team_id', teamId\)/)
})

test('player sessions update connection presence through login heartbeat and logout', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')
  const loginBlock = getCaseBlock(edgeFunction, "case 'login':", "case 'heartbeat':")
  const heartbeatBlock = getCaseBlock(edgeFunction, "case 'heartbeat':", "case 'logout':")
  const logoutBlock = getCaseBlock(edgeFunction, "case 'logout':", "case 'joinQueue':")

  assert.match(edgeFunction, /const playerActions = \[[^\]]*'heartbeat'[^\]]*'logout'[^\]]*\]/)
  assert.match(loginBlock, /is_connected:\s*true,\s*last_seen_at:\s*Date\.now\(\)/)
  assert.match(loginBlock, /insertNotification\(`\$\{team\.name\} entered the arena\.`\)/)
  assert.match(heartbeatBlock, /is_connected:\s*true,\s*last_seen_at:\s*Date\.now\(\)/)
  assert.match(logoutBlock, /is_connected:\s*false,\s*last_seen_at:\s*Date\.now\(\)/)
})

test('start game uses a server-authored countdown before enrollment and automatching', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')
  const startGameBlock = getCaseBlock(edgeFunction, "case 'startGame':", "case 'activateStartedGame':")
  const activateBlock = getCaseBlock(edgeFunction, "case 'activateStartedGame':", "case 'stopGame':")
  const matchQueuedBlock = getCaseBlock(edgeFunction, 'const matchQueuedTeams = async', 'const autoMatchPairs = async')
  const countdownBranch = startGameBlock.slice(startGameBlock.indexOf('const nowMs = Date.now();'))

  assert.match(edgeFunction, /'activateStartedGame'/)
  assert.match(startGameBlock, /const countdownDurationMs = 10 \* 1000/)
  assert.match(startGameBlock, /const gameStartsAt = nowMs \+ countdownDurationMs/)
  assert.match(startGameBlock, /status:\s*'starting'/)
  assert.match(startGameBlock, /countdown_started_at:\s*nowMs/)
  assert.match(startGameBlock, /countdown_duration_ms:\s*countdownDurationMs/)
  assert.doesNotMatch(countdownBranch, /await enrollAllEligibleTeams\(\)/)
  assert.doesNotMatch(countdownBranch, /await autoMatchPairs\(\)/)
  assert.match(activateBlock, /await enrollAllEligibleTeams\(\)/)
  assert.match(activateBlock, /const pairs = await autoMatchPairs\(\)/)
  assert.match(matchQueuedBlock, /system\?\.status !== 'active'/)
})

test('winner declaration stores id-linked telemetry and required win log text', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')
  const declareWinnerBlock = getCaseBlock(edgeFunction, "case 'declareWinner':", "case 'spinDomain':")

  assert.match(edgeFunction, /const formatDomainForLog = \(domain\) =>/)
  assert.match(edgeFunction, /const formatMatchOutcomeNotification = \(\{ winnerName, loserName, domain \}\) =>/)
  assert.match(declareWinnerBlock, /const outcomeMessage = formatMatchOutcomeNotification\(\{\s*winnerName:\s*winnerTeam\.name,\s*loserName:\s*loserTeam\.name,\s*domain:\s*match\.domain,\s*\}\)/)
  assert.match(declareWinnerBlock, /await insertNotification\(outcomeMessage\)/)
  assert.match(declareWinnerBlock, /winner_id:\s*winnerId/)
  assert.match(declareWinnerBlock, /loser_id:\s*loserId/)
})

test('match start intel notifications include the assigned domain', () => {
  const edgeFunction = readProjectFile('supabase/functions/game-actions/index.ts')
  const createMatchBlock = getCaseBlock(edgeFunction, "case 'createMatch':", "case 'declareWinner':")
  const smokeScript = readProjectFile('scripts/verify-admin-workflow-smoke.js')

  assert.match(edgeFunction, /const formatMatchStartedNotification = \(\{ teamAName, teamBName, domain \}\) =>/)
  assert.match(edgeFunction, /`Match started: \$\{teamAName\} vs \$\{teamBName\} in \$\{formatDomainForLog\(domain\)\} domain\.`/)
  assert.match(createMatchBlock, /await insertNotification\(formatMatchStartedNotification\(\{\s*teamAName:\s*teamA\?\.name \|\| teamAId,\s*teamBName:\s*teamB\?\.name \|\| teamBId,\s*domain,\s*\}\)\)/)
  assert.match(smokeScript, /message:\s*`\$\{winner\.name\} defeated \$\{loser\.name\} in \$\{match\.domain\} domain`/)
  assert.match(smokeScript, /message:\s*`Match started: \$\{teamA\.name\} vs \$\{teamB\.name\} in \$\{domain\} domain\.`/)
})
