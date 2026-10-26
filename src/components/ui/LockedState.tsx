import { Link } from 'react-router-dom'

// Se muestra cuando el backend responde 423 LOG_POSE_REQUIRED (sin desloguear)
export default function LockedState() {
  return (
    <div className="rounded-xl border border-amber-400/40 bg-amber-950/40 p-6 text-amber-100">
      <p className="text-lg font-bold">🔒 Grand Line bloqueado</p>
      <p className="mt-1 text-sm">
        Necesitan el Log Pose: aprueben la inspección de Reverse Mountain (CP3) para desbloquear este tramo.
      </p>
      <Link to="/dashboard" className="mt-3 inline-block text-sm font-semibold underline">
        Ver estado del Log Pose
      </Link>
    </div>
  )
}
