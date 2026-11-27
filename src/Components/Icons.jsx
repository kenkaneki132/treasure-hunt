// Inline SVG art for the game. Drawn here (instead of emoji) so it looks the same on every device.
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const Chest = ({ open = false, size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="chest-svg">
    {open ? (
      <>
        {/* lid tipped back, its dark inside facing us */}
        <path d="M9 22 L13 5 H35 L39 22 Z" fill="#6e3d17" stroke="#4a2810" strokeWidth="2" strokeLinejoin="round" />
        <path d="M14 8 H34 L37 20 H11 Z" fill="#4f2a0e" opacity=".75" />
        {/* gold spilling over the rim */}
        <ellipse cx="24" cy="21.5" rx="15.5" ry="5.5" fill="#ffd955" />
        <g fill="#f6c431" stroke="#a86b08" strokeWidth="1">
          <circle cx="16" cy="19.5" r="3.4" /><circle cx="23" cy="17" r="3.6" /><circle cx="30.5" cy="18.5" r="3.4" /><circle cx="20" cy="21" r="3" /><circle cx="27" cy="21.5" r="3" />
        </g>
        <path d="M21 13.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" fill="#fffbe0" />
      </>
    ) : (
      <path d="M8 22 Q8 10 24 10 Q40 10 40 22 Z" fill="#9a5a26" stroke="#4a2810" strokeWidth="2" strokeLinejoin="round" />
    )}
    <rect x="8" y="22" width="32" height="18" rx="2" fill="#b06a2c" stroke="#4a2810" strokeWidth="2" />
    <path d="M8 29 H40" stroke="#4a2810" strokeWidth="2" />
    <rect x="13" y="22" width="4" height="18" fill="#e0a83a" stroke="#4a2810" strokeWidth="1.2" />
    <rect x="31" y="22" width="4" height="18" fill="#e0a83a" stroke="#4a2810" strokeWidth="1.2" />
    <rect x="21" y="26" width="6" height="7" rx="1.5" fill="#f6c431" stroke="#4a2810" strokeWidth="1.4" />
  </svg>
);

export const Skull = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <path d="M16 4C9.4 4 5 8.6 5 14.2c0 3.4 1.7 5.6 3.8 6.9V25h14.4v-3.9c2.1-1.3 3.8-3.5 3.8-6.9C27 8.6 22.6 4 16 4z" fill="#f3ead6" stroke="#3b2412" strokeWidth="1.6" />
    <circle cx="11.6" cy="15" r="2.9" fill="#3b2412" /><circle cx="20.4" cy="15" r="2.9" fill="#3b2412" />
    <path d="M16 18.2l-1.6 2.6h3.2z" fill="#3b2412" />
    <path d="M12 25v3M16 25v3M20 25v3" stroke="#3b2412" strokeWidth="1.4" />
  </svg>
);

export const Jolly = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
    <path d="M6 33L34 9M6 9l28 24" stroke="#f3ead6" strokeWidth="4" strokeLinecap="round" />
    <path d="M20 6c-5.6 0-9 3.8-9 8.6 0 2.8 1.3 4.6 3 5.7V24h12v-3.7c1.7-1.1 3-2.9 3-5.7C29 9.8 25.6 6 20 6z" fill="#f3ead6" stroke="#1c1208" strokeWidth="1.5" />
    <circle cx="16.4" cy="14.8" r="2.4" fill="#1c1208" /><circle cx="23.6" cy="14.8" r="2.4" fill="#1c1208" />
  </svg>
);

export const Hourglass = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M6 2h12M6 22h12M7 2v4a5 5 0 0 0 10 0V2M7 22v-4a5 5 0 0 1 10 0v4" /><path d="M10 19h4" /></svg>
);
export const Shovel = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M14 4l6 6M17 7l-8.5 8.5" /><path d="M8.5 15.5l-3 .5-2 2 3 3 2-2 .5-3z" /></svg>
);
export const Anchor = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><circle cx="12" cy="5" r="2.5" /><path d="M12 7.5V21M8 11h8M5 14a7 7 0 0 0 14 0" /></svg>
);
export const Undo = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M9 14L4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>
);
export const Repeat = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></svg>
);
export const Sound = ({ on, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
    {on ? <><path d="M16 9.5a3.5 3.5 0 0 1 0 5" /><path d="M18.5 7a7 7 0 0 1 0 10" /></> : <path d="M16 9.5l5 5M21 9.5l-5 5" />}
  </svg>
);

/** Gold doubloon used for chips and the balance. Colors follow the chip value. */
const COIN = { 1: ["#d08a4a", "#8a4f1e"], 5: ["#d9dde3", "#7d848e"], 10: ["#f2c230", "#a6740a"], 20: ["#3fbf86", "#1d6b4a"], 25: ["#e2565b", "#8c2228"] };
export const Coin = ({ value = 10, size = 48, label = value }) => {
  const [face, rim] = COIN[value] || COIN[10];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="coin-svg">
      <circle cx="24" cy="24" r="22" fill={rim} />
      <circle cx="24" cy="24" r="19" fill={face} />
      <circle cx="24" cy="24" r="15.5" fill="none" stroke={rim} strokeWidth="1.5" strokeDasharray="2.5 2.5" opacity=".8" />
      <path d="M12 13a14 14 0 0 1 12-5" stroke="#fff" strokeOpacity=".55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <text x="24" y="25" textAnchor="middle" dominantBaseline="middle" fontSize={String(label).length > 1 ? 15 : 18} fontWeight="800" fill={rim} fontFamily="Rubik, system-ui, sans-serif">{label}</text>
    </svg>
  );
};
