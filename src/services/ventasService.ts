import axios from "axios"
import { api } from "./api"
import { mockVentas, mockProductos, mockClientes } from "@/mocks/sampleData"
import { generateFolio } from "@/utils/helpers"
const API_URL  = import.meta.env.VITE_API_URL || "http://localhost:3002/api"
interface VentaItem {
  productoId: number
  nombre: string
  cantidad: number
  precio: number
}

interface CreateVentaData {
  items: VentaItem[]
  clienteId?: number
  metodoPago: "efectivo" | "tarjeta" | "transferencia" | "credito"
  requiereFactura: boolean
  cajaId?: number
}

interface Venta {
  id: number
  folio: string
  fecha: string
  clienteId: number | null
  clienteNombre: string
  items: VentaItem[]
  subtotal: number
  iva: number
  total: number
  metodoPago: string
  requiereFactura: boolean
  facturaId: number | null
  usuarioId: number
  cajaId: number | null
}

/**
 * Servicio de ventas
 */
export const ventasService = {
  /**
   * Obtener todas las ventas con filtros
   */
  async getVentas(params?: {
    start?: string
    end?: string
    withInvoice?: boolean
    metodoPago?: string
    clienteId?: number
  }): Promise<Venta[]> {
    // Modo desarrollo
    /*if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filtered = [...mockVentas]

          if (params?.withInvoice !== undefined) {
            filtered = filtered.filter((v) => v.requiereFactura === params.withInvoice)
          }

          if (params?.metodoPago) {
            filtered = filtered.filter((v) => v.metodoPago === params.metodoPago)
          }

          if (params?.clienteId) {
            filtered = filtered.filter((v) => v.clienteId === params.clienteId)
          }

          resolve(filtered)
        }, 300)
      })
    }*/

    const response =await axios.get(API_URL +"/ventas") ;// await api.get<Venta[]>("/ventas", { params })
    return response.data
  },

  /**
   * Obtener una venta por ID
   */
  async getVentaById(id: number): Promise<Venta> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const venta = mockVentas.find((v) => v.id === id)
          if (venta) {
            resolve(venta)
          } else {
            reject(new Error("Venta no encontrada"))
          }
        }, 300)
      })
    }

    const response = await api.get<Venta>(`/ventas/${id}`)
    return response.data
  },

  /**
   * Crear una nueva venta
   */
  async createVenta(data: CreateVentaData): Promise<Venta> {
    // Modo desarrollo
    /*if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          const subtotal = data.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
          const iva = subtotal * 0.16
          const total = subtotal + iva

          const cliente = data.clienteId ? mockClientes.find((c) => c.id === data.clienteId) : null

          const newVenta: Venta = {
            id: mockVentas.length + 1,
            folio: generateFolio("V"),
            fecha: new Date().toISOString(),
            clienteId: data.clienteId || null,
            clienteNombre: cliente?.nombre || "Público General",
            items: data.items,
            subtotal,
            iva,
            total,
            metodoPago: data.metodoPago,
            requiereFactura: data.requiereFactura,
            facturaId: data.requiereFactura ? mockVentas.length + 1 : null,
            usuarioId: 1,
            cajaId: data.cajaId || null,
          }

          mockVentas.push(newVenta)
          resolve(newVenta)
        }, 500)
      })
    }*/

    const response = await axios.post(API_URL +"/ventas", data) ;// await api.post<Venta>("/ventas", data)
    return response.data
  },

  /**
   * Buscar productos para el POS
   */
  async searchProductos(query: string) {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          const filtered = mockProductos.filter(
            (p) =>
              p.nombre.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()),
          )
          resolve(filtered)
        }, 200)
      })
    }

    const response = await api.get("/productos/search", { params: { q: query } })
    return response.data
  },
}
