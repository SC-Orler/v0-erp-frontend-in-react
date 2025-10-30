import { api } from "./api"
import { generateFolio } from "@/utils/helpers"

interface CompraItem {
  productoId: number
  nombre: string
  cantidad: number
  precioUnitario: number
}

interface Compra {
  id: number
  folio: string
  fecha: string
  proveedorId: number
  proveedorNombre: string
  items: CompraItem[]
  subtotal: number
  iva: number
  total: number
  estado: "pendiente" | "recibida" | "cancelada"
  facturaProveedor?: string
  observaciones?: string
}

/**
 * Servicio de compras
 */
export const comprasService = {
  /**
   * Obtener todas las compras
   */
  async getCompras(params?: { start?: string; end?: string; proveedorId?: number }): Promise<Compra[]> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockCompras: Compra[] = [
            {
              id: 1,
              folio: "COMP-001",
              fecha: "2025-10-25T10:00:00",
              proveedorId: 1,
              proveedorNombre: "Mariscos del Pacífico SA",
              items: [
                { productoId: 1, nombre: "Camarón Fresco", cantidad: 50, precioUnitario: 180 },
                { productoId: 7, nombre: "Atún Fresco", cantidad: 30, precioUnitario: 240 },
              ],
              subtotal: 16200,
              iva: 2592,
              total: 18792,
              estado: "recibida",
              facturaProveedor: "FAC-PROV-001",
            },
            {
              id: 2,
              folio: "COMP-002",
              fecha: "2025-10-26T14:30:00",
              proveedorId: 2,
              proveedorNombre: "Distribuidora de Lácteos Norte",
              items: [{ productoId: 2, nombre: "Queso Crema Philadelphia", cantidad: 100, precioUnitario: 60 }],
              subtotal: 6000,
              iva: 960,
              total: 6960,
              estado: "recibida",
              facturaProveedor: "FAC-PROV-002",
            },
            {
              id: 3,
              folio: "COMP-003",
              fecha: "2025-10-28T09:00:00",
              proveedorId: 3,
              proveedorNombre: "Importadora Asia Foods",
              items: [
                { productoId: 3, nombre: "Algas Nori", cantidad: 50, precioUnitario: 30 },
                { productoId: 4, nombre: "Arroz para Sushi", cantidad: 100, precioUnitario: 22 },
                { productoId: 5, nombre: "Salsa de Soya", cantidad: 40, precioUnitario: 35 },
              ],
              subtotal: 5100,
              iva: 816,
              total: 5916,
              estado: "pendiente",
            },
          ]
          resolve(mockCompras)
        }, 300)
      })
    }

    const response = await api.get<Compra[]>("/compras", { params })
    return response.data
  },

  /**
   * Obtener una compra por ID
   */
  async getCompraById(id: number): Promise<Compra> {
    const response = await api.get<Compra>(`/compras/${id}`)
    return response.data
  },

  /**
   * Crear una nueva compra
   */
  async createCompra(data: {
    proveedorId: number
    items: CompraItem[]
    facturaProveedor?: string
    observaciones?: string
  }): Promise<Compra> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          const subtotal = data.items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0)
          const iva = subtotal * 0.16
          const total = subtotal + iva

          const newCompra: Compra = {
            id: Date.now(),
            folio: generateFolio("COMP"),
            fecha: new Date().toISOString(),
            proveedorId: data.proveedorId,
            proveedorNombre: "Proveedor",
            items: data.items,
            subtotal,
            iva,
            total,
            estado: "pendiente",
            facturaProveedor: data.facturaProveedor,
            observaciones: data.observaciones,
          }

          resolve(newCompra)
        }, 500)
      })
    }

    const response = await api.post<Compra>("/compras", data)
    return response.data
  },

  /**
   * Marcar compra como recibida
   */
  async marcarRecibida(id: number): Promise<void> {
    await api.post(`/compras/${id}/recibir`)
  },

  /**
   * Cancelar compra
   */
  async cancelarCompra(id: number, motivo: string): Promise<void> {
    await api.post(`/compras/${id}/cancelar`, { motivo })
  },
}
