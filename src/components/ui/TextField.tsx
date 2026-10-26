import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function TextField({ label, error, id, ...rest }: Props) {
  const inputId = id ?? rest.name
  return (
    <label htmlFor={inputId} className="block text-sm">
      <span className="font-semibold">{label}</span>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`mt-1 w-full rounded-lg border bg-sea-950 px-3 py-2 outline-none focus:ring-2 focus:ring-gold-400 ${
          error ? 'border-red-400' : 'border-sand-100/20'
        }`}
        {...rest}
      />
      {error && (
        <span id={`${inputId}-error`} className="mt-1 block text-xs text-red-300">
          {error}
        </span>
      )}
    </label>
  )
}
