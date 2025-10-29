/**
 * Distance conversion utilities
 */

export type DistanceUnit = 'km' | 'mi'

/**
 * Convert miles to kilometers
 */
export function milesToKm(miles: number): number {
  return miles * 1.60934
}

/**
 * Convert kilometers to miles
 */
export function kmToMiles(km: number): number {
  return km / 1.60934
}

/**
 * Round distance to nearest 0.5 to avoid weird decimals
 */
function roundToHalf(num: number): number {
  return Math.round(num * 2) / 2
}

/**
 * Format distance with the specified unit
 * The distance should already be in the correct unit (from the training plan)
 */
export function formatDistance(distance: number | null, unit: DistanceUnit): string {
  if (distance === null || distance === undefined) {
    return '-'
  }

  const rounded = roundToHalf(distance)
  return `${rounded} ${unit}`
}

/**
 * Get just the unit label
 */
export function getUnitLabel(unit: DistanceUnit): string {
  return unit === 'km' ? 'km' : 'mi'
}

/**
 * Convert distance value based on preferred unit
 * Assumes the distance is stored in miles in the database
 */
export function convertDistance(distanceInMiles: number, toUnit: DistanceUnit): number {
  if (toUnit === 'km') {
    return milesToKm(distanceInMiles)
  }
  return distanceInMiles
}
