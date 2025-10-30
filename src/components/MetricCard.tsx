import type { LucideIcon } from "lucide-react"
import { formatCurrency } from "@/utils/helpers"

interface MetricCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color?: "blue" | "green" | "yellow" | "red" | "purple"
  isCurrency?: boolean
  trend?: {
    value: number
    isPositive: boolean
  }
}

/**
 * Tarjeta de métrica para el dashboard
 */
export default function MetricCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  isCurrency = false,
  trend,
}: MetricCardProps) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
  }

  const displayValue = isCurrency && typeof value === "number" ? formatCurrency(value) : value

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{displayValue}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
