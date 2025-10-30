import { api } from "./api"
import { mockUsuarios } from "@/mocks/sampleData"

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  user: {
    id: number
    nombre: string
    email: string
    rol: string
  }
  token: string
}

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Login de usuario
   * En desarrollo usa datos mock
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Modo desarrollo: usar mock data
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = mockUsuarios.find((u) => u.email === credentials.email && u.password === credentials.password)

          if (user) {
            resolve({
              user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
              },
              token: "mock-jwt-token-" + user.id,
            })
          } else {
            reject(new Error("Credenciales inválidas"))
          }
        }, 500)
      })
    }

    // Modo producción: llamar al backend
    const response = await api.post<LoginResponse>("/auth/login", credentials)
    return response.data
  },

  /**
   * Logout de usuario
   */
  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Error en logout:", error)
    }
  },

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<LoginResponse["user"]> {
    const response = await api.get<LoginResponse["user"]>("/auth/me")
    return response.data
  },
}
