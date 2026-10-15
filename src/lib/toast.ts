// a tiny publish/subscribe so any client code can show a toast without
// prop drilling. <Toaster /> is the single subscriber.

export type ToastTone = "default" | "error";
type Listener = (message: string, tone: ToastTone) => void;

const listeners = new Set<Listener>();

export function showToast(message: string, tone: ToastTone = "default") {
  listeners.forEach((listener) => listener(message, tone));
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
