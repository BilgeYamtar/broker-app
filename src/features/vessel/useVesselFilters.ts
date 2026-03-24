import { useState, useMemo } from "react";
import type { Vessel } from "./vesselSchemas";

interface VesselFilters {
  search: string;
  vesselType: string | null;
}

export function useVesselFilters(vessels: Vessel[]) {
  const [filters, setFilters] = useState<VesselFilters>({
    search: "",
    vesselType: null,
  });

  const filtered = useMemo(() => {
    const query = filters.search.toLowerCase().trim();

    return vessels.filter((v) => {
      if (query) {
        const matchesName = v.vesselName.toLowerCase().includes(query);
        const matchesImo = v.imoNumber.toLowerCase().includes(query);
        const matchesType = v.vesselType.toLowerCase().includes(query);
        if (!matchesName && !matchesImo && !matchesType) return false;
      }

      if (filters.vesselType && v.vesselType !== filters.vesselType)
        return false;

      return true;
    });
  }, [vessels, filters.search, filters.vesselType]);

  const hasActiveFilters =
    filters.search !== "" || filters.vesselType !== null;

  const setSearch = (search: string) =>
    setFilters((f) => ({ ...f, search }));

  const setVesselType = (vesselType: string | null) =>
    setFilters((f) => ({ ...f, vesselType }));

  const clearAll = () =>
    setFilters({ search: "", vesselType: null });

  return {
    filters,
    filtered,
    hasActiveFilters,
    setSearch,
    setVesselType,
    clearAll,
  };
}
