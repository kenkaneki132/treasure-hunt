// Pure game engine for Treasure Hunt: no React, no timers, no randomness inside the reducer.
// Every rule lives here and is unit-tested in engine.test.js.

export const GRID_SIZE = 48;
export const MAX_PICKS = 6;
export const TREASURE_COUNT = 5;
export const ROUND_SECONDS = 15;
export const START_BALANCE = 10000;
export const CHIPS = [1, 5, 10, 20, 25];

/** Draws `count` UNIQUE cells in 1..size (the original could draw duplicates). */
export function drawTreasures(rng = Math.random, count = TREASURE_COUNT, size = GRID_SIZE) {
  const cells = Array.from({ length: size }, (_, i) => i + 1);
  for (let i = cells.length - 1; i > 0; i--) {            // Fisher–Yates
    const j = Math.floor(rng() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells.slice(0, count).sort((a, b) => a - b);
}

export const stakeFor = (picks, chip) => picks.length * chip;

/** Original payout rule: any hit returns stake × (hits + 1); no hits loses the stake. */
export function settle(picks, treasures, chip) {
  const hits = picks.filter((p) => treasures.includes(p));
  const stake = stakeFor(picks, chip);
  const reward = hits.length > 0 ? stake * (hits.length + 1) : 0;
  return { hits, stake, reward, net: reward - stake, won: hits.length > 0 };
}

export const multiplierFor = (hits) => (hits > 0 ? hits + 1 : 0);

export function createInitialState(balance = START_BALANCE) {
  return {
    phase: 'idle',            // idle → running → result
    secondsLeft: ROUND_SECONDS,
    picks: [],
    chip: CHIPS[0],
    treasures: [],
    balance,
    lastRound: null,          // { picks, chip } for REPEAT
    undo: [],                 // snapshots of { picks, chip }
    outcome: null,            // settle() result of the finished round
    history: [],              // last results, newest first
    stats: { rounds: 0, wins: 0, biggestWin: 0 },
    message: '',
  };
}

const snapshot = (s) => ({ picks: s.picks, chip: s.chip });
const withUndo = (s, patch) => ({ ...s, ...patch, undo: [...s.undo, snapshot(s)].slice(-50), message: '' });

export function reducer(state, action) {
  switch (action.type) {
    case 'START': {
      if (state.phase !== 'idle') return state;
      if (state.balance < CHIPS[0]) return { ...state, message: 'Out of balance: start a new game.' };
      return { ...state, phase: 'running', secondsLeft: ROUND_SECONDS, message: '' };
    }

    case 'TICK': {
      if (state.phase !== 'running' || state.secondsLeft <= 0) return state;
      return { ...state, secondsLeft: state.secondsLeft - 1 };
    }

    case 'REVEAL': {   // dispatched by the UI with treasures from drawTreasures() when the timer hits 0
      if (state.phase !== 'running' || state.secondsLeft > 0) return state;
      const treasures = action.treasures;
      if (state.picks.length === 0) {
        return { ...state, phase: 'result', treasures, outcome: { hits: [], stake: 0, reward: 0, net: 0, won: false, void: true }, message: 'No numbers picked: round void, no stake taken.' };
      }
      const outcome = settle(state.picks, treasures, state.chip);
      const stats = {
        rounds: state.stats.rounds + 1,
        wins: state.stats.wins + (outcome.won ? 1 : 0),
        biggestWin: Math.max(state.stats.biggestWin, outcome.net),
      };
      return {
        ...state,
        phase: 'result',
        treasures,
        outcome,
        balance: state.balance + outcome.net,     // applied exactly once, here
        stats,
        history: [{ picks: state.picks, treasures, chip: state.chip, ...outcome }, ...state.history].slice(0, 8),
        message: outcome.won ? `You found ${outcome.hits.length} treasure${outcome.hits.length > 1 ? 's' : ''}! +${outcome.net}` : `No treasure this time. −${outcome.stake}`,
      };
    }

    case 'TOGGLE': {
      if (state.phase !== 'running' || state.secondsLeft <= 0) return state;
      const cell = action.cell;
      if (!Number.isInteger(cell) || cell < 1 || cell > GRID_SIZE) return state;
      if (state.picks.includes(cell)) return withUndo(state, { picks: state.picks.filter((p) => p !== cell) });
      if (state.picks.length >= MAX_PICKS) return { ...state, message: `You can pick at most ${MAX_PICKS} numbers.` };
      if (stakeFor([...state.picks, cell], state.chip) > state.balance) return { ...state, message: 'Not enough balance for another pick.' };
      return withUndo(state, { picks: [...state.picks, cell] });
    }

    case 'CHIP': {
      if (state.phase !== 'running' || !CHIPS.includes(action.value) || action.value === state.chip) return state;
      if (stakeFor(state.picks, action.value) > state.balance) return { ...state, message: 'Not enough balance for that chip.' };
      return withUndo(state, { chip: action.value });
    }

    case 'UNDO': {
      if (state.phase !== 'running' || state.undo.length === 0) return state;
      const prev = state.undo[state.undo.length - 1];
      return { ...state, ...prev, undo: state.undo.slice(0, -1), message: '' };
    }

    case 'REPEAT': {
      if (state.phase !== 'running' || !state.lastRound) return state;
      const { picks, chip } = state.lastRound;
      if (stakeFor(picks, chip) > state.balance) return { ...state, message: 'Not enough balance to repeat the last bet.' };
      return withUndo(state, { picks, chip });
    }

    case 'NEXT_ROUND': {
      if (state.phase !== 'result') return state;
      return {
        ...state,
        phase: 'idle',
        secondsLeft: ROUND_SECONDS,
        lastRound: state.picks.length ? { picks: state.picks, chip: state.chip } : state.lastRound,
        picks: [],
        treasures: [],
        undo: [],
        outcome: null,
        message: '',
      };
    }

    case 'NEW_GAME':
      return createInitialState();

    default:
      return state;
  }
}

/** True once every allowed pick is used (the original 6-pick limit): the UI greys out the free cells. */
export const isLocked = (state) => state.picks.length >= MAX_PICKS;

/** Payout preview for the bet slip: what each number of hits would return. */
export const payoutTable = (picks, chip) =>
  Array.from({ length: Math.min(picks.length, TREASURE_COUNT) }, (_, i) => ({ hits: i + 1, multiplier: i + 2, reward: stakeFor(picks, chip) * (i + 2) }));

/** CSS class for a grid cell, matching the original stylesheet's class names. */
export function cellClass(cell, picks, treasures) {
  const picked = picks.includes(cell);
  const treasure = treasures.includes(cell);
  if (picked && treasure) return 'selectedtreasureitem';
  if (treasure) return 'treasureitem';
  if (picked) return 'selectedGriditem';
  return 'Griditem';
}
