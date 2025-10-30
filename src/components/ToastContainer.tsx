"use client"

import { useUIStore } from "@/store/uiStore"
import Alert from "./Alert"

/**
 * Contenedor de toasts para notificaciones
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <Alert key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}
