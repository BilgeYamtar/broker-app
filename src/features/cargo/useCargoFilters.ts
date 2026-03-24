import { useState, useMemo } from "react";
import type { Cargo } from "./cargoSchemas";

interface CargoFilters {
  search: string;
  cargoType: string | null;
  hazardClass: string | null;
}

export function useCargoFilters(cargoes: Cargo[]) {
  const [filters, setFilters] = useState<CargoFilters>({
    search: "",
    cargoType: null,
    hazardClass: null,
  });

  const filtered = useMemo(() => {
    const query = filters.search.toLowerCase().trim();

    return cargoes.filter((c) => {
      if (query) {
        const matchesName = c.cargoName.toLowerCase().includes(query);
        const matchesType = c.cargoType.toLowerCase().includes(query);
        const matchesHazard = c.hazardClass.toLowerCase().includes(query);
        if (!matchesName && !matchesType && !matchesHazard) return false;
      }

      if (filters.cargoType && c.cargoType !== filters.cargoType) return false;
      if (filters.hazardClass && c.hazardClass !== filters.hazardClass)
        return false;

      return true;
    });
  }, [cargoes, filters.search, filters.cargoType, filters.hazardClass]);

  const hasActiveFilters =
    filters.search !== "" ||
    filters.cargoType !== null ||
    filters.hazardClass !== null;

  const setSearch = (search: string) =>
    setFilters((f) => ({ ...f, search }));

  const setCargoType = (cargoType: string | null) =>
    setFilters((f) => ({ ...f, cargoType }));

  const setHazardClass = (hazardClass: string | null) =>
    setFilters((f) => ({ ...f, hazardClass }));

  const clearAll = () =>
    setFilters({ search: "", cargoType: null, hazardClass: null });

  return {
    filters,
    filtered,
    hasActiveFilters,
    setSearch,
    setCargoType,
    setHazardClass,
    clearAll,
  };
}
