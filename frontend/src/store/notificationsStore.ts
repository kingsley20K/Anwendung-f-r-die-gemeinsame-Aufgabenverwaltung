import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface NotificationsState {
  toasts: Toast[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

const AUTO_DISMISS_MS = 4000;

export const useNotificationsStore = create<NotificationsState>((set) => ({
  toasts: [],

  addToast(type, message) {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, AUTO_DISMISS_MS);
  },

  removeToast(id) {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export const notify = {
  success: (message: string) => useNotificationsStore.getState().addToast('success', message),
  error:   (message: string) => useNotificationsStore.getState().addToast('error',   message),
  info:    (message: string) => useNotificationsStore.getState().addToast('info',    message),
};
