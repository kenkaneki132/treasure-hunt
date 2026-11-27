import { useEffect, useRef, useState } from "react";
import { GRID_SIZE, MAX_PICKS, isLocked } from "../game/engine";
import { prefersReducedMotion } from "../game/fx";
import { MapArt, Compass } from "./MapArt";
import { Chest } from "./Icons";

const SAND = 12;
let burstId = 0;

function Burst({ b }) {
  return (
    <span className={`burst burst-${b.kind}`} style={{ left: b.x, top: b.y }} aria-hidden="true">
      {b.parts.map((p, i) => <i key={i} style={{ "--a": `${p.a}deg`, "--r": `${p.r}px`, "--s": p.s, "--d": `${p.d}ms` }} />)}
    </span>
  );
}

function TreasureMap({ state, dispatch }) {
  const { picks, treasures, phase, secondsLeft, outcome, balance } = state;
  const open = phase === "running" && secondsLeft > 0;
  const locked = open && isLocked(state);
  const wrap = useRef(null);
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    if (!bursts.length) return undefined;
    const t = setTimeout(() => setBursts((list) => list.slice(1)), 900);
    return () => clearTimeout(t);
  }, [bursts]);

  const spark = (e, kind) => {
    if (prefersReducedMotion() || !wrap.current) return;
    const box = wrap.current.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    const parts = Array.from({ length: kind === "sand" ? SAND : 6 }, () => ({
      a: Math.random() * 360, r: (kind === "sand" ? 22 : 14) + Math.random() * 26, s: 0.6 + Math.random() * 0.8, d: Math.random() * 80,
    }));
    setBursts((list) => [...list.slice(-6), { id: ++burstId, kind, x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, parts }]);
  };

  const onSpot = (e, cell) => {
    const marked = picks.includes(cell);
    dispatch({ type: "TOGGLE", cell });
    spark(e, marked ? "puff" : "sand");
  };

  const order = [...treasures].sort((a, b) => a - b);
  const lost = phase === "result" && outcome && !outcome.won && !outcome.void;

  return (
    <div className={`map-wrap${locked ? " locked" : ""}${phase === "result" ? " revealed" : ""}${lost ? " shake" : ""}`} ref={wrap}>
      {locked && (
        <div className="ribbon" role="note">
          <b>All {MAX_PICKS} numbers picked!</b> The board is closed until the reveal. Tap a red X to change a pick.
        </div>
      )}

      <div className="map">
        <MapArt />
        <Compass />
        <div className="Grid spots" role="group" aria-label="Treasure grid: 48 numbers on the map">
          {Array.from({ length: GRID_SIZE }, (_, idx) => {
            const i = idx + 1;
            const marked = picks.includes(i);
            const treasure = treasures.includes(i);
            const hit = marked && treasure;
            const dug = phase === "result" && marked && !treasure;
            const label = `${i}${marked ? ", picked" : ""}${treasure ? ", treasure" : ""}${dug ? ", empty" : ""}`;
            const cls = ["spot", marked && "marked", treasure && "treasure", hit && "hit", dug && "dug", locked && !marked && "closed"].filter(Boolean).join(" ");
            return (
              <button
                key={i}
                type="button"
                className={cls}
                style={treasure ? { "--d": `${order.indexOf(i) * 220}ms` } : undefined}
                aria-pressed={marked}
                aria-label={label}
                disabled={!open || (locked && !marked)}
                title={locked && !marked ? `All ${MAX_PICKS} numbers picked: remove one to choose this number` : undefined}
                onClick={(e) => onSpot(e, i)}
              >
                {dug && <span className="hole" aria-hidden="true" />}
                <span className="num" aria-hidden="true">{i}</span>
                {marked && (
                  <svg className="x-mark" viewBox="0 0 40 40" aria-hidden="true"><path d="M9 9L31 31" /><path d="M31 9L9 31" /></svg>
                )}
                {treasure && <span className="chest" aria-hidden="true"><Chest open size={40} /></span>}
                {hit && <span className="coins" aria-hidden="true">{Array.from({ length: 8 }, (_, k) => <i key={k} style={{ "--k": k }} />)}</span>}
              </button>
            );
          })}
        </div>
        {bursts.map((b) => <Burst key={b.id} b={b} />)}
      </div>

      {phase === "idle" && (
        <div className="map-veil">
          <div className="veil-card">
            <p className="veil-kicker">5 treasures are hidden on this map</p>
            <h2>{balance >= 1 ? "Place your bets" : "Out of balance"}</h2>
            <p>{balance >= 1 ? <>Press start, then pick up to {MAX_PICKS} numbers and a chip within 15 seconds. Any hit pays bet × (hits + 1).</> : "Start a new game to reset your balance to 10,000."}</p>
            {balance >= 1 ? (
              <button type="button" className="btn btn-gold btn-lg" onClick={() => dispatch({ type: "START" })} autoFocus>
                Start
              </button>
            ) : (
              <button type="button" className="btn btn-gold btn-lg" onClick={() => dispatch({ type: "NEW_GAME" })}>
                New game
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TreasureMap;
