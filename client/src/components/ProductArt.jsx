const INK = "#0F172A";
const SOFT = "#94A3B8";
const MUTE = "#E2E8F0";

function Panel({ accent = "#2563EB", children, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 320 240" fill="none" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`bg-${accent.replace("#", "")}`} x1="0" y1="0" x2="320" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor={accent} stopOpacity="0.14" />
            <stop offset="1" stopColor={accent} stopOpacity="0.02" />
          </linearGradient>
          <radialGradient id={`glow-${accent.replace("#", "")}`} cx="0.5" cy="0.46" r="0.55">
            <stop offset="0" stopColor={accent} stopOpacity="0.22" />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="240" fill="#FFFFFF" />
        <rect width="320" height="240" fill={`url(#bg-${accent.replace("#", "")})`} />
        <rect width="320" height="240" fill={`url(#glow-${accent.replace("#", "")})`} />
        <circle cx="160" cy="200" r="70" fill={INK} opacity="0.06" />
        {children}
      </svg>
    </div>
  );
}

const HEADPHONES = (
  <>
    <path d="M96 104v28m128-28v28" stroke={INK} strokeWidth="10" strokeLinecap="round" />
    <path d="M96 104a64 64 0 0 1 64-58 64 64 0 0 1 64 58" stroke={INK} strokeWidth="10" fill="none" strokeLinecap="round" />
    <rect x="74" y="118" width="40" height="72" rx="20" fill={INK} />
    <rect x="206" y="118" width="40" height="72" rx="20" fill={INK} />
    <rect x="86" y="130" width="16" height="48" rx="8" fill="#fff" opacity="0.85" />
    <rect x="218" y="130" width="16" height="48" rx="8" fill="#fff" opacity="0.85" />
  </>
);

const SPEAKER = (
  <>
    <rect x="120" y="52" width="80" height="128" rx="24" fill={INK} />
    <rect x="128" y="60" width="64" height="52" rx="14" fill="#fff" opacity="0.9" />
    <circle cx="160" cy="92" r="22" fill={INK} opacity="0.12" />
    <circle cx="160" cy="92" r="12" fill={INK} opacity="0.18" />
    <circle cx="160" cy="92" r="5" fill={INK} />
    <circle cx="134" cy="128" r="9" fill="#fff" opacity="0.35" />
    <circle cx="160" cy="128" r="9" fill="#fff" opacity="0.35" />
    <circle cx="186" cy="128" r="9" fill="#fff" opacity="0.35" />
    <circle cx="134" cy="150" r="9" fill="#fff" opacity="0.35" />
    <circle cx="160" cy="150" r="9" fill="#fff" opacity="0.35" />
    <circle cx="186" cy="150" r="9" fill="#fff" opacity="0.35" />
  </>
);

const CAMERA = (
  <>
    <rect x="86" y="64" width="148" height="112" rx="18" fill={INK} />
    <rect x="92" y="64" width="148" height="34" rx="18" fill="#fff" opacity="0.16" />
    <rect x="196" y="72" width="30" height="18" rx="6" fill="#fff" opacity="0.4" />
    <circle cx="142" cy="120" r="36" fill="#fff" opacity="0.9" />
    <circle cx="142" cy="120" r="30" fill={INK} />
    <circle cx="142" cy="120" r="20" fill="#fff" opacity="0.95" />
    <circle cx="142" cy="120" r="11" fill={INK} opacity="0.9" />
    <path d="M86 82l14 0 8-12 14 0 8 12 14 0" stroke={INK} strokeWidth="6" fill="none" strokeLinejoin="round" />
    <circle cx="238" cy="130" r="7" fill="#fff" opacity="0.5" />
  </>
);

const TSHIRT = (
  <>
    <path
      d="M120 76l-34 14-16 34 18 12 8-6v64c0 8 7 14 16 14h56c9 0 16-6 16-14v-64l8 6 18-12-16-34-34-14a16 16 0 0 1-40 0Z"
      fill={INK}
      strokeWidth="0"
    />
    <path d="M104 84l14 8 12-16a14 14 0 0 1 60 0l12 16 14-8" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.85" />
  </>
);

