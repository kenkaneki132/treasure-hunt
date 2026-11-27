function Logbook({ state, dispatch }) {
  const { stats, history, phase } = state;
  const rate = stats.rounds ? Math.round((stats.wins / stats.rounds) * 100) : 0;
  return (
    <section className="panel logbook" aria-label="Captain's log">
      <h2>Captain&apos;s log</h2>
      <dl className="stats" data-testid="stats">
        <div><dt>Rounds</dt><dd>{stats.rounds}</dd></div>
        <div><dt>Wins</dt><dd>{stats.wins}</dd></div>
        <div><dt>Win rate</dt><dd>{rate}%</dd></div>
        <div><dt>Best win</dt><dd>{stats.biggestWin > 0 ? `+${stats.biggestWin.toLocaleString()}` : "–"}</dd></div>
      </dl>
      {history.length > 0 ? (
        <ol className="history" aria-label="Recent rounds">
          {history.map((h, i) => (
            <li key={i} className={h.won ? "won" : "lost"}>
              <span>{h.hits.length}/{h.picks.length} hits · bet {h.stake.toLocaleString()}</span>
              <b>{h.won ? `+${h.net.toLocaleString()}` : `−${h.stake.toLocaleString()}`}</b>
            </li>
          ))}
        </ol>
      ) : (
        <p className="hint">Your rounds will be logged here.</p>
      )}
      <button type="button" className="btn btn-ghost btn-block" onClick={() => dispatch({ type: "NEW_GAME" })} disabled={phase === "running"}>
        New game
      </button>
    </section>
  );
}

export default Logbook;
