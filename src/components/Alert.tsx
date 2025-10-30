"use client"
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"

interface AlertProps {
  type?: "success" | "error" | "warning" | "info"
  message: string
  onClose?: () => void
}

/**
 * Componente Alert para notificaciones
 */
export default function Alert({ type = "info", message, onClose }: AlertProps) {
  const styles = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  }

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  }

  return (
    <div className={`flex items-center gap-3 p-4 border rounded-lg ${styles[type]}`}>
      {icons[type]}
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-70">
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
