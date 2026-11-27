import React, { useEffect, useReducer, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MAX_PICKS, createInitialState, drawTreasures, reducer } from "../game/engine";
import { play, prefersReducedMotion, soundPref } from "../game/fx";
import TreasureMap from "./TreasureMap";
import StatusBar from "./StatusBar";
import BetSlip from "./BetSlip";
import Logbook from "./Logbook";
import { Jolly, Sound } from "./Icons";
import PortfolioBadge from "./PortfolioBadge";
import "./game.css";

function CoinRain({ show }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!show || prefersReducedMotion()) return undefined;
    setOn(true);
    const t = setTimeout(() => setOn(false), 3200);
    return () => clearTimeout(t);
  }, [show]);
  if (!on) return null;
  return (
    <div className="coin-rain" aria-hidden="true">
      {Array.from({ length: 34 }, (_, i) => (
        <i key={i} style={{ "--x": `${(i * 37) % 100}%`, "--delay": `${(i * 83) % 900}ms`, "--dur": `${1600 + ((i * 131) % 900)}ms`, "--spin": `${i % 2 ? 1 : -1}` }} />
      ))}
    </div>
  );
}

function Game({ rng = Math.random }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialState());
  const [sound, setSound] = useState(() => soundPref.get());
  const prev = useRef(state);
  const timers = useRef([]);

  // One interval per running round; cleared on finish or unmount.
  useEffect(() => {
    if (state.phase !== "running") return undefined;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase === "running" && state.secondsLeft === 0) {
      dispatch({ type: "REVEAL", treasures: drawTreasures(rng) });
    }
  }, [state.phase, state.secondsLeft, rng]);

  // Sound cues follow state changes, so every path (click, keyboard, undo, repeat) sounds the same.
  useEffect(() => {
    const p = prev.current;
    prev.current = state;
    if (!sound) return;
    const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
    if (p.phase !== "running" && state.phase === "running") play("start", true);
    if (state.phase === "running") {
      if (state.picks.length > p.picks.length) play(state.picks.length === MAX_PICKS ? "locked" : "mark", true);
      else if (state.picks.length < p.picks.length) play("unmark", true);
      if (state.secondsLeft < p.secondsLeft && state.secondsLeft > 0 && state.secondsLeft <= 5) play("tick", true);
    }
    if (p.phase === "running" && state.phase === "result" && state.outcome && !state.outcome.void) {
      play("dig", true);
      state.treasures.forEach((_, i) => later(() => play("chest", true), 300 + i * 220));
      later(() => play(state.outcome.won ? "win" : "lose", true), 300 + state.treasures.length * 220);
      if (state.outcome.won) later(() => play("coin", true), 520 + state.treasures.length * 220);
    }
  }, [state, sound]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current = []; }, []);

  const toggleSound = () => setSound((on) => { soundPref.set(!on); return !on; });
  const won = state.phase === "result" && !!state.outcome?.won;

  return (
    <div className="Game">
      <CoinRain show={won ? state.stats.rounds : 0} />
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Treasure Hunt home">
          <span className="flag"><Jolly size={26} /></span>
          <span className="brand-name">Treasure Hunt</span>
        </Link>
        <div className="topbar-actions">
          <details className="howto">
            <summary>How to play</summary>
            <ol>
              <li>Press <b>Start</b>. You have 15 seconds to place your bets.</li>
              <li>Pick up to {MAX_PICKS} numbers on the map and choose a chip (1, 5, 10, 20 or 25). Your bet is chip × picks.</li>
              <li>When the timer ends, 5 treasures are revealed. Any hit pays bet × (hits + 1); no hits loses the bet.</li>
              <li><b>UNDO</b> reverts your last action, <b>REPEAT</b> restores last round&apos;s bet, <b>Next round</b> keeps your balance and <b>New game</b> resets it to 10,000.</li>
            </ol>
          </details>
          <button type="button" className="icon-btn" onClick={toggleSound} aria-pressed={sound} aria-label="Sound effects" title={sound ? "Mute sound" : "Turn sound on"}>
            <Sound on={sound} />
          </button>
        </div>
      </header>

      <main className="table">
        <section className="board-col" aria-label="Treasure map">
          <StatusBar state={state} dispatch={dispatch} />
          <TreasureMap state={state} dispatch={dispatch} />
        </section>
        <aside className="side-col">
          <BetSlip state={state} dispatch={dispatch} />
          <Logbook state={state} dispatch={dispatch} />
        </aside>
      </main>

      <footer className="foot">
        <PortfolioBadge />
        <span>Play money only, no real bets</span>
      </footer>
    </div>
  );
}

export default Game;