const SNEAKER = (
  <>
    <path d="M70 150c34-30 74-40 120-40 20 0 38-4 52-14 2 12-4 26-20 38-26 20-70 28-116 22-20-3-30 0-36-6Z" fill={INK} />
    <path d="M96 108c18-10 40-15 64-16 24-1 48 0 64 8" stroke="#fff" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.9" />
    <path d="M70 150c2 10 10 16 28 18 22 3 52 3 86-4" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.35" />
    <path d="M112 166l34 18" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity="0.85" />
  </>
);

const SUNGLASSES = (
  <>
    <circle cx="108" cy="128" r="40" fill={INK} />
    <circle cx="212" cy="128" r="40" fill={INK} />
    <path d="M146 112c6-10 22-10 28 0" stroke={INK} strokeWidth="8" fill="none" />
    <path d="M108 88l-10 22a12 12 0 0 1-22-2l6-24" stroke={INK} strokeWidth="9" strokeLinecap="round" />
    <path d="M212 88l10 22a12 12 0 0 0 22-2l-6-24" stroke={INK} strokeWidth="9" strokeLinecap="round" />
    <circle cx="108" cy="128" r="18" fill="#fff" opacity="0.22" />
    <circle cx="212" cy="128" r="18" fill="#fff" opacity="0.22" />
  </>
);

const CONTROLLER = (
  <>
    <rect x="62" y="86" width="196" height="96" rx="46" fill={INK} />
    <circle cx="116" cy="92" r="26" fill={INK} />
    <circle cx="204" cy="92" r="26" fill={INK} />
    <path d="M40 134v-12m-6 6h12" stroke={INK} strokeWidth="9" strokeLinecap="round" />
    <path d="M280 134v-12m-6 6h12" stroke={INK} strokeWidth="9" strokeLinecap="round" />
    <circle cx="108" cy="134" r="12" fill="#fff" opacity="0.9" />
    <circle cx="150" cy="122" r="7" fill="#fff" opacity="0.6" />
    <circle cx="150" cy="146" r="7" fill="#fff" opacity="0.6" />
    <circle cx="172" cy="122" r="7" fill="#fff" opacity="0.6" />
    <circle cx="172" cy="146" r="7" fill="#fff" opacity="0.6" />
    <circle cx="212" cy="134" r="12" fill="#fff" opacity="0.9" />
  </>
);

const KEYBOARD = (
  <>
    <rect x="52" y="70" width="216" height="100" rx="10" fill={INK} />
    <rect x="52" y="70" width="216" height="100" rx="10" fill="#fff" opacity="0.06" />
    <g fill="#fff">
      <rect x="64" y="82" width="14" height="14" rx="3" opacity="0.9" />
      <rect x="82" y="82" width="14" height="14" rx="3" opacity="0.5" />
      <rect x="100" y="82" width="14" height="14" rx="3" opacity="0.6" />
      <rect x="118" y="82" width="14" height="14" rx="3" opacity="0.5" />
      <rect x="136" y="82" width="14" height="14" rx="3" opacity="0.6" />
      <rect x="154" y="82" width="14" height="14" rx="3" opacity="0.5" />
      <rect x="172" y="82" width="14" height="14" rx="3" opacity="0.6" />
      <rect x="190" y="82" width="14" height="14" rx="3" opacity="0.5" />
      <rect x="208" y="82" width="14" height="14" rx="3" opacity="0.9" />
      <rect x="226" y="82" width="30" height="14" rx="3" opacity="0.5" />
      <rect x="64" y="101" width="14" height="14" rx="3" opacity="0.6" />
      <rect x="82" y="101" width="14" height="14" rx="3" opacity="0.5" />
      <rect x="100" y="101" width="14" height="14" rx="3" opacity="0.6" />
      <rect x="118" y="101" width="14" height="14" rx="3" opacity="0.5" />
      <rect x="136" y="101" width="14" height="14" rx="3" opacity="0.9" />
      <rect x="154" y="101" width="14" height="14" rx="3" opacity="0.5" />
      <rect x="172" y="101" width="14" height="14" rx="3" opacity="0.6" />
      <rect x="190" y="101" width="14" height="14" rx="3" opacity="0.5" />
      <rect x="208" y="101" width="14" height="14" rx="3" opacity="0.6" />
      <rect x="226" y="101" width="30" height="14" rx="3" opacity="0.5" />
      <rect x="64" y="120" width="14" height="14" rx="3" opacity="0.5" />
      <rect x="82" y="120" width="14" height="14" rx="3" opacity="0.6" />
      <rect x="100" y="120" width="14" height="14" rx="3" opacity="0.5" />
      <rect x="118" y="120" width="14" height="14" rx="3" opacity="0.6" />
      <rect x="136" y="120" width="14" height="14" rx="3" opacity="0.5" />
      <rect x="154" y="120" width="14" height="14" rx="3" opacity="0.6" />
      <rect x="172" y="120" width="14" height="14" rx="3" opacity="0.5" />
      <rect x="190" y="120" width="14" height="14" rx="3" opacity="0.6" />
      <rect x="208" y="120" width="14" height="14" rx="3" opacity="0.5" />
      <rect x="226" y="120" width="30" height="14" rx="3" opacity="0.6" />
      <rect x="72" y="141" width="72" height="12" rx="6" opacity="0.5" />
      <rect x="152" y="141" width="96" height="12" rx="6" opacity="0.9" />
    </g>
  </>
);

