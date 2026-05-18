import assert from 'node:assert/strict'
import test from 'node:test'

import { buildFinaleScoreStatus } from './finaleScoreStatus.js'

test('finale status keeps pre-match scoreless copy away from match-point wording', () => {
  assert.deepEqual(
    buildFinaleScoreStatus({ winsA: 0, winsB: 0, teamAName: 'Berlin', teamBName: 'Alicia' }),
    {
      cardClass: 'gap-even',
      header: 'OPENING STANDOFF',
      title: 'SCORELESS',
      description: 'The first round sets the pace.',
    },
  )
})

test('finale status uses deadlock copy for tied scores before match point', () => {
  assert.deepEqual(
    buildFinaleScoreStatus({ winsA: 1, winsB: 1, teamAName: 'Berlin', teamBName: 'Alicia' }),
    {
      cardClass: 'gap-even',
      header: 'DEAD EVEN',
      title: 'DEAD EVEN',
      description: 'The next round breaks the deadlock.',
    },
  )
})

test('finale status uses dead-even fate copy for match point scores', () => {
  for (const [winsA, winsB] of [[2, 2], [2, 1], [1, 2], [2, 0], [0, 2]]) {
    assert.deepEqual(
      buildFinaleScoreStatus({ winsA, winsB, teamAName: 'Berlin', teamBName: 'Alicia' }),
      {
        cardClass: 'gap-even',
        header: 'DEAD EVEN',
        title: 'DEAD EVEN',
        description: 'The next round decides fate.',
      },
      `${winsA}-${winsB} should use the dead-even card`,
    )
  }
})

test('finale status keeps non-match-point advantage copy before either team reaches 2 wins', () => {
  assert.deepEqual(
    buildFinaleScoreStatus({ winsA: 1, winsB: 0, teamAName: 'Berlin', teamBName: 'Alicia' }),
    {
      cardClass: 'gap-narrow',
      header: '+1 Berlin LEADS',
      title: 'NARROW ADVANTAGE',
      description: 'One mistake changes everything.',
    },
  )
})
