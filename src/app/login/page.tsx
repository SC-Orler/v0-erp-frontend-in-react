"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Input from "@/components/Input"
import Button from "@/components/Button"
import { authService } from "@/services/authService"
import { useAuthStore } from "@/store/authStore"
import { useUIStore } from "@/store/uiStore"

/**
 * Página de Login
 */
export default function LoginPage() {
  const navigate = useNavigate() // ✅ Reemplaza useRouter
  const { login } = useAuthStore()
  const { addToast } = useUIStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await authService.login({ email, password })
      login(response.user, response.token)

      addToast({
        type: "success",
        message: `Bienvenido, ${response.user.nombre}`,
      })

      // Redirigir según rol
      if (response.user.rol === "cajero") {
        navigate("/pos") // ✅ Reemplaza router.push
      } else {
        navigate("/dashboard") // ✅ Reemplaza router.push
      }
    } catch (err) {
      setError("Credenciales inválidas. Por favor, intenta de nuevo.")
      addToast({
        type: "error",
        message: "Error al iniciar sesión",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ERP Lite</h1>
          <p className="text-gray-600">Sistema de Gestión Empresarial</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@empresa.com"
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            error={error}
          />

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2 font-semibold">Usuarios de prueba:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>Admin: admin@empresa.com / admin123</p>
            <p>Cajero: cajero@empresa.com / cajero123</p>
            <p>Contabilidad: conta@empresa.com / conta123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