const SMARTPHONE = (
  <>
    <rect x="108" y="32" width="104" height="176" rx="22" fill={INK} />
    <rect x="116" y="24" width="88" height="192" rx="26" fill="none" stroke={INK} strokeWidth="8" />
    <rect x="126" y="52" width="68" height="92" rx="12" fill="#fff" opacity="0.9" />
    <rect x="126" y="56" width="68" height="5" rx="3" fill={INK} opacity="0.3" />
    <circle cx="160" cy="66" r="4" fill="#fff" />
    <rect x="136" y="78" width="44" height="14" rx="7" fill={INK} opacity="0.55" />
    <rect x="136" y="96" width="30" height="10" rx="5" fill={INK} opacity="0.25" />
    <rect x="136" y="112" width="40" height="10" rx="5" fill={INK} opacity="0.35" />
    <circle cx="132" cy="148" r="4" fill="#fff" opacity="0.4" />
    <path d="M160 176v12" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
  </>
);

const POWERBANK = (
  <>
    <rect x="104" y="52" width="112" height="136" rx="18" fill={INK} />
    <rect x="116" y="72" width="88" height="64" rx="10" fill="#fff" opacity="0.9" />
    <rect x="124" y="80" width="20" height="12" rx="4" fill={INK} opacity="0.85" />
    <rect x="156" y="82" width="26" height="8" rx="4" fill={INK} opacity="0.25" />
    <rect x="124" y="96" width="40" height="8" rx="4" fill={INK} opacity="0.35" />
    <rect x="124" y="110" width="52" height="8" rx="4" fill={INK} opacity="0.25" />
    <circle cx="116" cy="154" r="9" fill={INK} opacity="0.9" />
    <circle cx="204" cy="154" r="9" fill={INK} opacity="0.9" />
    <rect x="144" y="112" width="34" height="18" rx="6" fill="#2563EB" />
    <rect x="144" y="117" width="34" height="9" rx="3" fill="#3B82F6" />
  </>
);

const LAPTOP = (
  <>
    <path d="M76 132l14-46a12 12 0 0 1 12-9h116a12 12 0 0 1 12 9l14 46Z" fill={INK} />
    <rect x="92" y="88" width="136" height="40" rx="6" fill="#fff" opacity="0.92" />
    <rect x="100" y="96" width="56" height="6" rx="3" fill={INK} opacity="0.3" />
    <rect x="100" y="108" width="40" height="6" rx="3" fill={INK} opacity="0.18" />
    <rect x="100" y="118" width="48" height="4" rx="2" fill={INK} opacity="0.1" />
    <path d="M70 132h180l14 18a8 8 0 0 1-7 12H63a8 8 0 0 1-7-12l14-18Z" fill={INK} />
    <rect x="76" y="142" width="168" height="4" rx="2" fill="#fff" opacity="0.25" />
    <rect x="156" y="148" width="8" height="8" rx="3" fill="#fff" opacity="0.4" />
  </>
);

