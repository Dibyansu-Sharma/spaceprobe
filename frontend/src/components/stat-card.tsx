import type { LucideIcon } from "lucide-react"
import { cn } from "../lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: string
  trend?: number
}

export function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          {trend && (
            <p className={cn("text-sm mt-1", trend > 0 ? "text-green-600" : "text-red-600")}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last hour
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )
}

