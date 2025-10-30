"use client"

import { useEffect, useState } from "react"
import { Download, Eye, Filter } from "lucide-react"
import Table from "@/components/Table"
import Button from "@/components/Button"
import Input from "@/components/Input"
import Pagination from "@/components/Pagination"
import { ventasService } from "@/services/ventasService"
import { formatCurrency, formatDateTime } from "@/utils/helpers"

/**
 * Página de gestión de ventas
 */
export default function VentasPage() {
  const [ventas, setVentas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterFactura, setFilterFactura] = useState<"all" | "con" | "sin">("all")
  const [filterMetodo, setFilterMetodo] = useState<string>("all")

  const itemsPerPage = 10

  useEffect(() => {
    loadVentas()
  }, [])

  const loadVentas = async () => {
    try {
      const data = await ventasService.getVentas()
      setVentas(data)
    } catch (error) {
      console.error("Error cargando ventas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar ventas
  const filteredVentas = ventas.filter((venta) => {
    const matchesSearch =
      venta.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venta.clienteNombre.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFactura =
      filterFactura === "all" ||
      (filterFactura === "con" && venta.requiereFactura) ||
      (filterFactura === "sin" && !venta.requiereFactura)

    const matchesMetodo = filterMetodo === "all" || venta.metodoPago === filterMetodo

    return matchesSearch && matchesFactura && matchesMetodo
  })

  // Paginación
  const totalPages = Math.ceil(filteredVentas.length / itemsPerPage)
  const paginatedVentas = filteredVentas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const columns = [
    { key: "folio", label: "Folio" },
    {
      key: "fecha",
      label: "Fecha",
      render: (venta: any) => formatDateTime(venta.fecha),
    },
    { key: "clienteNombre", label: "Cliente" },
    {
      key: "total",
      label: "Total",
      render: (venta: any) => formatCurrency(venta.total),
    },
    {
      key: "metodoPago",
      label: "Método",
      render: (venta: any) => <span className="capitalize">{venta.metodoPago}</span>,
    },
    {
      key: "requiereFactura",
      label: "Factura",
      render: (venta: any) =>
        venta.requiereFactura ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Con factura</span>
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Sin factura</span>
        ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (venta: any) => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-700">
            <Eye className="h-4 w-4" />
          </button>
          {venta.requiereFactura && (
            <button className="text-green-600 hover:text-green-700">
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-600 mt-1">Gestión de ventas y tickets</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por folio o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={filterFactura}
            onChange={(e) => setFilterFactura(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las ventas</option>
            <option value="con">Con factura</option>
            <option value="sin">Sin factura</option>
          </select>

          <select
            value={filterMetodo}
            onChange={(e) => setFilterMetodo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los métodos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="credito">Crédito</option>
          </select>

          <Button variant="secondary">
            <Filter className="h-4 w-4 mr-2" />
            Más filtros
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow">
        <Table columns={columns} data={paginatedVentas} />
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  )
}
