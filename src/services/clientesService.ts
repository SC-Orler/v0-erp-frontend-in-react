//import api from "./api"
import { api } from "./api"

export interface Cliente {
  id: string
  nombre: string
  rfc?: string
  email?: string
  telefono?: string
  direccion?: string
  ciudad?: string
  estado?: string
  codigoPostal?: string
  limiteCredito?: number
  saldoPendiente?: number
  activo: boolean
  fechaRegistro: string
  notas?: string
  // Configuración de financiamiento
  tipoFinanciamiento?: "dias" | "monto" | "unidades"
  diasCredito?: number // para "dias": 7, 14, 30, etc.
  montoCredito?: number // para "monto": en pesos
  unidadesCredito?: number // para "unidades": ej. cajas
  // Tipo de precio
  tipoPrecio?: "general" | "mayoreo" | "especial"
}

export interface ClienteFormData {
  nombre: string
  rfc?: string
  email?: string
  telefono?: string
  direccion?: string
  ciudad?: string
  estado?: string
  codigoPostal?: string
  limiteCredito?: number
  activo: boolean
  notas?: string
  // Configuración de financiamiento
  tipoFinanciamiento?: "dias" | "monto" | "unidades"
  diasCredito?: number
  montoCredito?: number
  unidadesCredito?: number
  // Tipo de precio
  tipoPrecio?: "general" | "mayoreo" | "especial"
}

export const clientesService = {
  getAll: async (): Promise<Cliente[]> => {
    const response = await api.get("/clientes")
    return response.data
  },

  getById: async (id: string): Promise<Cliente> => {
    const response = await api.get(`/clientes/${id}`)
    return response.data
  },

  create: async (data: ClienteFormData): Promise<Cliente> => {
    const response = await api.post("/clientes", data)
    return response.data
  },

  update: async (id: string, data: Partial<ClienteFormData>): Promise<Cliente> => {
    const response = await api.put(`/clientes/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clientes/${id}`)
  },

  getEstadoCuenta: async (id: string): Promise<any> => {
    const response = await api.get(`/clientes/${id}/estado-cuenta`)
    return response.data
  },
}
