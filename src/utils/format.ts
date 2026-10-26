export function formatBerries(value: number): string {
  return `฿ ${value.toLocaleString('es-PE')}`
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
}

// AT_LARGE -> "At large"
export function prettyEnum(value: string): string {
  const text = value.replace(/_/g, ' ').toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}
