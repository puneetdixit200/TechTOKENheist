import assert from 'node:assert/strict'
import test from 'node:test'

import { fetchPublicStateRows } from '../src/lib/publicState.js'

test('public state is fetched through the public-state edge function', async () => {
  const calls = []
  const expectedRows = {
    systemRows: [{ key: 'game' }],
    teamsRows: [{ id: 'team-1', name: 'Team 01' }],
    queueRows: [],
    matchRows: [],
    historyRows: [],
    notificationRows: [],
    tokenHistory: [],
  }

  const fakeSupabase = {
    functions: {
      invoke: async (name, options) => {
        calls.push({ name, options })
        return { data: expectedRows, error: null }
      },
    },
  }

  assert.deepEqual(await fetchPublicStateRows(fakeSupabase), expectedRows)
  assert.deepEqual(calls, [{ name: 'public-state', options: { body: {} } }])
})

test('public state fetch surfaces edge function errors', async () => {
  const fakeSupabase = {
    functions: {
      invoke: async () => ({ data: null, error: new Error('permission denied') }),
    },
  }

  await assert.rejects(
    () => fetchPublicStateRows(fakeSupabase),
    /permission denied/
  )
})
