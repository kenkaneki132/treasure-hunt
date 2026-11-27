import { describe, expect, it } from 'vitest';
import {
  CHIPS, GRID_SIZE, MAX_PICKS, ROUND_SECONDS, START_BALANCE, TREASURE_COUNT,
  cellClass, createInitialState, drawTreasures, isLocked, multiplierFor, payoutTable, reducer, settle, stakeFor,
} from './engine';

// small deterministic PRNG for tests
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const run = (state, ...actions) => actions.reduce(reducer, state);
const running = () => run(createInitialState(), { type: 'START' });
const toZero = (s) => run(s, ...Array(ROUND_SECONDS).fill({ type: 'TICK' }));

describe('drawTreasures', () => {
  it('returns 5 UNIQUE cells in range (regression: original drew with replacement)', () => {
    for (let seed = 1; seed < 300; seed++) {
      const t = drawTreasures(seeded(seed));
      expect(t).toHaveLength(TREASURE_COUNT);
      expect(new Set(t).size).toBe(TREASURE_COUNT);
      t.forEach((c) => { expect(c).toBeGreaterThanOrEqual(1); expect(c).toBeLessThanOrEqual(GRID_SIZE); });
    }
  });
  it('is deterministic for a given rng and sorted', () => {
    expect(drawTreasures(seeded(42))).toEqual(drawTreasures(seeded(42)));
    const t = drawTreasures(seeded(7));
    expect([...t].sort((a, b) => a - b)).toEqual(t);
  });
  it('covers every cell over many draws (no dead cells)', () => {
    const seen = new Set();
    const rng = seeded(99);
    for (let i = 0; i < 400; i++) drawTreasures(rng).forEach((c) => seen.add(c));
    expect(seen.size).toBe(GRID_SIZE);
  });
});

describe('settle (original payout rule)', () => {
  it('any hit pays stake × (hits + 1)', () => {
    expect(settle([1, 2, 3], [3, 10, 11, 12, 13], 5)).toMatchObject({ hits: [3], stake: 15, reward: 30, net: 15, won: true });
    expect(settle([1, 2, 3], [1, 2, 11, 12, 13], 10)).toMatchObject({ stake: 30, reward: 90, net: 60 });
  });
  it('no hits loses the stake', () => {
    expect(settle([1, 2], [3, 4, 5, 6, 7], 20)).toMatchObject({ hits: [], stake: 40, reward: 0, net: -40, won: false });
  });
  it('multiplier table', () => {
    expect([0, 1, 2, 5].map(multiplierFor)).toEqual([0, 2, 3, 6]);
    expect(stakeFor([1, 2, 3, 4], 25)).toBe(100);
  });
});

