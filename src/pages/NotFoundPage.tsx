import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center p-4 text-center">
      <div>
        <p className="text-6xl font-black text-gold-400">404</p>
        <p className="mt-2 text-lg">Esta isla no aparece en ningún mapa.</p>
        <Link to="/dashboard" className="mt-4 inline-block rounded-lg bg-gold-400 px-4 py-2 font-bold text-sea-950">
          Volver al dashboard
        </Link>
      </div>
    </div>
  )
}
