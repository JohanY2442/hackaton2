export default function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-sand-100/30 p-8 text-center text-sand-100/80">
      <p className="text-lg font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm">{hint}</p>}
    </div>
  )
}
