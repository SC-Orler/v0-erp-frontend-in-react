import { api } from "./api"
import { mockProveedores } from "@/mocks/sampleData"

interface Proveedor {
  id: number
  nombre: string
  rfc: string
  email: string
  telefono: string
  direccion: string
  contacto: string
}

/**
 * Servicio de proveedores
 */
export const proveedoresService = {
  /**
   * Obtener todos los proveedores
   */
  async getProveedores(): Promise<Proveedor[]> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([...mockProveedores])
        }, 300)
      })
    }

    const response = await api.get<Proveedor[]>("/proveedores")
    return response.data
  },

  /**
   * Obtener un proveedor por ID
   */
  async getProveedorById(id: number): Promise<Proveedor> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const proveedor = mockProveedores.find((p) => p.id === id)
          if (proveedor) {
            resolve(proveedor)
          } else {
            reject(new Error("Proveedor no encontrado"))
          }
        }, 300)
      })
    }

    const response = await api.get<Proveedor>(`/proveedores/${id}`)
    return response.data
  },

  /**
   * Crear un nuevo proveedor
   */
  async createProveedor(data: Omit<Proveedor, "id">): Promise<Proveedor> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newProveedor = {
            id: mockProveedores.length + 1,
            ...data,
          }
          mockProveedores.push(newProveedor)
          resolve(newProveedor)
        }, 500)
      })
    }

    const response = await api.post<Proveedor>("/proveedores", data)
    return response.data
  },

  /**
   * Actualizar un proveedor
   */
  async updateProveedor(id: number, data: Partial<Proveedor>): Promise<Proveedor> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockProveedores.findIndex((p) => p.id === id)
          if (index !== -1) {
            mockProveedores[index] = { ...mockProveedores[index], ...data }
            resolve(mockProveedores[index])
          } else {
            reject(new Error("Proveedor no encontrado"))
          }
        }, 500)
      })
    }

    const response = await api.put<Proveedor>(`/proveedores/${id}`, data)
    return response.data
  },

  /**
   * Eliminar un proveedor
   */
  async deleteProveedor(id: number): Promise<void> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockProveedores.findIndex((p) => p.id === id)
          if (index !== -1) {
            mockProveedores.splice(index, 1)
          }
          resolve()
        }, 500)
      })
    }

    await api.delete(`/proveedores/${id}`)
  },
}
