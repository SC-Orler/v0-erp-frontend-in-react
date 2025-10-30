"use client"

import { useState } from "react"
import { FileText, Download, TrendingUp, DollarSign } from "lucide-react"
import Button from "@/components/Button"
import Input from "@/components/Input"
import { reportesService } from "@/services/reportesService"
import { useUIStore } from "@/store/uiStore"

export default function ReportesPage() {
  const { addToast } = useUIStore()
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split("T")[0])
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateReport = async (tipo: string) => {
    setIsLoading(true)
    try {
      let data
      switch (tipo) {
        case "ventas":
          data = await reportesService.getReporteVentas(fechaInicio, fechaFin)
          break
        case "inventario":
          data = await reportesService.getReporteInventario()
          break
        case "compras":
          data = await reportesService.getReporteCompras(fechaInicio, fechaFin)
          break
        case "caja":
          data = await reportesService.getReporteCaja(fechaInicio, fechaFin)
          break
        default:
          throw new Error("Tipo de reporte no válido")
      }

      // Aquí podrías generar un PDF o Excel con los datos
      addToast({ type: "success", message: "Reporte generado correctamente" })
      console.log("Datos del reporte:", data)
    } catch (error) {
      addToast({ type: "error", message: "Error al generar reporte" })
    } finally {
      setIsLoading(false)
    }
  }

  const reportCards = [
    {
      title: "Reporte de Ventas",
      description: "Ventas por período, cliente, producto y método de pago",
      icon: DollarSign,
      color: "green",
      tipo: "ventas",
    },
    {
      title: "Reporte de Inventario",
      description: "Stock actual, movimientos y productos por vencer",
      icon: FileText,
      color: "blue",
      tipo: "inventario",
    },
    {
      title: "Reporte de Compras",
      description: "Compras por período, proveedor y producto",
      icon: TrendingUp,
      color: "purple",
      tipo: "compras",
    },
    {
      title: "Reporte de Caja",
      description: "Cortes de caja, ingresos y egresos por período",
      icon: FileText,
      color: "yellow",
      tipo: "caja",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600 mt-1">Genera reportes detallados de tu negocio</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Fecha</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha Inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
          <Input label="Fecha Fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((report) => {
          const Icon = report.icon
          const colorClasses = {
            green: "bg-green-100 text-green-600",
            blue: "bg-blue-100 text-blue-600",
            purple: "bg-purple-100 text-purple-600",
            yellow: "bg-yellow-100 text-yellow-600",
          }

          return (
            <div key={report.tipo} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${colorClasses[report.color as keyof typeof colorClasses]}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  <Button
                    onClick={() => handleGenerateReport(report.tipo)}
                    icon={Download}
                    size="sm"
                    isLoading={isLoading}
                  >
                    Generar Reporte
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reportes Contables</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Balanza de Comprobación</h3>
            <p className="text-sm text-gray-600 mb-3">Saldos de todas las cuentas contables</p>
            <Button size="sm" icon={Download}>
              Generar
            </Button>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Estado de Resultados</h3>
            <p className="text-sm text-gray-600 mb-3">Ingresos, gastos y utilidad del período</p>
            <Button size="sm" icon={Download}>
              Generar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
