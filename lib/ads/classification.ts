import type { ProductAngle } from "@/lib/ads/types";

export function classifyProductAngle(...names: Array<string | null>): ProductAngle {
  const value = names.filter(Boolean).join(" ").toLowerCase();

  if (/hot\s*dog/.test(value)) return "Hotdog";
  if (value.includes("pepperoni")) return "Pepperoni";
  if (value.includes("mince")) return "Mince";
  if (value.includes("parmesan")) return "Parmesan";
  if (value.includes("cashew cheese") || value.includes("cheese")) {
    return "Cashew Cheese";
  }

  return "Other";
}

export function productAngleLabel(angle: ProductAngle) {
  return angle === "Other" ? "Other" : `Plant-based ${angle}`;
}