const BLENDER = (
  <>
    <path d="M108 106h104l14 94H94Z" fill={INK} />
    <rect x="104" y="88" width="112" height="26" rx="10" fill={INK} />
    <path d="M122 74h76" stroke={INK} strokeWidth="8" strokeLinecap="round" />
    <rect x="92" y="196" width="136" height="14" rx="7" fill={INK} />
    <rect x="128" y="76" width="14" height="8" rx="3" fill="#fff" opacity="0.5" />
    <path d="M168 92l26-18m-26 18 22-8m-22 8 20 10" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
    <circle cx="160" cy="128" r="42" fill="#fff" opacity="0.45" />
  </>
);

const COFFEE = (
  <>
    <rect x="104" y="58" width="112" height="148" rx="16" fill={INK} />
    <rect x="114" y="70" width="92" height="60" rx="10" fill="#fff" opacity="0.92" />
    <path d="M126 118l20 14v26c0 12-8 20-20 20h-6c-12 0-20-8-20-20v-26l20-14v-26" stroke={INK} strokeWidth="8" fill="none" strokeLinejoin="round" />
    <path d="M136 120h22" stroke={INK} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
    <path d="M126 152c-6 4-6 10 0 16m16-16c-6 4-6 10 0 16" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    <path d="M120 36c-4 8-4 14 0 22m-18-22c-4 8-4 14 0 22" stroke={INK} strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    <path d="M120 30h8" stroke={INK} strokeWidth="4" strokeLinecap="round" opacity="0.4" />
    <rect x="118" y="178" width="52" height="10" rx="5" fill="#fff" opacity="0.4" />
  </>
);

const TOASTER = (
  <>
    <rect x="86" y="102" width="148" height="86" rx="18" fill={INK} />
    <rect x="92" y="112" width="112" height="20" rx="4" fill="#fff" opacity="0.85" />
    <rect x="96" y="118" width="14" height="8" rx="3" fill={INK} opacity="0.8" />
    <rect x="118" y="118" width="14" height="8" rx="3" fill={INK} opacity="0.8" />
    <rect x="138" y="118" width="14" height="8" rx="3" fill={INK} opacity="0.8" />
    <path d="M200 136a10 10 0 0 1 20 0v8h-20Z" fill="#fff" opacity="0.85" />
    <path d="M210 142a2 2 0 0 0 0 4 2 2 0 0 0 0-4Z" fill={INK} />
    <rect x="146" y="164" width="30" height="8" rx="4" fill="#fff" opacity="0.4" />
    <path d="M128 54l-4 10m28-10 4 10M142 44v8M148 38l6 6" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
  </>
);

const YOGAMAT = (
  <>
    <path d="M96 196h128" stroke={INK} strokeWidth="10" strokeLinecap="round" opacity="0.12" />
    <ellipse cx="160" cy="120" rx="86" ry="46" fill={INK} transform="rotate(-12 160 120)" />
    <ellipse cx="160" cy="120" rx="72" ry="34" fill={INK} fillOpacity="0.9" transform="rotate(-12 160 120)" />
    <path d="M96 200c40 6 88 6 128 0" stroke={INK} strokeWidth="7" strokeLinecap="round" opacity="0.35" />
    <path
      d="M160 96c-26 14-40 36-40 56 0 18 14 30 40 36"
      stroke="#fff"
      strokeWidth="7"
      strokeLinecap="round"
      opacity="0.5"
    />
  </>
);

