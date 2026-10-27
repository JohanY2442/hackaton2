import { useEffect, useRef } from 'react'

// Observa un div al final de la lista; cuando entra en pantalla, pide la siguiente página
export function useInfiniteSentinel(onVisible: () => void, enabled: boolean, resetKey: unknown) {
  const ref = useRef<HTMLDivElement | null>(null)
  const callback = useRef(onVisible)
  callback.current = onVisible

  useEffect(() => {
    const node = ref.current
    if (!node || !enabled) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) callback.current()
      },
      { rootMargin: '400px 0px' }, // empieza a cargar un poco antes de llegar al final
    )
    observer.observe(node)
    return () => observer.disconnect()
    // resetKey: al llegar nuevos items se vuelve a observar (si el centinela sigue visible, carga otra)
  }, [enabled, resetKey])

  return ref
}
