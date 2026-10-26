import Spinner from './Spinner'

export default function FullScreenLoader({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="min-h-screen grid place-items-center bg-sea-950 text-sand-100">
      <div className="flex items-center gap-3">
        <Spinner />
        <span>{label}</span>
      </div>
    </div>
  )
}
