import { X, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export default function NotificationCenter({ notifications, onRemove }) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notif) => {
        const Icon = iconMap[notif.type] || Info;
        return (
          <div
            key={notif.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-300',
              colorMap[notif.type] || colorMap.info
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">{notif.message}</p>
            </div>
            <button
              onClick={() => onRemove(notif.id)}
              className="text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}