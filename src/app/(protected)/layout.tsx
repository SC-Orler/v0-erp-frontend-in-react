"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

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
