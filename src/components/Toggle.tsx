"use client"

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

/**
 * Componente Toggle (switch)
 */
export default function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`block w-14 h-8 rounded-full transition-colors ${
            checked ? "bg-blue-600" : "bg-gray-300"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
        <div
          className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
            checked ? "transform translate-x-6" : ""
          }`}
        />
      </div>
      {label && <span className={`text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700"}`}>{label}</span>}
    </label>
  )
}
