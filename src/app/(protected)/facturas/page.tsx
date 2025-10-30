"use client"

import { useEffect, useState } from "react"
import { Download, XCircle, Eye } from "lucide-react"
import Table from "@/components/Table"
import Button from "@/components/Button"
import Modal from "@/components/Modal"
import { formatCurrency, formatDateTime } from "@/utils/helpers"

/**
 * Página de gestión de facturas CFDI
 */
export default function FacturasPage() {
  const [facturas, setFacturas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedFactura, setSelectedFactura] = useState<any>(null)

  useEffect(() => {
    // Simular carga de facturas
    setTimeout(() => {
      setFacturas([
        {
          id: 1,
          folio: "FAC-001",
          uuid: "A1B2C3D4-E5F6-G7H8-I9J0-K1L2M3N4O5P6",
          fecha: "2025-10-29T10:30:00",
          clienteNombre: "Restaurante El Buen Sabor",
          rfc: "RBS850101ABC",
          total: 1856,
          estado: "vigente",
          pdfUrl: "/facturas/1.pdf",
          xmlUrl: "/facturas/1.xml",
        },
        {
          id: 2,
          folio: "FAC-002",
          uuid: "B2C3D4E5-F6G7-H8I9-J0K1-L2M3N4O5P6Q7",
          fecha: "2025-10-29T14:20:00",
          clienteNombre: "María González",
          rfc: "GOMA850315ABC",
          total: 968.6,
          estado: "vigente",
          pdfUrl: "/facturas/2.pdf",
          xmlUrl: "/facturas/2.xml",
        },
      ])
      setIsLoading(false)
    }, 500)
  }, [])

  const handleCancelFactura = (factura: any) => {
    setSelectedFactura(factura)
    setShowCancelModal(true)
  }

  const columns = [
    { key: "folio", label: "Folio" },
    {
      key: "fecha",
      label: "Fecha",
      render: (f: any) => formatDateTime(f.fecha),
    },
    { key: "clienteNombre", label: "Cliente" },
    { key: "rfc", label: "RFC" },
    {
      key: "total",
      label: "Total",
      render: (f: any) => formatCurrency(f.total),
    },
    {
      key: "estado",
      label: "Estado",
      render: (f: any) =>
        f.estado === "vigente" ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Vigente</span>
        ) : (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Cancelada</span>
        ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (f: any) => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-700" title="Ver">
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-green-600 hover:text-green-700" title="Descargar PDF">
            <Download className="h-4 w-4" />
          </button>
          {f.estado === "vigente" && (
            <button onClick={() => handleCancelFactura(f)} className="text-red-600 hover:text-red-700" title="Cancelar">
              <XCircle className="h-4 w-4" />
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facturas CFDI</h1>
        <p className="text-gray-600 mt-1">Gestión de facturas electrónicas</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table columns={columns} data={facturas} />
      </div>

      {/* Modal de cancelación */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancelar Factura">
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas cancelar la factura <strong>{selectedFactura?.folio}</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de cancelación</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>01 - Comprobante emitido con errores con relación</option>
              <option>02 - Comprobante emitido con errores sin relación</option>
              <option>03 - No se llevó a cabo la operación</option>
              <option>04 - Operación nominativa relacionada en una factura global</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCancelModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="danger" className="flex-1">
              Confirmar Cancelación
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
