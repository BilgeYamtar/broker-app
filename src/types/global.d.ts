/// <reference types="nativewind/types" />

declare module "sea-ports" {
  const ports: Record<
    string,
    Record<
      string,
      {
        name?: string;
        country?: string;
        coordinates?: [number, number];
      }
    >
  >;
  export default ports;
}

declare module "searoute-js" {
  function searoute(
    origin: [number, number],
    destination: [number, number],
    units?: string
  ): {
    properties: { length: number };
    geometry: { coordinates: [number, number][] };
  } | null;
  export = searoute;
}
