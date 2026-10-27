# Log Pose Console — Hackathon Frontend 2026-2 (CS2031 DBP)

Consola en React + TypeScript para la Guild de Cazarrecompensas: carteles de "Se Busca",
noticias del mundo e historia de las sagas del Grand Line.

## Integrantes

| Nombre | Código |
|:-------|:-------|
| Dervy Pillaca Pullo | 202520026 |
| Johan Yadir Huayta Enriquez | 202520023 |
| Leyrin Bridneys Aguilar Jorge | 202510294 |

Tripulación: **Chesmay**

## Cómo ejecutar

Requisitos: Node 24 LTS y npm.

```bash
npm install
cp .env.example .env      # en Windows: copy .env.example .env
npm run dev               # http://localhost:5173
```

Otros comandos:

```bash
npm run build       # typecheck + build de producción
npm run typecheck   # solo verificación de tipos
```

## Variables de entorno

| Variable | Descripción |
|:---------|:------------|
| `VITE_API_BASE_URL` | URL base de la API (`https://logpose-api-jg7f.onrender.com/api/v1`) |

## Stack

React 18, TypeScript estricto, Vite, React Router, Tailwind CSS y Axios.

## Decisiones técnicas

- **Sesión:** el JWT se guarda en `localStorage`. Un interceptor de Axios (`src/api/api.ts`) agrega
  `Authorization: Bearer` a cada request; ante un 401 se cierra la sesión. Al cargar la app se valida
  con `/auth/me` mostrando "Verificando sesión" (sin parpadeo del login).
- **Rutas privadas:** `PrivateRoute` guarda la ruta original y, tras el login, vuelve a ella.
- **Carteles (CP2):** la URL es la fuente de verdad (`useSearchParams`). Los parámetros se validan
  (`utils/wantedParams.ts`); paginación, filtros, búsqueda y orden los resuelve el backend. Búsqueda con
  debounce de 400 ms. Las respuestas antiguas se cancelan con `AbortController` y se descartan por id.
- **Noticias (CP4):** infinite scroll por cursor con `IntersectionObserver`, deduplicación por id, una
  sola carga en vuelo y reinicio del cursor al cambiar filtros. El detalle se abre sobre el feed, que
  conserva datos y posición.
- **Sagas (CP5):** scrollytelling con `IntersectionObserver`, mapa SVG con el barco y la ruta recorrida,
  etapa activa en la URL (`?stage=`), CSS Scroll-driven Animations con fallback, View Transition API,
  navegación por teclado y soporte de `prefers-reduced-motion`.
