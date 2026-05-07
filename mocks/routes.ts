/**
 * Simplified lat/lng polylines near Metro Manila (mock routes).
 * Not for navigation — UI preview only.
 */
export type LatLng = { latitude: number; longitude: number };

export const MOCK_POLYLINES: Record<string, LatLng[]> = {
  bgc_loop: [
    { latitude: 14.5547, longitude: 121.047 },
    { latitude: 14.552, longitude: 121.051 },
    { latitude: 14.549, longitude: 121.0545 },
    { latitude: 14.55, longitude: 121.0568 },
    { latitude: 14.5535, longitude: 121.055 },
    { latitude: 14.5562, longitude: 121.05 },
  ],
  rizal_strip: [
    { latitude: 14.5832, longitude: 120.981 },
    { latitude: 14.581, longitude: 120.984 },
    { latitude: 14.5785, longitude: 120.983 },
    { latitude: 14.5798, longitude: 120.979 },
  ],
  makati_grid: [
    { latitude: 14.5549, longitude: 121.024 },
    { latitude: 14.5525, longitude: 121.028 },
    { latitude: 14.5498, longitude: 121.0325 },
    { latitude: 14.5515, longitude: 121.035 },
    { latitude: 14.5555, longitude: 121.031 },
  ],
  diliman_oval: [
    { latitude: 14.6535, longitude: 121.065 },
    { latitude: 14.651, longitude: 121.069 },
    { latitude: 14.648, longitude: 121.066 },
    { latitude: 14.6505, longitude: 121.062 },
  ],
};

export function polylineById(id: string): LatLng[] {
  return MOCK_POLYLINES[id] ?? MOCK_POLYLINES.bgc_loop;
}

export function regionForPolyline(coords: LatLng[]) {
  const lats = coords.map((c) => c.latitude);
  const lngs = coords.map((c) => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.02, (maxLat - minLat) * 2.2),
    longitudeDelta: Math.max(0.02, (maxLng - minLng) * 2.2),
  };
}
