import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildIntelFeedLogs,
  buildTelemetryLogs,
  formatMatchOutcomeLog,
} from './eventLogs.js'

test('match outcome logs use the event-wide required format', () => {
  assert.equal(
    formatMatchOutcomeLog({
      winner: 'Berlin',
      loser: 'Denver',
      domain: 'Tech Quiz',
    }),
    'Berlin defeated Denver in Tech Quiz domain'
  )
})

test('player telemetry logs include only that player match history', () => {
  const logs = buildTelemetryLogs({
    matchHistory: [
      { id: '1', winner: 'Berlin', loser: 'Denver', winnerId: 'team-a', loserId: 'team-b', domain: 'Tech Quiz', time: '10:00' },
      { id: '2', winner: 'Tokyo', loser: 'Rio', winnerId: 'team-c', loserId: 'team-d', domain: 'Frontend Dev', time: '10:01' },
      { id: '3', winner: 'Nairobi', loser: 'Berlin', winner_id: 'team-e', loser_id: 'team-a', domain: 'Guess Output', time: '10:02' },
    ],
    teamId: 'team-a',
    teamName: 'Berlin',
  })

  assert.deepEqual(logs.map((log) => log.message), [
    'You were defeated by Nairobi in domain Guess Output',
    'You defeated Denver in domain Tech Quiz',
  ])
})

test('player telemetry uses id matching and readable fallback names', () => {
  const logs = buildTelemetryLogs({
    matchHistory: [
      { id: '1', winnerName: 'Alicia', loserName: 'Rio', winner_id: 'team-a', loser_id: 'team-b', domain: 'Tech Pitch', time: '10:03' },
      { id: '2', winner: 'Bogota', loser: 'Oslo', winner_id: 'team-c', loser_id: 'team-d', domain: 'Tech Quiz', time: '10:04' },
    ],
    teamId: 'team-b',
    teamName: 'Rio',
  })

  assert.deepEqual(logs.map((log) => log.message), [
    'You were defeated by Alicia in domain Tech Pitch',
  ])
})

test('intel feed preserves global activities newest first', () => {
  const logs = buildIntelFeedLogs([
    { id: 'older', message: 'Berlin entered the arena.', time: '10:00' },
    { id: 'newer', message: 'Admin adjusted Denver tokens by +1.', time: '10:01' },
  ])

  assert.deepEqual(logs.map((log) => log.message), [
    'Admin adjusted Denver tokens by +1.',
    'Berlin entered the arena.',
  ])
})
