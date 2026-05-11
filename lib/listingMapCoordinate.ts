/** Deterministic coordinates for mock run listings, scattered around a base location. */
export function coordinateForRunListingId(
  listingId: string,
  base?: { latitude: number; longitude: number }
): { latitude: number; longitude: number } {
  const baseLat = base?.latitude ?? 14.5547;
  const baseLng = base?.longitude ?? 121.0509;

  // Two independent FNV-1a hashes with different seeds so lat/lng are uncorrelated.
  let h1 = 2166136261;
  let h2 = 0x811c9dc5 ^ 0xdeadbeef; // different starting state
  for (let i = 0; i < listingId.length; i += 1) {
    const c = listingId.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 16777619);
    h2 ^= c ^ (i + 1);
    h2 = Math.imul(h2, 16777619);
    h2 ^= Math.imul(h1, 2246822519);
  }

  const u = (h1 >>> 0) / 0xffffffff;
  const v = (h2 >>> 0) / 0xffffffff;

  // ~2.5 km spread in each direction at equatorial scale (~0.022° ≈ 2.4 km)
  return {
    latitude: baseLat + (u - 0.5) * 0.044,
    longitude: baseLng + (v - 0.5) * 0.044,
  };
}
