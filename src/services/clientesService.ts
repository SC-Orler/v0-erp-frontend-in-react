//import api from "./api"
import { api } from "./api"
import axios from "axios"


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
}
const API_URL  = import.meta.env.VITE_API_URL || "http://localhost:3002/api"

export const clientesService = {
  getAll: async (): Promise<Cliente[]> => {
    const response =  await axios.get(API_URL +`/clientes`);
    return response.data
  },

  getById: async (id: string): Promise<Cliente> => {
    const response = await axios.get(API_URL +`/clientes/${id}`)
    return response.data
  },

  create: async (data: ClienteFormData): Promise<Cliente> => {
    const response = await axios.post(API_URL +"/clientes", data)
    return response.data
  },

  update: async (id: string, data: Partial<ClienteFormData>): Promise<Cliente> => {
    const response = await axios.put(API_URL +`/clientes/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(API_URL +`/clientes/${id}`)
  },

  getEstadoCuenta: async (id: string): Promise<any> => {
    const response = await axios.get(API_URL +`/clientes/${id}/estado-cuenta`)
    return response.data
  },
}
