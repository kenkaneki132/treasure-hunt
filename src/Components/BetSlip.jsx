import { CHIPS, MAX_PICKS, payoutTable, stakeFor } from "../game/engine";
import { Coin, Repeat, Undo } from "./Icons";

function BetSlip({ state, dispatch }) {
  const { chip, picks, phase, secondsLeft, balance, undo, lastRound } = state;
  const running = phase === "running" && secondsLeft > 0;
  const bet = stakeFor(picks, chip);
  const pending = phase === "running" ? bet : 0;
  const table = payoutTable(picks, chip);

  return (
    <section className="panel slip" aria-label="Bets">
      <div className="purse">
        <Coin value={10} size={40} label="$" />
        <div>
          <span className="label">Balance</span>
          <b className="purse-amount" data-testid="balance">{(balance - pending).toLocaleString()}</b>
          {pending > 0 && <small className="at-stake">{pending.toLocaleString()} on the table</small>}
        </div>
      </div>

      <div className="slip-block">
        <span className="label" id="chip-label">Chips</span>
        <div className="chips" role="radiogroup" aria-labelledby="chip-label">
          {CHIPS.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={chip === value}
              aria-label={`Chip ${value}`}
              className={`chip${chip === value ? " on" : ""}`}
              disabled={!running}
              onClick={() => dispatch({ type: "CHIP", value })}
            >
              <Coin value={value} size={46} />
            </button>
          ))}
        </div>
      </div>

      <div className="slip-block">
        <span className="label">Your picks</span>
        <ol className="slots" aria-label={`${picks.length} of ${MAX_PICKS} numbers picked`}>
          {Array.from({ length: MAX_PICKS }, (_, i) => (
            <li key={i} className={picks[i] ? "filled" : ""}>{picks[i] ?? ""}</li>
          ))}
        </ol>
      </div>

      <div className="stake-row">
        <span>chip {chip} × {picks.length} pick{picks.length === 1 ? "" : "s"}</span>
        <span>Bet <b data-testid="stake">{bet.toLocaleString()}</b></span>
      </div>

      {table.length > 0 ? (
        <table className="payouts">
          <caption>Reward if you hit…</caption>
          <tbody>
            {table.map((r) => (
              <tr key={r.hits}><th scope="row">{r.hits} treasure{r.hits > 1 ? "s" : ""}</th><td>×{r.multiplier}</td><td>{r.reward.toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="hint">Any hit pays bet × (hits + 1): 1 hit pays ×2, 2 hits ×3, and so on. No hits loses the bet.</p>
      )}

      <div className="slip-actions">
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "UNDO" })} disabled={!running || undo.length === 0}>
          <Undo /> UNDO
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "REPEAT" })} disabled={!running || !lastRound}>
          <Repeat /> REPEAT
        </button>
      </div>
    </section>
  );
}

export default BetSlip;
