import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Game from './Game';
import App from '../App';
import { MAX_PICKS, ROUND_SECONDS } from '../game/engine';

// rng that makes drawTreasures() return a known set
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

beforeEach(() => { vi.useFakeTimers(); localStorage.clear(); });
afterEach(() => vi.useRealTimers());

const FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };
const renderGame = (props = {}) => render(<MemoryRouter future={FUTURE}><Game {...props} /></MemoryRouter>);
const cell = (n) => screen.getByRole('button', { name: new RegExp(`^${n}(,|$)`) });
const start = () => fireEvent.click(screen.getByRole('button', { name: /^start$/i }));
const mark = (...ns) => ns.forEach((n) => fireEvent.click(cell(n)));

describe('<Game />', () => {
  it('shows 48 numbers on the map, locked until start', () => {
    renderGame();
    const map = screen.getByRole('group', { name: /treasure grid/i });
    expect(within(map).getAllByRole('button')).toHaveLength(48);
    expect(cell(1)).toBeDisabled();
    expect(screen.getByRole('heading', { name: /place your bets/i })).toBeInTheDocument();
  });

  it('plays a full round: pick, choose chip, countdown, reveal, settle', () => {
    renderGame({ rng: seeded(12345) });
    start();
    mark(3, 17);
    fireEvent.click(screen.getByRole('radio', { name: 'Chip 10' }));
    expect(cell(3)).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('stake')).toHaveTextContent('20');
    expect(screen.getByTestId('balance')).toHaveTextContent((10000 - 20).toLocaleString());

    act(() => { vi.advanceTimersByTime(ROUND_SECONDS * 1000); });

    expect(screen.getByTestId('result').textContent).toMatch(/won|lost/);
    expect(screen.getAllByRole('button', { name: /treasure/ })).toHaveLength(5);
    expect(screen.getByRole('button', { name: /next round/i })).toBeEnabled();
    expect(within(screen.getByTestId('stats')).getByText('Rounds').nextSibling).toHaveTextContent('1');
  });

  it('UNDO reverts the last pick', () => {
    renderGame();
    start();
    mark(5, 6);
    fireEvent.click(screen.getByRole('button', { name: 'UNDO' }));
    expect(cell(6)).toHaveAttribute('aria-pressed', 'false');
    expect(cell(5)).toHaveAttribute('aria-pressed', 'true');
  });

  it(`closes the board after ${MAX_PICKS} picks, and reopens it when one is removed`, () => {
    renderGame();
    start();
    mark(1, 2, 3, 4, 5, 6);
    expect(cell(7)).toBeDisabled();
    expect(cell(48)).toBeDisabled();
    expect(cell(3)).toBeEnabled();                                  // picked numbers can still be changed
    expect(screen.getByRole('note')).toHaveTextContent(/all 6 numbers picked/i);
    mark(3);
    expect(cell(7)).toBeEnabled();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('reveals only when the 15-second timer ends (no early reveal)', () => {
    renderGame({ rng: seeded(7) });
    start();
    mark(12);
    act(() => { vi.advanceTimersByTime((ROUND_SECONDS - 1) * 1000); });
    expect(screen.queryByTestId('result')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: /treasure/ })).toHaveLength(0);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByTestId('result').textContent).toMatch(/won|lost/);
    expect(screen.getAllByRole('button', { name: /treasure/ })).toHaveLength(5);
  });

  it('sound can be muted, and the choice is remembered', () => {
    renderGame();
    const toggle = screen.getByRole('button', { name: /sound effects/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(localStorage.getItem('th-sound')).toBe('off');
  });

  it('clears every timer on unmount (round clock, sound cues, effects)', () => {
    const { unmount } = renderGame({ rng: seeded(3) });
    start();
    mark(1, 2);
    act(() => { vi.advanceTimersByTime(ROUND_SECONDS * 1000); });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('<App /> routing', () => {
  it('start page links to the game', () => {
    render(<MemoryRouter future={FUTURE}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /treasure hunt/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /play game/i }));
    expect(screen.getByRole('button', { name: /^start$/i })).toBeInTheDocument();
  });
});
