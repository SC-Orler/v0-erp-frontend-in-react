// src/services/productosService.ts
import { api } from "./api"
import axios from "axios"

export interface Producto {
  id: number
  nombre: string
  sku: string
  precio: number
  stock: number
  imagen?: string
}
const API_URL =  import.meta.env.VITE_API_UR || "http://localhost:3002/api"

export const productosService = {
  getAll: async (search?: string): Promise<Producto[]> => {
    const params = search ? { search } : {}
  //  const response = await api.get('/productos', { params })
        const response = await axios.get(API_URL +`/productos`);

    return response.data
  },

  getById: async (id: number): Promise<Producto> => {
    const response = await axios.get(API_URL +`/productos/${id}`); //await api.get(`/productos/${id}`)
    return response.data
  },
}