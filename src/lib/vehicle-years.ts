export const MIN_VEHICLE_YEAR = 1950;
export const MAX_VEHICLE_YEAR = 2016;

export const VEHICLE_YEAR_OPTIONS = Array.from(
  { length: MAX_VEHICLE_YEAR - MIN_VEHICLE_YEAR + 1 },
  (_, index) => {
    const year = String(MAX_VEHICLE_YEAR - index);
    return { id: year, name: year };
  },
);

export function isVehicleYear(value: string | number): boolean {
  const year = Number(value);
  return Number.isInteger(year) && year >= MIN_VEHICLE_YEAR && year <= MAX_VEHICLE_YEAR;
}
