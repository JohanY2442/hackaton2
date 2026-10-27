import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { getSagaStory } from '../api/sagas.service'
import SeaMap from '../components/saga/SeaMap'
import ErrorState from '../components/ui/ErrorState'
import LockedState from '../components/ui/LockedState'
import Spinner from '../components/ui/Spinner'

export default function SagaStoryPage() {
  const { id = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const reducedMotion = useReducedMotion()
  const { data, error, loading, reload } = useFetch((signal) => getSagaStory(id, signal), [id])

  const stages = useMemo(() => (data ? [...data.stages].sort((a, b) => a.order - b.order) : []), [data])
  const stageParam = searchParams.get('stage')
  const initialIndex = Math.max(0, stages.findIndex((s) => s.slug === stageParam))

  const [activeIndex, setActiveIndex] = useState(0)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const progressRef = useRef<HTMLDivElement | null>(null)
  const didInitialScroll = useRef(false)
  const programmaticScroll = useRef(false)

  // 1) Abrir la URL con ?stage=slug lleva directo a esa etapa
  useEffect(() => {
    if (!stages.length || didInitialScroll.current) return
    didInitialScroll.current = true
    setActiveIndex(initialIndex)
    if (initialIndex > 0) {
      requestAnimationFrame(() => sectionRefs.current[initialIndex]?.scrollIntoView({ block: 'center' }))
    }
  }, [stages, initialIndex])

  // 2) La etapa activa se detecta con IntersectionObserver (la que cruza el centro de la pantalla)
  useEffect(() => {
    if (!stages.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (programmaticScroll.current) return
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index)
            if (!Number.isNaN(index)) setActiveIndex(index)
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    sectionRefs.current.forEach((node) => node && observer.observe(node))
    return () => observer.disconnect()
  }, [stages])

  // 3) La URL refleja la etapa activa (replace para no llenar el historial)
  useEffect(() => {
    const stage = stages[activeIndex]
    if (!stage || !didInitialScroll.current) return
    if (searchParams.get('stage') !== stage.slug) {
      const next = new URLSearchParams(searchParams)
      next.set('stage', stage.slug)
      setSearchParams(next, { replace: true })
    }
  }, [activeIndex, stages, searchParams, setSearchParams])

  // 4) Fallback de la barra de progreso cuando no hay CSS scroll-driven animations
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const ratio = max > 0 ? window.scrollY / max : 0
      progressRef.current?.style.setProperty('--progress', String(Math.min(1, Math.max(0, ratio))))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [stages])

  // 5) Navegación por teclado entre etapas
  const goTo = useCallback(
    (index: number) => {
      if (!stages.length) return
      const target = Math.min(stages.length - 1, Math.max(0, index))
      const node = sectionRefs.current[target]
      programmaticScroll.current = true
      setActiveIndex(target)
      node?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
      node?.focus({ preventScroll: true })
      window.setTimeout(() => (programmaticScroll.current = false), reducedMotion ? 50 : 700)
    },
    [stages, reducedMotion],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || e.altKey || e.ctrlKey || e.metaKey) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        goTo(activeIndex + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        goTo(activeIndex - 1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        goTo(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        goTo(stages.length - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo, activeIndex, stages.length])

  if (loading && !data) return <div className="flex items-center gap-2"><Spinner /> Descifrando el Poneglyph...</div>
  if (error) return error.status === 423 ? <LockedState /> : <ErrorState message={error.message} onRetry={reload} retrying={loading} />
  if (!data || stages.length === 0) return <ErrorState message="Esta saga no tiene etapas." />

  const active = stages[activeIndex] ?? stages[0]
  const palette = active.palette
  const themeStyle = {
    '--saga-bg': palette.background,
    '--saga-surface': palette.surface,
    '--saga-primary': palette.primary,
    '--saga-accent': palette.accent,
    '--saga-text': palette.text,
    background: palette.background,
    color: palette.text,
  } as CSSProperties

  return (
    <div className="-mx-4 -my-6 px-4 py-6 transition-colors duration-500" style={themeStyle}>
      {/* Progreso del recorrido: scroll-driven en CSS; fallback con --progress */}
      <div className="fixed left-0 right-0 top-0 z-50 h-1.5 bg-black/20" aria-hidden="true">
        <div ref={progressRef} className="story-progress h-full w-full" style={{ background: palette.accent }} />
      </div>

      <Link to="/sagas" viewTransition className="text-sm font-semibold underline">← Todas las sagas</Link>

      <header className="mt-3" style={{ viewTransitionName: `saga-${data.saga.id}` }}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: palette.accent }}>Saga {data.saga.order}</p>
        <h1 className="text-3xl font-black md:text-4xl" style={{ color: palette.primary }}>{data.saga.title}</h1>
        <p className="italic opacity-90">{data.saga.subtitle}</p>
        <p className="mt-3 max-w-2xl leading-relaxed">{data.saga.intro}</p>
        <p className="mt-2 text-xs opacity-70">Usa ↑ ↓ (o ← →) para moverte entre etapas.</p>
      </header>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Panel persistente: en mobile se pega arriba, en desktop a la izquierda */}
        <aside className="sticky top-14 z-20 self-start md:top-20">
          <div className="rounded-2xl p-3 shadow-xl" style={{ background: palette.surface }}>
            <div className="aspect-[4/3] max-h-[38vh] w-full md:max-h-none">
              <SeaMap width={data.map.width} height={data.map.height} stages={stages} activeIndex={activeIndex} onSelect={goTo} />
            </div>
            <div aria-live="polite" className="mt-3">
              <p className="text-sm font-bold">
                Etapa {activeIndex + 1} de {stages.length} · {active.island.name}
              </p>
              <div className="mt-1 h-2 rounded-full bg-black/20" role="progressbar" aria-valuemin={1} aria-valuemax={stages.length} aria-valuenow={activeIndex + 1} aria-label="Progreso del recorrido">
                <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${((activeIndex + 1) / stages.length) * 100}%`, background: palette.accent }} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2">
                {active.metrics.map((m) => (
                  <div key={m.key} className="rounded-lg p-2" style={{ background: palette.background }}>
                    <dt className="text-xs opacity-80">{m.label}</dt>
                    <dd className="text-lg font-black" style={{ color: palette.primary }}>
                      {m.value.toLocaleString('es-PE')} <span className="text-xs font-normal">{m.unit}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0} className="rounded-lg px-3 py-1 text-sm font-semibold disabled:opacity-40" style={{ background: palette.primary, color: palette.background }}>
                  ↑ Anterior
                </button>
                <button type="button" onClick={() => goTo(activeIndex + 1)} disabled={activeIndex === stages.length - 1} className="rounded-lg px-3 py-1 text-sm font-semibold disabled:opacity-40" style={{ background: palette.primary, color: palette.background }}>
                  Siguiente ↓
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Narrativa por etapas activadas por scroll */}
        <ol className="space-y-[40vh] pb-[40vh] pt-[10vh]">
          {stages.map((stage, i) => (
            <li key={stage.id}>
              <section
                ref={(node) => {
                  sectionRefs.current[i] = node
                }}
                data-index={i}
                id={stage.slug}
                tabIndex={-1}
                aria-current={i === activeIndex ? 'step' : undefined}
                aria-labelledby={`stage-title-${stage.id}`}
                className={`stage-card rounded-2xl p-5 shadow-lg outline-none focus-visible:ring-4 ${i === activeIndex ? 'ring-2' : 'opacity-80'}`}
                style={{ background: stage.palette.surface, color: stage.palette.text, ['--tw-ring-color' as string]: stage.palette.accent }}
              >
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: stage.palette.accent }}>
                  Etapa {stage.order} · {stage.island.name}
                </p>
                <h2 id={`stage-title-${stage.id}`} className="mt-1 text-2xl font-black" style={{ color: stage.palette.primary }}>
                  {stage.title}
                </h2>
                <div className="mt-3 space-y-3 leading-relaxed">
                  {stage.narrative.map((p, j) => <p key={j}>{p}</p>)}
                </div>
              </section>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
