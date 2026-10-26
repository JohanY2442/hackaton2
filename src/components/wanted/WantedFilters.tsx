import { useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { getCrews } from "../../api/wanted.service";
import {
  FRUIT_FILTERS,
  PAGE_SIZES,
  WANTED_SORTS,
  WANTED_STATUSES,
  type FruitFilter,
  type PageSize,
  type WantedSort,
  type WantedStatus,
} from "../../types/api";
import type { WantedQuery } from "../../utils/wantedParams";
import { prettyEnum } from "../../utils/format";

interface Props {
  query: WantedQuery;
  onChange: (patch: Partial<WantedQuery>) => void;
}

const sortLabels: Record<WantedSort, string> = {
  "bounty,desc": "Mayor recompensa",
  "name,asc": "Nombre (A-Z)",
  "updatedAt,desc": "Actualizados recientemente",
};

const selectClass =
  "w-full rounded-lg border border-sand-100/20 bg-sea-950 px-3 py-2 text-sm";

export default function WantedFilters({ query, onChange }: Props) {
  // Opciones de tripulación desde la API (nada hardcodeado)
  const crews = useFetch((signal) => getCrews(signal), []);

  // El input tiene estado local; la URL solo se actualiza cuando el usuario deja de escribir
  const [search, setSearch] = useState(query.q);
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  // Si la URL cambia desde afuera (atrás/adelante), el input se sincroniza
  useEffect(() => {
    setSearch((prev) => (prev.trim() === query.q ? prev : query.q));
  }, [query.q]);

  useEffect(() => {
    if (debouncedSearch !== query.q) onChange({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="grid gap-3 rounded-xl border border-sand-100/10 bg-sea-900 p-4 sm:grid-cols-2 lg:grid-cols-6">
      <label className="text-sm lg:col-span-2">
        <span className="font-semibold">Buscar</span>
        <input
          type="search"
          value={search}
          maxLength={100}
          placeholder="Nombre o epíteto..."
          onChange={(e) => setSearch(e.target.value)}
          className={`${selectClass} mt-1`}
        />
      </label>

      <label className="text-sm">
        <span className="font-semibold">Estado</span>
        <select
          className={`${selectClass} mt-1`}
          value={query.status}
          onChange={(e) =>
            onChange({ status: e.target.value as WantedStatus | "" })
          }
        >
          <option value="">Todos</option>
          {WANTED_STATUSES.map((s) => (
            <option key={s} value={s}>
              {prettyEnum(s)}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        <span className="font-semibold">Tripulación</span>
        <select
          className={`${selectClass} mt-1`}
          value={query.crewId}
          disabled={crews.loading && !crews.data}
          onChange={(e) => onChange({ crewId: e.target.value })}
        >
          <option value="">{crews.error ? "Error al cargar" : "Todas"}</option>
          {/* Si la URL trae una tripulación que no está en la lista, se mantiene visible */}
          {query.crewId &&
            crews.data &&
            !crews.data.some((c) => c.id === query.crewId) && (
              <option value={query.crewId}>{query.crewId}</option>
            )}
          {crews.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {crews.error && (
          <button
            type="button"
            onClick={crews.reload}
            className="mt-1 text-xs underline"
          >
            Reintentar
          </button>
        )}
      </label>

      <label className="text-sm">
        <span className="font-semibold">Fruta del diablo</span>
        <select
          className={`${selectClass} mt-1`}
          value={query.fruit}
          onChange={(e) =>
            onChange({ fruit: e.target.value as FruitFilter | "" })
          }
        >
          <option value="">Todas</option>
          {FRUIT_FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "NONE" ? "Sin fruta" : prettyEnum(f)}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">
          <span className="font-semibold">Orden</span>
          <select
            className={`${selectClass} mt-1`}
            value={query.sort}
            onChange={(e) => onChange({ sort: e.target.value as WantedSort })}
          >
            {WANTED_SORTS.map((s) => (
              <option key={s} value={s}>
                {sortLabels[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-semibold">Tamaño</span>
          <select
            className={`${selectClass} mt-1`}
            value={query.size}
            onChange={(e) =>
              onChange({ size: Number(e.target.value) as PageSize })
            }
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
