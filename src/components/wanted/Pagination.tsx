interface Props {
  page: number
  totalPages: number
  disabled?: boolean
  onChange: (page: number) => void
}

// Muestra páginas en base 1 para el usuario, pero trabaja en base 0 como la API
export default function Pagination({ page, totalPages, disabled = false, onChange }: Props) {
  if (totalPages <= 1) return null

  const start = Math.max(0, Math.min(page - 2, totalPages - 5))
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i)
  const btn = 'min-w-9 rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-40'

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-center gap-1">
      <button type="button" className={`${btn} bg-sea-800`} disabled={disabled || page === 0} onClick={() => onChange(page - 1)}>
        ‹ Anterior
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? 'page' : undefined}
          className={`${btn} ${p === page ? 'bg-gold-400 text-sea-950' : 'bg-sea-800'}`}
          disabled={disabled}
          onClick={() => onChange(p)}
        >
          {p + 1}
        </button>
      ))}
      <button type="button" className={`${btn} bg-sea-800`} disabled={disabled || page >= totalPages - 1} onClick={() => onChange(page + 1)}>
        Siguiente ›
      </button>
      <span className="ml-2 text-xs opacity-70">
        Página {page + 1} de {totalPages}
      </span>
    </nav>
  )
}
