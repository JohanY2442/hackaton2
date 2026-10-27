import type { SagaStage } from '../../types/api'

interface Props {
  width: number
  height: number
  stages: SagaStage[]
  activeIndex: number
  onSelect: (index: number) => void
}

// Mapa persistente: islas, ruta recorrida hasta la etapa activa y barco en la isla activa
export default function SeaMap({ width, height, stages, activeIndex, onSelect }: Props) {
  const active = stages[activeIndex]
  const allPoints = stages.map((s) => `${s.island.x},${s.island.y}`).join(' ')
  const traveled = stages.slice(0, activeIndex + 1).map((s) => `${s.island.x},${s.island.y}`).join(' ')
  const palette = active?.palette
  const r = Math.max(width, height) / 70

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full rounded-xl"
      role="img"
      aria-label={active ? `Mapa del Grand Line. El barco está en ${active.island.name}` : 'Mapa del Grand Line'}
      style={{ background: palette?.surface }}
    >
      {/* Ruta completa (tenue) */}
      <polyline points={allPoints} fill="none" stroke={palette?.text} strokeOpacity={0.25} strokeWidth={r / 3} strokeDasharray={`${r} ${r}`} />
      {/* Ruta recorrida hasta la etapa activa */}
      {stages.length > 1 && (
        <polyline points={traveled} fill="none" stroke={palette?.accent} strokeWidth={r / 2} strokeLinecap="round" strokeLinejoin="round" />
      )}

      {stages.map((stage, i) => (
        <g key={stage.id} onClick={() => onSelect(i)} style={{ cursor: 'pointer' }}>
          <circle
            cx={stage.island.x}
            cy={stage.island.y}
            r={i === activeIndex ? r * 1.4 : r}
            fill={i <= activeIndex ? palette?.primary : palette?.background}
            stroke={palette?.text}
            strokeWidth={r / 4}
          />
          <text x={stage.island.x} y={stage.island.y + r * 3} textAnchor="middle" fontSize={r * 1.6} fill={palette?.text} fontWeight={i === activeIndex ? 700 : 400}>
            {stage.island.name}
          </text>
        </g>
      ))}

      {/* Barco: se mueve con transform (transición CSS desactivada con reduced motion) */}
      {active && (
        <g className="ship-marker" style={{ transform: `translate(${active.island.x}px, ${active.island.y - r * 3.2}px)` }}>
          <text textAnchor="middle" fontSize={r * 3.2} aria-hidden="true">⛵</text>
        </g>
      )}
    </svg>
  )
}