const DUMBBELL = (
  <>
    <g>
      <rect x="66" y="102" width="60" height="36" rx="12" fill={INK} />
      <rect x="70" y="112" width="26" height="16" rx="6" fill={INK} />
      <rect x="96" y="112" width="26" height="16" rx="6" fill={INK} />
    </g>
    <g>
      <rect x="194" y="102" width="60" height="36" rx="12" fill={INK} />
      <rect x="198" y="112" width="26" height="16" rx="6" fill={INK} />
      <rect x="224" y="112" width="26" height="16" rx="6" fill={INK} />
    </g>
    <path d="M126 120h26M168 120h26" stroke={INK} strokeWidth="12" strokeLinecap="round" />
    <path d="M126 120h26m16 0h26" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
  </>
);

const WATCH = (
  <>
    <path d="M116 96c0-22 44-22 88 0" stroke={INK} strokeWidth="14" fill="none" />
    <path d="M116 144c0 22 44 22 88 0" stroke={INK} strokeWidth="14" fill="none" />
    <circle cx="160" cy="120" r="44" fill={INK} />
    <circle cx="160" cy="120" r="36" fill="#fff" opacity="0.92" />
    <circle cx="160" cy="120" r="3" fill={INK} />
    <path d="M160 104v16l10 8" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    <circle cx="160" cy="88" r="14" fill={INK} />
    <circle cx="154" cy="84" r="4" fill="#fff" opacity="0.85" />
    <path d="M160 78v-2" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
  </>
);

const BACKPACK = (
  <>
    <rect x="102" y="78" width="116" height="128" rx="26" fill={INK} />
    <rect x="110" y="66" width="100" height="26" rx="13" fill={INK} />
    <path d="M150 78v-8a10 10 0 0 1 20 0v8" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8" />
    <rect x="128" y="108" width="34" height="44" rx="8" fill="#fff" opacity="0.2" />
    <rect x="120" y="166" width="80" height="12" rx="6" fill="#fff" opacity="0.85" />
    <path d="M160 78c20 10 34 20 44 30M160 78c-20 10-34 20-44 30" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
  </>
);

const EARBUDS = (
  <>
    <path d="M96 180c20 12 108 12 128 0" stroke={INK} strokeWidth="6" strokeLinecap="round" opacity="0.12" />
    <ellipse cx="160" cy="150" rx="56" ry="20" fill={INK} />
    <rect x="96" y="124" width="128" height="20" rx="10" fill={INK} />
    <circle cx="116" cy="96" r="16" fill={INK} />
    <circle cx="204" cy="96" r="16" fill={INK} />
    <path d="M116 112c2 12 10 18 16 12 4-4 2-14-4-18M204 112c-2 12-10 18-16 12-4-4-2-14 4-18" stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none" />
    <circle cx="116" cy="96" r="6" fill="#fff" opacity="0.9" />
    <circle cx="204" cy="96" r="6" fill="#fff" opacity="0.9" />
  </>
);

const BOX = (
  <>
    <path d="M96 84h128l20 26v80a8 8 0 0 1-8 8H84a8 8 0 0 1-8-8v-80l20-26Z" fill={INK} />
    <path d="M96 84l64 26 64-26M160 110v82" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
    <path d="M76 110h168" stroke={INK} strokeWidth="6" opacity="0.2" />
  </>
);

const ARTS = {
  headphones: HEADPHONES,
  speaker: SPEAKER,
  camera: CAMERA,
  camera2: CAMERA,
  tshirt: TSHIRT,
  sneaker: SNEAKER,
  sunglasses: SUNGLASSES,
  controller: CONTROLLER,
  keyboard: KEYBOARD,
  smartphone: SMARTPHONE,
  powerbank: POWERBANK,
  laptop: LAPTOP,
  blender: BLENDER,
  coffee: COFFEE,
  toaster: TOASTER,
  yogamat: YOGAMAT,
  dumbbell: DUMBBELL,
  watch: WATCH,
  backpack: BACKPACK,
  earbuds: EARBUDS,
  box: BOX
};

export default function ProductArt({ art = "box", accent = "#2563EB", className = "", image, alt = "" }) {
  if (image) {
    return (
      <div className={`overflow-hidden bg-white ${className}`}>
        <img src={image} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      </div>
    );
  }

  const node = ARTS[art] || BOX;
  return (
    <Panel accent={accent} className={className}>
      {node}
    </Panel>
  );
}