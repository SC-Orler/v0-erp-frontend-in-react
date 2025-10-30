import { api } from "./api"
import { mockProductos } from "@/mocks/sampleData"

interface Producto {
  id: number
  nombre: string
  claveSat: string
  sku: string
  categoria: string
  unidad: string
  precio: number
  costo: number
  stock: number
  stockMinimo: number
  fechaCaducidad: string
  ubicacion: string
  imagen?: string
}

interface MovimientoInventario {
  productoId: number
  cantidad: number
  tipo: "entrada" | "salida"
  lote?: string
  fechaCaducidad?: string
  motivo?: string
}

/**
 * Servicio de inventario
 */
export const inventarioService = {
  /**
   * Obtener todos los productos
   */
  async getProductos(params?: {
    categoria?: string
    stockBajo?: boolean
    proximosVencer?: boolean
  }): Promise<Producto[]> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filtered = [...mockProductos]

          if (params?.categoria) {
            filtered = filtered.filter((p) => p.categoria === params.categoria)
          }

          if (params?.stockBajo) {
            filtered = filtered.filter((p) => p.stock <= p.stockMinimo)
          }

          if (params?.proximosVencer) {
            filtered = filtered.filter((p) => {
              const dias = Math.floor(
                (new Date(p.fechaCaducidad).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
              )
              return dias <= 30 && dias >= 0
            })
          }

          resolve(filtered)
        }, 300)
      })
    }

    const response = await api.get<Producto[]>("/productos", { params })
    return response.data
  },

  /**
   * Obtener un producto por ID
   */
  async getProductoById(id: number): Promise<Producto> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const producto = mockProductos.find((p) => p.id === id)
          if (producto) {
            resolve(producto)
          } else {
            reject(new Error("Producto no encontrado"))
          }
        }, 300)
      })
    }

    const response = await api.get<Producto>(`/productos/${id}`)
    return response.data
  },

  /**
   * Crear un nuevo producto
   */
  async createProducto(data: Omit<Producto, "id">): Promise<Producto> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newProducto = {
            id: mockProductos.length + 1,
            ...data,
          }
          mockProductos.push(newProducto)
          resolve(newProducto)
        }, 500)
      })
    }

    const response = await api.post<Producto>("/productos", data)
    return response.data
  },

  /**
   * Actualizar un producto
   */
  async updateProducto(id: number, data: Partial<Producto>): Promise<Producto> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockProductos.findIndex((p) => p.id === id)
          if (index !== -1) {
            mockProductos[index] = { ...mockProductos[index], ...data }
            resolve(mockProductos[index])
          } else {
            reject(new Error("Producto no encontrado"))
          }
        }, 500)
      })
    }

    const response = await api.put<Producto>(`/productos/${id}`, data)
    return response.data
  },

  /**
   * Eliminar un producto
   */
  async deleteProducto(id: number): Promise<void> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockProductos.findIndex((p) => p.id === id)
          if (index !== -1) {
            mockProductos.splice(index, 1)
          }
          resolve()
        }, 500)
      })
    }

    await api.delete(`/productos/${id}`)
  },

  /**
   * Registrar movimiento de inventario
   */
  async registrarMovimiento(data: MovimientoInventario): Promise<void> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          const producto = mockProductos.find((p) => p.id === data.productoId)
          if (producto) {
            if (data.tipo === "entrada") {
              producto.stock += data.cantidad
            } else {
              producto.stock -= data.cantidad
            }
          }
          resolve()
        }, 500)
      })
    }

    await api.post("/inventario/movimiento", data)
  },

  /**
   * Obtener categorías únicas
   */
  getCategorias(): string[] {
    return [...new Set(mockProductos.map((p) => p.categoria))]
  },
}
