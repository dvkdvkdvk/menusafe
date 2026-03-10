import { cn } from "@/lib/utils"
import type { SafetyLevel } from "@/lib/types"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

const config: Record<SafetyLevel, { label: string; className: string; icon: typeof CheckCircle }> = {
  safe: {
    label: "Safe",
    className: "badge-safe",
    icon: CheckCircle,
  },
  caution: {
    label: "Caution",
    className: "badge-caution",
    icon: AlertTriangle,
  },
  unsafe: {
    label: "Avoid",
    className: "badge-unsafe",
    icon: XCircle,
  },
}

export function SafetyBadge({ level, showIcon = true, className }: { level: SafetyLevel; showIcon?: boolean; className?: string }) {
  const c = config[level]
  const Icon = c.icon

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", c.className, className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {c.label}
    </span>
  )
}
