import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { getNewsById, verifyNews } from '../api/news.service'
import { toApiError, type ApiError } from '../api/api'
import type { NewsDetail } from '../types/api'
import type { NewsOutletContext } from './NewsFeedPage'
import { PriorityBadge, StatusBadge } from '../components/news/NewsBadges'
import ErrorState from '../components/ui/ErrorState'
import LockedState from '../components/ui/LockedState'
import Spinner from '../components/ui/Spinner'
import { formatDate, prettyEnum } from '../utils/format'

type Verdict = 'CONFIRMED' | 'DEBUNKED'

export default function NewsDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { reconcile } = useOutletContext<NewsOutletContext>()
  const { data, error, loading, reload } = useFetch((signal) => getNewsById(id, signal), [id])

  const [news, setNews] = useState<NewsDetail | null>(null)
  const [pending, setPending] = useState<Verdict | null>(null)
  const [lastAttempt, setLastAttempt] = useState<Verdict | null>(null)
  const [patchError, setPatchError] = useState<ApiError | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (data) setNews(data)
  }, [data])

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  const close = () => {
    // Volver al feed con los mismos filtros; el feed nunca se desmontó
    if ((location.state as { fromFeed?: boolean } | null)?.fromFeed) navigate(-1)
    else navigate(`/news${location.search}`)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const verify = async (verdict: Verdict) => {
    if (!news || pending) return
    setPending(verdict)
    setLastAttempt(verdict)
    setPatchError(null)
    setSuccess(null)
    try {
      const updated = await verifyNews(news.id, verdict)
      setNews(updated)
      reconcile(updated) // el feed refleja el nuevo estado al volver
      setSuccess(`Noticia marcada como ${prettyEnum(verdict)}.`)
    } catch (err) {
      const apiError = toApiError(err)
      if (apiError.status === 409 && apiError.body?.current) {
        // Ya estaba verificada: mostramos el estado real del servidor
        setNews(apiError.body.current)
        reconcile(apiError.body.current)
      }
      // Se conserva el estado anterior (news no cambia) y se permite reintentar
      setPatchError(apiError)
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="news-title" onClick={close}>
      <div className="mt-10 w-full max-w-2xl rounded-2xl border border-sand-100/10 bg-sea-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" onClick={close} className="float-right rounded-lg px-2 py-1 text-sm font-semibold hover:bg-sea-700">
          ✕ Cerrar
        </button>

        {loading && !news && <div className="flex items-center gap-2"><Spinner /> Cargando noticia...</div>}
        {error && !news && (error.status === 423 ? <LockedState /> : <ErrorState message={error.message} onRetry={reload} retrying={loading} />)}

        {news && (
          <article>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={news.status} />
              <PriorityBadge priority={news.priority} />
              <span className="text-xs opacity-70">{prettyEnum(news.type)} · {news.island}</span>
            </div>
            <h2 id="news-title" className="mt-3 text-2xl font-black">{news.title}</h2>
            <p className="mt-1 text-xs opacity-70">{news.source} · {formatDate(news.publishedAt)}</p>
            <div className="mt-4 space-y-3 leading-relaxed">
              {news.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            </div>
            {news.relatedWanted && (
              <p className="mt-4 text-sm">Relacionado con: <strong>{news.relatedWanted.name}</strong></p>
            )}
            {news.verifiedAt && <p className="mt-2 text-xs opacity-70">Verificada: {formatDate(news.verifiedAt)}</p>}

            {news.status === 'RUMOR' && (
              <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-950/30 p-4">
                <p className="font-bold">¿Verificar este rumor?</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={pending !== null} onClick={() => verify('CONFIRMED')} className="rounded-lg bg-emerald-500 px-4 py-2 font-bold text-sea-950 disabled:opacity-50">
                    {pending === 'CONFIRMED' ? 'Confirmando...' : 'Confirmar'}
                  </button>
                  <button type="button" disabled={pending !== null} onClick={() => verify('DEBUNKED')} className="rounded-lg bg-zinc-400 px-4 py-2 font-bold text-sea-950 disabled:opacity-50">
                    {pending === 'DEBUNKED' ? 'Desmintiendo...' : 'Desmentir'}
                  </button>
                </div>
              </div>
            )}

            <div aria-live="polite">
              {success && <p className="mt-4 rounded-lg bg-emerald-900/60 p-3 text-sm text-emerald-100">✔ {success}</p>}
              {patchError && (
                <div className="mt-4">
                  <ErrorState
                    message={
                      patchError.status === 409
                        ? 'Esta noticia ya había sido verificada; se muestra su estado actual.'
                        : `No se pudo actualizar (${patchError.message}). El estado no cambió.`
                    }
                    onRetry={patchError.status !== 409 && lastAttempt ? () => verify(lastAttempt) : undefined}
                    retrying={pending !== null}
                  />
                </div>
              )}
            </div>
          </article>
        )}
      </div>
    </div>
  )
}
