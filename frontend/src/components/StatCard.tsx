import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  valueColor?: string;
}

export function StatCard({ label, value, icon: Icon, iconColor = "text-primary-500", valueColor = "text-white" }: StatCardProps) {
  return (
    <div className="bg-surface-100 border border-surface-border rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-zinc-500 text-xs mb-1">{label}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
        {Icon && (
          <div className={`${iconColor} opacity-50`}>
            <Icon className="h-8 w-8" />
          </div>
        )}
      </div>
    </div>
  );
}
