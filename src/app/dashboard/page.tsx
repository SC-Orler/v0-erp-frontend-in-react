"use client"

import { useEffect, useState } from "react"
import { DollarSign, FileText, ShoppingCart, Wallet, AlertTriangle, Package, Calendar } from "lucide-react"
import MetricCard from "@/components/MetricCard"
import { reportesService } from "@/services/reportesService"
import { useAuthStore } from "@/store/authStore"

/**
 * Dashboard principal con KPIs y métricas
 */
export default function DashboardPage() {
  const { user } = useAuthStore()
  const [metrics, setMetrics] = useState({
    ventasHoy: 0,
    ventasConFactura: 0,
    ventasSinFactura: 0,
    efectivoEnCaja: 0,
    nominaMes: 0,
    productosStockBajo: 0,
    productosProximosVencer: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const data = await reportesService.getDashboardMetrics()
      setMetrics(data)
    } catch (error) {
      console.error("Error cargando métricas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bienvenido, {user?.nombre}</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Ventas Hoy" value={metrics.ventasHoy} icon={DollarSign} color="green" isCurrency />
        <MetricCard
          title="Ventas con Factura"
          value={metrics.ventasConFactura}
          icon={FileText}
          color="blue"
          isCurrency
        />
        <MetricCard
          title="Ventas sin Factura"
          value={metrics.ventasSinFactura}
          icon={ShoppingCart}
          color="purple"
          isCurrency
        />
        <MetricCard title="Efectivo en Caja" value={metrics.efectivoEnCaja} icon={Wallet} color="yellow" isCurrency />
      </div>

      {/* Alertas y métricas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Productos Stock Bajo" value={metrics.productosStockBajo} icon={Package} color="red" />
        <MetricCard
          title="Próximos a Vencer"
          value={metrics.productosProximosVencer}
          icon={AlertTriangle}
          color="yellow"
        />
        <MetricCard title="Nómina del Mes" value={metrics.nominaMes} icon={Calendar} color="blue" isCurrency />
      </div>

      {/* Gráficas y reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas recientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ventas Recientes</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Venta #1234</p>
                <p className="text-xs text-gray-600">Hace 5 minutos</p>
              </div>
              <p className="text-sm font-semibold text-green-600">$1,856.00</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Venta #1233</p>
                <p className="text-xs text-gray-600">Hace 15 minutos</p>
              </div>
              <p className="text-sm font-semibold text-green-600">$353.80</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Venta #1232</p>
                <p className="text-xs text-gray-600">Hace 30 minutos</p>
              </div>
              <p className="text-sm font-semibold text-green-600">$968.60</p>
            </div>
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Camarón Fresco</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 ml-4">85%</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Atún Fresco</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "72%" }} />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 ml-4">72%</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Arroz para Sushi</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "68%" }} />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 ml-4">68%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
