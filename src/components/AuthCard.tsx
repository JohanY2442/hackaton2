import type { ReactNode } from 'react'

export default function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-sea-900 to-sea-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-sand-100/10 bg-sea-900 p-6 shadow-2xl">
        <p className="text-center text-4xl">🧭</p>
        <h1 className="mt-2 text-center text-2xl font-black text-gold-400">{title}</h1>
        <p className="mb-6 text-center text-sm opacity-80">{subtitle}</p>
        {children}
      </div>
    </div>
  )
}