describe('round flow', () => {
  it('can only pick while the timer is running', () => {
    const idle = createInitialState();
    expect(reducer(idle, { type: 'TOGGLE', cell: 5 }).picks).toEqual([]);
    expect(run(running(), { type: 'TOGGLE', cell: 5 }).picks).toEqual([5]);
  });

  it('toggles picks and enforces the 6-pick limit', () => {
    let s = run(running(), ...[1, 2, 3, 4, 5, 6, 7].map((cell) => ({ type: 'TOGGLE', cell })));
    expect(s.picks).toEqual([1, 2, 3, 4, 5, 6]);
    expect(s.message).toMatch(/at most 6/);
    s = run(s, { type: 'TOGGLE', cell: 3 });
    expect(s.picks).toEqual([1, 2, 4, 5, 6]);
    expect(MAX_PICKS).toBe(6);
  });

  it('ignores invalid cells', () => {
    for (const cell of [0, 49, 2.5, '3']) expect(run(running(), { type: 'TOGGLE', cell }).picks).toEqual([]);
  });

  it('settles exactly once at reveal and updates balance + stats', () => {
    let s = run(running(), { type: 'CHIP', value: 10 }, { type: 'TOGGLE', cell: 4 }, { type: 'TOGGLE', cell: 9 });
    s = toZero(s);
    expect(s.secondsLeft).toBe(0);
    s = reducer(s, { type: 'REVEAL', treasures: [4, 20, 30, 40, 48] });
    expect(s.phase).toBe('result');
    expect(s.outcome).toMatchObject({ hits: [4], stake: 20, reward: 40, net: 20 });
    expect(s.balance).toBe(START_BALANCE + 20);
    expect(s.stats).toEqual({ rounds: 1, wins: 1, biggestWin: 20 });
    // a duplicate REVEAL must not pay twice (the original re-applied payouts in an effect)
    expect(reducer(s, { type: 'REVEAL', treasures: [4, 9, 1, 2, 3] }).balance).toBe(START_BALANCE + 20);
  });

  it('a losing round deducts the stake', () => {
    let s = run(running(), { type: 'CHIP', value: 25 }, { type: 'TOGGLE', cell: 1 }, { type: 'TOGGLE', cell: 2 });
    s = reducer(toZero(s), { type: 'REVEAL', treasures: [10, 11, 12, 13, 14] });
    expect(s.balance).toBe(START_BALANCE - 50);
    expect(s.history[0]).toMatchObject({ won: false, stake: 50 });
  });

  it('a round with no picks is void (no stake, not counted)', () => {
    const s = reducer(toZero(running()), { type: 'REVEAL', treasures: [1, 2, 3, 4, 5] });
    expect(s.balance).toBe(START_BALANCE);
    expect(s.outcome.void).toBe(true);
    expect(s.stats.rounds).toBe(0);
  });

  it('REVEAL is ignored before the timer ends', () => {
    expect(reducer(running(), { type: 'REVEAL', treasures: [1, 2, 3, 4, 5] }).phase).toBe('running');
  });

  it('cannot bet more than the balance', () => {
    let s = run(createInitialState(30), { type: 'START' }, { type: 'TOGGLE', cell: 1 }, { type: 'CHIP', value: 25 });
    expect(s.chip).toBe(25);
    s = run(s, { type: 'TOGGLE', cell: 2 });
    expect(s.picks).toEqual([1]);
    expect(s.message).toMatch(/Not enough balance/);
    expect(run(s, { type: 'CHIP', value: 20 }, { type: 'TOGGLE', cell: 2 }).picks).toEqual([1]);   // 2×20 > 30
  });

  it('START is refused when broke', () => {
    expect(reducer(createInitialState(0), { type: 'START' }).phase).toBe('idle');
  });

  it('isLocked once all picks are used; removing one unlocks', () => {
    const full = run(running(), ...[1, 2, 3, 4, 5, 6].map((cell) => ({ type: 'TOGGLE', cell })));
    expect(isLocked(full)).toBe(true);
    expect(isLocked(reducer(full, { type: 'TOGGLE', cell: 4 }))).toBe(false);
  });

  it('payoutTable lists each possible hit count', () => {
    expect(payoutTable([1, 2, 3], 10)).toEqual([
      { hits: 1, multiplier: 2, reward: 60 }, { hits: 2, multiplier: 3, reward: 90 }, { hits: 3, multiplier: 4, reward: 120 },
    ]);
    expect(payoutTable([], 10)).toEqual([]);
    expect(payoutTable([1, 2, 3, 4, 5, 6], 1)).toHaveLength(TREASURE_COUNT);   // at most 5 treasures can be hit
  });
});

describe('undo / repeat / next round / new game', () => {
  it('undo restores previous picks and chip, step by step (immutably)', () => {
    const before = run(running(), { type: 'TOGGLE', cell: 1 });
    const s = run(before, { type: 'CHIP', value: 20 }, { type: 'TOGGLE', cell: 2 });
    const u1 = reducer(s, { type: 'UNDO' });
    expect(u1).toMatchObject({ picks: [1], chip: 20 });
    const u2 = reducer(u1, { type: 'UNDO' });
    expect(u2).toMatchObject({ picks: [1], chip: 1 });
    expect(s.picks).toEqual([1, 2]);           // original state untouched
    expect(reducer(running(), { type: 'UNDO' })).toEqual(running());
  });

  it('next round remembers the bet; repeat restores it', () => {
    let s = run(running(), { type: 'CHIP', value: 5 }, { type: 'TOGGLE', cell: 7 }, { type: 'TOGGLE', cell: 8 });
    s = reducer(toZero(s), { type: 'REVEAL', treasures: [1, 2, 3, 4, 5] });
    s = run(s, { type: 'NEXT_ROUND' });
    expect(s).toMatchObject({ phase: 'idle', picks: [], treasures: [], lastRound: { picks: [7, 8], chip: 5 } });
    s = run(s, { type: 'START' }, { type: 'REPEAT' });
    expect(s).toMatchObject({ picks: [7, 8], chip: 5 });
    expect(reducer(s, { type: 'UNDO' }).picks).toEqual([]);
  });

  it('new game resets balance and history', () => {
    let s = run(running(), { type: 'TOGGLE', cell: 1 });
    s = reducer(toZero(s), { type: 'REVEAL', treasures: [2, 3, 4, 5, 6] });
    expect(reducer(s, { type: 'NEW_GAME' })).toEqual(createInitialState());
  });
});

describe('cellClass keeps the original CSS contract', () => {
  it.each([
    [1, [1], [1], 'selectedtreasureitem'],
    [1, [], [1], 'treasureitem'],
    [1, [1], [], 'selectedGriditem'],
    [1, [], [], 'Griditem'],
  ])('cell %i picks=%j treasures=%j → %s', (cell, picks, treasures, cls) => {
    expect(cellClass(cell, picks, treasures)).toBe(cls);
  });
  it('chip values unchanged', () => expect(CHIPS).toEqual([1, 5, 10, 20, 25]));
});
