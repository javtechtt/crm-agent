import type { ProductPerformance } from "@/lib/ads/types";

import { money, number } from "./format";

export function ProductChart({ products }: { products: ProductPerformance[] }) {
  const maxResults = Math.max(...products.map((product) => product.results), 1);
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.productAngle}>
          <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
            <span className="font-medium">{product.displayName}</span>
            <span className="text-zinc-500">
              {number(product.results)} results · {money(product.costPerResult)} CPR
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-emerald-950/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-lime-500"
              style={{ width: `${Math.max((product.results / maxResults) * 100, product.spend ? 3 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
