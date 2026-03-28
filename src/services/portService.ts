/**
 * Port database and sea route distance calculator.
 *
 * Uses `sea-ports` for the port database (1600+ ports)
 * and `searoute-js` for offline nautical distance calculation.
 */

import allPortsRaw from "sea-ports";

// ── Types ───────────────────────────────────────────────────────────────────

export interface Port {
  code: string;
  name: string;
  country: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface RouteResult {
  distanceNm: number;
  pathCoordinates: [number, number][];
}

// ── Flatten the sea-ports data into a searchable array ───────────────────────

const portsCache: Port[] = [];

function loadPorts(): Port[] {
  if (portsCache.length > 0) return portsCache;

  const raw = allPortsRaw as Record<string, Record<string, {
    name?: string;
    country?: string;
    coordinates?: [number, number];
  }>>;

  for (const group of Object.values(raw)) {
    for (const [code, port] of Object.entries(group)) {
      if (
        port.coordinates &&
        typeof port.coordinates[0] === "number" &&
        typeof port.coordinates[1] === "number" &&
        port.name
      ) {
        portsCache.push({
          code,
          name: port.name,
          country: port.country ?? "",
          coordinates: port.coordinates,
        });
      }
    }
  }

  // Sort by name for display
  portsCache.sort((a, b) => a.name.localeCompare(b.name));
  return portsCache;
}

export function getAllPorts(): Port[] {
  return loadPorts();
}

export function searchPorts(query: string): Port[] {
  const ports = loadPorts();
  if (!query.trim()) return ports;

  const q = query.toLowerCase();
  return ports.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q)
  );
}

// ── Distance calculation ────────────────────────────────────────────────────

let searouteModule: ((
  origin: [number, number],
  destination: [number, number],
  units?: string
) => { properties: { length: number }; geometry: { coordinates: [number, number][] } } | null) | null = null;

function getSearoute() {
  if (!searouteModule) {
    // Dynamic require — searoute-js is CommonJS
    searouteModule = require("searoute-js");
  }
  return searouteModule!;
}

/**
 * Haversine formula fallback — straight-line nautical miles.
 */
function haversineNm(
  origin: [number, number],
  destination: [number, number]
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const [lon1, lat1] = origin;
  const [lon2, lat2] = destination;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const earthRadiusNm = 3440.065; // nautical miles
  return earthRadiusNm * c;
}

/**
 * Calculate sea route distance between two ports.
 * Uses searoute-js for actual maritime routes, falls back to Haversine.
 */
export function calculateRoute(
  origin: Port,
  destination: Port
): RouteResult {
  try {
    const searoute = getSearoute();
    const route = searoute(origin.coordinates, destination.coordinates, "nm");

    if (route && route.properties && route.properties.length > 0) {
      return {
        distanceNm: Math.round(route.properties.length * 10) / 10,
        pathCoordinates: route.geometry.coordinates,
      };
    }
  } catch {
    // searoute-js failed — fall back to Haversine
  }

  // Haversine fallback (straight-line, ~20% shorter than actual sea routes)
  const straightLine = haversineNm(origin.coordinates, destination.coordinates);
  // Apply 1.2x multiplier to approximate sea route distance
  const estimated = Math.round(straightLine * 1.2 * 10) / 10;

  return {
    distanceNm: estimated,
    pathCoordinates: [origin.coordinates, destination.coordinates],
  };
}
