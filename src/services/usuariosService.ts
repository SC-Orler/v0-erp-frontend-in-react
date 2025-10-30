import api from "./api"

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: "admin" | "cajero" | "contabilidad" | "almacen"
  activo: boolean
  fechaCreacion: string
  ultimoAcceso?: string
}

export interface UsuarioFormData {
  nombre: string
  email: string
  password?: string
  rol: "admin" | "cajero" | "contabilidad" | "almacen"
  activo: boolean
}

export const usuariosService = {
  getAll: async (): Promise<Usuario[]> => {
    const response = await api.get("/usuarios")
    return response.data
  },

  getById: async (id: string): Promise<Usuario> => {
    const response = await api.get(`/usuarios/${id}`)
    return response.data
  },

  create: async (data: UsuarioFormData): Promise<Usuario> => {
    const response = await api.post("/usuarios", data)
    return response.data
  },

  update: async (id: string, data: Partial<UsuarioFormData>): Promise<Usuario> => {
    const response = await api.put(`/usuarios/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/usuarios/${id}`)
  },

  changePassword: async (id: string, oldPassword: string, newPassword: string): Promise<void> => {
    await api.post(`/usuarios/${id}/cambiar-password`, { oldPassword, newPassword })
  },
}
