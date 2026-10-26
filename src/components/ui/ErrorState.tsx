interface Props {
  message: string
  onRetry?: () => void
  retrying?: boolean
}

export default function ErrorState({ message, onRetry, retrying = false }: Props) {
  return (
    <div role="alert" className="rounded-xl border border-red-400/40 bg-red-950/40 p-4 text-red-100">
      <p className="font-semibold">Algo salió mal</p>
      <p className="text-sm opacity-90">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="mt-3 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50"
        >
          {retrying ? 'Reintentando...' : 'Reintentar'}
        </button>
      )}
    </div>
  )
}
