import type { MenuItem } from "@/lib/types"
import { SafetyBadge } from "@/components/safety-badge"

export function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{item.name}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.reason}</p>
        {item.ingredients_of_concern.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.ingredients_of_concern.map((ingredient) => (
              <span
                key={ingredient}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {ingredient}
              </span>
            ))}
          </div>
        )}
      </div>
      <SafetyBadge level={item.safety} className="shrink-0" />
    </div>
  )
}
