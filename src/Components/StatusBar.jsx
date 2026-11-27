import { MAX_PICKS, ROUND_SECONDS, isLocked } from "../game/engine";
import { Hourglass } from "./Icons";

function StatusBar({ state, dispatch }) {
  const { phase, secondsLeft, picks, outcome, message, stats } = state;
  const running = phase === "running" && secondsLeft > 0;
  const urgent = running && secondsLeft <= 5;
  const left = MAX_PICKS - picks.length;

  return (
    <div className={`status-bar phase-${phase}${urgent ? " urgent" : ""}`}>
      {phase === "idle" && (
        <div className="status-text">
          <span className="round-tag">Round {stats.rounds + 1}</span>
          <span>Press start, then pick your numbers and a chip before the timer runs out.</span>
        </div>
      )}

      {phase === "running" && (
        <>
          <div className="sand" role="timer" aria-label={`${secondsLeft} seconds left`}>
            <Hourglass size={20} />
            <div className="rope"><i style={{ width: `${(secondsLeft / ROUND_SECONDS) * 100}%` }} /></div>
            <b className="secs">{secondsLeft}s</b>
          </div>
          <div className="marks-left" aria-live="polite">
            {isLocked(state) ? <b>All {MAX_PICKS} numbers picked</b> : <><b>{left}</b> pick{left === 1 ? "" : "s"} left</>}
          </div>
        </>
      )}

      {phase === "result" && outcome && (
        <>
          <div className="status-text result-text">
            <span data-testid="result" className={`result-tag ${outcome.void ? "void" : outcome.won ? "won" : "lost"}`}>
              {outcome.void ? "void" : outcome.won ? "won" : "lost"}
            </span>
            <span className="result-line">
              {outcome.void
                ? "No numbers picked, so no bet was taken."
                : outcome.won
                  ? <>You found <b>{outcome.hits.length}</b> treasure{outcome.hits.length > 1 ? "s" : ""}! Reward <b className="gain">{outcome.reward.toLocaleString()}</b> <span className="net">(+{outcome.net.toLocaleString()})</span></>
                  : <>No treasure this time. <b className="loss">−{outcome.stake.toLocaleString()}</b></>}
            </span>
          </div>
          <button type="button" className="btn btn-gold" onClick={() => dispatch({ type: "NEXT_ROUND" })}>
            Next round
          </button>
        </>
      )}

      {message && phase !== "result" && <div className="status-msg" role="status">{message}</div>}
    </div>
  );
}

export default StatusBar;
