"use client"

import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  UserCog,
  BarChart3,
  Wallet,
  BookOpen,
  ShoppingBag,
  Building2,
  Menu,
  X,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useUIStore } from "@/store/uiStore"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ["admin", "cajero", "contabilidad"] },
  { icon: ShoppingCart, label: "Punto de Venta", href: "/pos", roles: ["admin", "cajero"] },
  { icon: TrendingUp, label: "Ventas", href: "/ventas", roles: ["admin", "cajero", "contabilidad"] },
  { icon: FileText, label: "Facturas", href: "/facturas", roles: ["admin", "contabilidad"] },
  { icon: Wallet, label: "Caja", href: "/caja", roles: ["admin", "cajero"] },
  { icon: Package, label: "Inventario", href: "/inventario", roles: ["admin", "cajero"] },
  { icon: ShoppingBag, label: "Compras", href: "/compras", roles: ["admin", "contabilidad"] },
  { icon: Building2, label: "Proveedores", href: "/proveedores", roles: ["admin", "contabilidad"] },
  { icon: Users, label: "Clientes", href: "/clientes", roles: ["admin", "cajero"] },
  { icon: UserCog, label: "Usuarios", href: "/usuarios", roles: ["admin"] },
  { icon: BarChart3, label: "Reportes", href: "/reportes", roles: ["admin", "contabilidad"] },
  { icon: DollarSign, label: "Nómina", href: "/nomina", roles: ["admin", "contabilidad"] },
  { icon: BookOpen, label: "Contabilidad", href: "/contabilidad", roles: ["admin", "contabilidad"] },
]

/**
 * Sidebar de navegación con control de acceso por rol
 */
export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  // Filtrar items según rol del usuario
  const filteredItems = menuItems.filter((item) => (user ? item.roles.includes(user.rol) : false))

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-gray-900 text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h1 className="text-xl font-bold">ERP Lite</h1>
            <button onClick={toggleSidebar} className="lg:hidden">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {user?.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{user?.nombre}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.rol}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => {
                useAuthStore.getState().logout()
                window.location.href = "/login"
              }}
              className="w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-30 lg:hidden bg-gray-900 text-white p-2 rounded-lg"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  )
}
