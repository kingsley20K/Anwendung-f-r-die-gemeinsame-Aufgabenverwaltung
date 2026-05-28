import { useNotificationsStore, type Toast } from '../../store/notificationsStore';

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useNotificationsStore((s) => s.removeToast);

  const colours: Record<Toast['type'], string> = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    info:    'bg-blue-600',
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-lg
        text-white text-sm min-w-[240px] max-w-sm ${colours[toast.type]}`}
    >
      <span>{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 opacity-75 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useNotificationsStore((s) => s.toasts);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
