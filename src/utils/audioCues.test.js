import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getHistoryEntryKey,
  getNewStandardLossEntries,
} from './audioCues.js'

test('standard loss audio cue selects only new non-wager losses for the current player team', () => {
  const knownHistoryKeys = new Set(['old-loss'])
  const myTeam = { id: 'team-a', name: 'Berlin' }
  const matchHistory = [
    { id: 'old-loss', loserId: 'team-a', winnerId: 'team-b', isWager: false },
    { id: 'new-win', winnerId: 'team-a', loserId: 'team-c', isWager: false },
    { id: 'wager-loss', loserId: 'team-a', winnerId: 'team-d', isWager: true },
    { id: 'standard-loss', loserId: 'team-a', winnerId: 'team-e', isWager: false },
  ]

  assert.deepEqual(
    getNewStandardLossEntries({ matchHistory, knownHistoryKeys, myTeam, phase: 'phase1' }),
    [matchHistory[3]],
  )
})

test('standard loss audio cue suppresses losses while Wager Mode is active', () => {
  const myTeam = { id: 'team-a', name: 'Berlin' }
  const matchHistory = [
    { id: 'legacy-loss', loser: 'Berlin', winner: 'Tokyo', is_wager: false },
  ]

  assert.deepEqual(
    getNewStandardLossEntries({ matchHistory, knownHistoryKeys: new Set(), myTeam, phase: 'phase2' }),
    [],
  )
})

test('history entry key is stable when an id is unavailable', () => {
  assert.equal(
    getHistoryEntryKey({
      winnerId: 'team-a',
      loserId: 'team-b',
      domain: 'Tech Quiz',
      timestamp: '2026-05-18T10:00:00.000Z',
    }),
    'team-a|team-b|Tech Quiz|2026-05-18T10:00:00.000Z',
  )
})
