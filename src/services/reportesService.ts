import { api } from "./api"
import { mockVentas, mockProductos } from "@/mocks/sampleData"

interface DashboardMetrics {
  ventasHoy: number
  ventasConFactura: number
  ventasSinFactura: number
  efectivoEnCaja: number
  nominaMes: number
  productosStockBajo: number
  productosProximosVencer: number
}

/**
 * Servicio de reportes y métricas
 */
export const reportesService = {
  /**
   * Obtener métricas del dashboard
   */
  async getDashboardMetrics(start?: string, end?: string): Promise<DashboardMetrics> {
    // Modo desarrollo: calcular desde mock data
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          const hoy = new Date().toISOString().split("T")[0]
          const ventasHoy = mockVentas.filter((v) => v.fecha.startsWith(hoy))

          const ventasConFactura = ventasHoy.filter((v) => v.requiereFactura)
          const ventasSinFactura = ventasHoy.filter((v) => !v.requiereFactura)

          const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0)
          const totalConFactura = ventasConFactura.reduce((sum, v) => sum + v.total, 0)
          const totalSinFactura = ventasSinFactura.reduce((sum, v) => sum + v.total, 0)

          const productosStockBajo = mockProductos.filter((p) => p.stock <= p.stockMinimo).length

          const productosProximosVencer = mockProductos.filter((p) => {
            const dias = Math.floor(
              (new Date(p.fechaCaducidad).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
            )
            return dias <= 30 && dias >= 0
          }).length

          resolve({
            ventasHoy: totalVentasHoy,
            ventasConFactura: totalConFactura,
            ventasSinFactura: totalSinFactura,
            efectivoEnCaja: 5000,
            nominaMes: 45000,
            productosStockBajo,
            productosProximosVencer,
          })
        }, 300)
      })
    }

    // Modo producción
    const response = await api.get<DashboardMetrics>("/reportes/dashboard", {
      params: { start, end },
    })
    return response.data
  },

  /**
   * Obtener reporte de ventas
   */
  async getVentasReport(params: {
    start?: string
    end?: string
    groupBy?: "day" | "product" | "method"
  }) {
    const response = await api.get("/reportes/ventas", { params })
    return response.data
  },
}
