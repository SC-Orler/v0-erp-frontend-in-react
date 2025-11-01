import type React from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "@/components/Sidebar"
import ToastContainer from "@/components/ToastContainer"
import { useAuthStore } from "@/store/authStore"

/**
 * Layout para rutas protegidas
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:ml-64">{children}</main>
      <ToastContainer />
    </div>
  )
}
