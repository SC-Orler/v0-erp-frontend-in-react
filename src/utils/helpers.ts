/**
 * Utilidades generales para el sistema ERP
 */

/**
 * Formatea un número como moneda mexicana
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount)
}

/**
 * Formatea una fecha en formato local
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

/**
 * Formatea una fecha con hora
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

/**
 * Calcula el total de un array de items
 */
export function calculateTotal(items: Array<{ precio: number; cantidad: number }>): number {
  return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
}

/**
 * Calcula IVA (16%)
 */
export function calculateIVA(subtotal: number): number {
  return subtotal * 0.16
}

/**
 * Valida RFC mexicano
 */
export function validateRFC(rfc: string): boolean {
  const rfcPattern = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/
  return rfcPattern.test(rfc.toUpperCase())
}

/**
 * Genera un folio único
 */
export function generateFolio(prefix = "V"): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Descarga un archivo
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Obtiene el nombre del mes
 */
export function getMonthName(month: number): string {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  return months[month]
}

/**
 * Valida email
 */
export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

/**
 * Trunca texto
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + "..."
}

/**
 * Obtiene iniciales de un nombre
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Calcula días entre fechas
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
}

/**
 * Verifica si una fecha está próxima a vencer (30 días)
 */
export function isExpiringSoon(expiryDate: string | Date): boolean {
  const days = daysBetween(new Date(), new Date(expiryDate))
  return days <= 30 && days >= 0
}

/**
 * Verifica si una fecha ya venció
 */
export function isExpired(expiryDate: string | Date): boolean {
  return new Date(expiryDate) < new Date()
}
