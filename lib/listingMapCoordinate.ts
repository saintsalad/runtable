/** Deterministic coordinates for mock run listings (Metro Manila-ish hub). */
export function coordinateForRunListingId(listingId: string): {
  latitude: number;
  longitude: number;
} {
  const baseLat = 14.5547;
  const baseLng = 121.0244;
  let h = 2166136261;
  for (let i = 0; i < listingId.length; i += 1) {
    h ^= listingId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = (h >>> 0) / 0xffff_ffff;
  const v = ((h >> 16) >>> 0) / 0xffff_ffff;
  return {
    latitude: baseLat + (u - 0.5) * 0.07,
    longitude: baseLng + (v - 0.5) * 0.07,
  };
}
