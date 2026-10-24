// Flat-rendered jar used in cards and the cart, so only the hero pays for WebGL.
export default function JarIllustration({ color, no }: { color: string; no: string }) {
  const id = `j${no}`;
  return (
    <svg viewBox="0 0 160 220" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".18" stopColor="#fff" stopOpacity=".05" />
          <stop offset=".8" stopColor="#fff" stopOpacity=".02" />
          <stop offset="1" stopColor="#fff" stopOpacity=".2" />
        </linearGradient>
        <linearGradient id={`${id}-sauce`} x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity=".75" />
          <stop offset=".45" stopColor={color} />
          <stop offset="1" stopColor="#000" stopOpacity=".55" />
        </linearGradient>
        <linearGradient id={`${id}-lid`} x1="0" x2="1">
          <stop offset="0" stopColor="#3a3330" />
          <stop offset=".3" stopColor="#0d0a09" />
          <stop offset=".55" stopColor="#4a423e" />
          <stop offset="1" stopColor="#0d0a09" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="212" rx="62" ry="7" fill="#000" opacity=".5" />
      <rect x="22" y="60" width="116" height="148" rx="16" fill={`url(#${id}-sauce)`} />
      <rect x="22" y="60" width="116" height="16" rx="8" fill="#000" opacity=".25" />
      <rect x="22" y="104" width="116" height="62" fill="#0d0a09" />
      <rect x="22" y="104" width="116" height="62" fill="none" stroke={color} strokeOpacity=".7" />
      <text x="80" y="128" textAnchor="middle" fill="#F4EEE6" fontFamily="var(--font-display)" fontWeight="800" fontSize="17" letterSpacing="1">
        EMBER &amp; ASH
      </text>
      <text x="80" y="152" textAnchor="middle" fill={color === "#8E2A12" ? "#FF8A3D" : color} fontFamily="var(--font-display)" fontWeight="900" fontSize="22">
        No.{no}
      </text>
      <rect x="18" y="48" width="124" height="164" rx="20" fill={`url(#${id}-glass)`} stroke="#fff" strokeOpacity=".22" />
      <rect x="30" y="62" width="8" height="140" rx="4" fill="#fff" opacity=".22" />
      <rect x="24" y="14" width="112" height="38" rx="6" fill={`url(#${id}-lid)`} />
      {Array.from({ length: 18 }).map((_, i) => (
        <rect key={i} x={28 + i * 6} y="16" width="1.5" height="34" fill="#fff" opacity=".06" />
      ))}
    </svg>
  );
}
