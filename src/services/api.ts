/*import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

//Instancia de Axios configurada

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem("auth-storage")
  if (authStorage) {
    const { state } = JSON.parse(authStorage)
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`
    }
  }
  return config
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("auth-storage")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)
*/
import axios from "axios"
import MockAdapter from "axios-mock-adapter"

// Usando import.meta.env en lugar de process.env
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

/**
 * Instancia de Axios configurada
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem("auth-storage")
  if (authStorage) {
    const { state } = JSON.parse(authStorage)
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`
    }
  }
  return config
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth-storage")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// MOCK: emulando respuestas por default en desarrollo
if (import.meta.env.DEV) {
  const mock = new MockAdapter(api, { delayResponse: 500 })

  mock.onGet("/users").reply(200, [
    { id: 1, name: "Juan Pérez" },
    { id: 2, name: "Ana López" },
  ])

  mock.onPost("/login").reply((config) => {
    const { email, password } = JSON.parse(config.data)
    if (email === "test@test.com" && password === "1234") {
      return [200, { token: "mocked-token", user: { name: "Test User" } }]
    }
    return [401, { message: "Credenciales inválidas" }]
  })
}
