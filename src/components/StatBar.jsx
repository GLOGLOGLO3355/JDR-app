export default function StatBar({ label, value, max = 20, color = 'cyan' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  const colors = {
    cyan: { fill: 'linear-gradient(90deg, #00f5ff, #0080ff)', shadow: 'var(--cyan)' },
    magenta: { fill: 'linear-gradient(90deg, #ff00ff, #aa00ff)', shadow: 'var(--magenta)' },
    yellow: { fill: 'linear-gradient(90deg, #ffe600, #ff8800)', shadow: 'var(--yellow)' },
    red: { fill: 'linear-gradient(90deg, #ff0044, #ff4488)', shadow: '#ff0044' },
  }
  const c = colors[color] || colors.cyan

  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs tracking-widest text-slate-400">{label}</span>
        <span className="font-display text-xs" style={{color: c.shadow}}>{value}<span className="text-slate-600">/{max}</span></span>
      </div>
      <div className="stat-bar-bg">
        <div
          className="stat-bar-fill"
          style={{
            width: `${pct}%`,
            background: c.fill,
            boxShadow: `0 0 6px ${c.shadow}`,
          }}
        />
      </div>
    </div>
  )
}
