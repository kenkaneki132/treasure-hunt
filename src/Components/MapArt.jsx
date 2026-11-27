// Decorative map behind the dig spots. The landscape stretches with the board; the compass keeps its shape.
const INK = "#5b3a1a";

function Waves() {
  const spots = [[60, 60], [150, 40], [690, 70], [740, 150], [40, 300], [70, 520], [180, 560], [620, 560], [740, 470], [760, 330]];
  return spots.map(([x, y], i) => (
    <path key={i} d={`M${x} ${y}q8 -7 16 0t16 0t16 0`} fill="none" stroke="#2f6f8f" strokeOpacity=".45" strokeWidth="2.2" strokeLinecap="round" />
  ));
}

function Palm({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeOpacity=".55" strokeWidth="2" fill="none" strokeLinecap="round">
      <path d="M0 0q2 -14 -2 -26" />
      <path d="M-2 -26q-10 -2 -16 6M-2 -26q-2 -9 -12 -12M-2 -26q8 -7 16 -4M-2 -26q10 0 13 9" />
    </g>
  );
}

function Mountains({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={INK} strokeOpacity=".5" strokeWidth="2" fill="none" strokeLinejoin="round">
      <path d="M0 30l22 -34l22 34M30 30l20 -28l20 28" />
      <path d="M22 -4l-6 12M50 2l-5 10" strokeOpacity=".35" />
    </g>
  );
}

export function MapArt() {
  return (
    <svg className="map-art" viewBox="0 0 800 600" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="sea-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <path d="M0 0v10" stroke="#2f6f8f" strokeOpacity=".12" strokeWidth="3" />
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#sea-hatch)" />
      <Waves />
      {/* island */}
      <path
        d="M120 150C170 70 300 80 380 95C470 60 600 70 660 130C720 190 700 260 715 330C735 420 690 500 600 520C520 540 450 505 380 525C290 550 190 540 140 480C90 420 110 360 95 300C80 240 85 205 120 150Z"
        fill="#e9cf96" fillOpacity=".55" stroke={INK} strokeOpacity=".6" strokeWidth="3"
      />
      <path
        d="M135 160C180 92 300 100 380 113C470 82 590 92 645 142C698 196 682 262 697 330C714 410 676 482 598 500C522 518 452 486 382 506C296 529 200 520 156 466C110 412 128 358 115 300C102 246 106 210 135 160Z"
        fill="none" stroke={INK} strokeOpacity=".22" strokeWidth="2" strokeDasharray="3 7"
      />
      <Mountains x={170} y={170} />
      <Mountains x={560} y={160} />
      <Palm x={250} y={470} s={1.1} />
      <Palm x={275} y={480} s={0.8} />
      <Palm x={610} y={455} />
      <Palm x={640} y={440} s={0.75} />
      {/* the trail */}
      <path d="M150 440C230 400 230 330 320 320S430 260 470 300S560 360 600 300S650 220 610 190" fill="none" stroke="#8a2d12" strokeOpacity=".45" strokeWidth="3" strokeDasharray="2 11" strokeLinecap="round" />
      <path d="M598 178l24 24M622 178l-24 24" stroke="#8a2d12" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Compass() {
  return (
    <svg className="compass" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="34" fill="none" stroke={INK} strokeOpacity=".5" strokeWidth="2" />
      <circle cx="50" cy="50" r="28" fill="none" stroke={INK} strokeOpacity=".3" strokeWidth="1" strokeDasharray="2 4" />
      <path d="M50 8L57 50L50 92L43 50Z" fill={INK} fillOpacity=".55" />
      <path d="M8 50L50 43L92 50L50 57Z" fill={INK} fillOpacity=".35" />
      <path d="M50 8L57 50H43Z" fill="#a3301a" fillOpacity=".8" />
      <circle cx="50" cy="50" r="4" fill="#f3e2b8" stroke={INK} strokeWidth="1.5" />
      <text x="50" y="6" textAnchor="middle" fontSize="11" fontWeight="700" fill={INK} fillOpacity=".75" fontFamily="Pirata One, serif">N</text>
    </svg>
  );
}
