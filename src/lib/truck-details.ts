import type { TaxonomyItem } from "@/types/api";

export const FORM_MAKES = ["Ford", "Ram", "Chevrolet", "GMC", "Other"];

export const FORM_MODELS: Record<string, string[]> = {
  Ford: ["F-150", "F-250", "F-350", "F-450", "F-550", "F-650", "Other"],
  Ram: ["1500", "2500", "3500", "4500", "5500", "Other"],
  Chevrolet: ["Silverado 1500", "Silverado 2500", "Silverado 3500", "Other"],
  GMC: ["Sierra 1500", "Sierra 2500", "Sierra 3500", "Other"],
  Other: ["Other"],
};

export const TRUCK_TYPE_OPTIONS = [
  "Plumber Truck", "Plumber Van", "Utility Bed", "Utility Truck", "Work Truck",
  "Lifted Truck", "Contractor Truck", "Welding Truck", "Construction Truck",
  "Cargo Van", "Water Truck", "Chipper Truck", "Dump Truck", "Other",
].map((name) => ({ id: name, name }));

export function formMakes(items: TaxonomyItem[]) {
  return FORM_MAKES.flatMap((name) => items.filter((item) => item.name === name));
}

export function formModels(makeName: string, items: TaxonomyItem[]) {
  return (FORM_MODELS[makeName] || []).flatMap((name) =>
    items.filter((item) => item.name === name).map((item) => ({
      ...item,
      name: name === "Other" ? name : `${makeName} ${name}`,
    })),
  );
}
