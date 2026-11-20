export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <g id="leaf">
          <path d="M0 0 C 26 -30, 58 -34, 84 -22 C 62 2, 30 10, 0 0 Z" fill="#3E7C3A" />
          <path d="M4 -2 C 30 -14, 56 -19, 80 -21" stroke="#2C5B29" strokeWidth="3" fill="none" />
        </g>
        <g id="folder">
          <path d="M6 22 a6 6 0 0 1 6-6 h34 l10 12 h66 a6 6 0 0 1 6 6 v58 a6 6 0 0 1-6 6 H12 a6 6 0 0 1-6-6 Z" fill="#2B5CFF" />
          <path d="M6 40 h122 v52 a6 6 0 0 1-6 6 H12 a6 6 0 0 1-6-6 Z" fill="#9CC8FF" />
        </g>
      </defs>
    </svg>
  );
}

export function FolderSvg({ className, style, color = '#5B8DEF' }: { className?: string; style?: React.CSSProperties; color?: string }) {
  return (
    <svg className={className} style={style} viewBox="0 0 100 80" aria-hidden="true">
      <path d="M6 14 Q6 8 12 8 L34 8 L42 18 L88 18 Q94 18 94 24 L94 66 Q94 72 88 72 L12 72 Q6 72 6 66 Z" fill={color} />
    </svg>
  );
}
