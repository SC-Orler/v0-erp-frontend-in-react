"use client"

import { useEffect, useState } from "react"
import { Plus, Calculator, DollarSign, FileText, Eye } from "lucide-react"
import Button from "@/components/Button"
import Table from "@/components/Table"
import Modal from "@/components/Modal"
import Alert from "@/components/Alert"
import { nominaService, type Nomina } from "@/services/nominaService"
import { useUIStore } from "@/store/uiStore"
import { formatCurrency, formatDate } from "@/utils/helpers"
import { useNavigate } from "react-router-dom"

export default function NominaPage() {
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const [nominas, setNominas] = useState<Nomina[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCalcularAlert, setShowCalcularAlert] = useState(false)
  const [showPagarAlert, setShowPagarAlert] = useState(false)
  const [selectedNomina, setSelectedNomina] = useState<Nomina | null>(null)

  useEffect(() => {
    loadNominas()
  }, [])

  const loadNominas = async () => {
    try {
      const data = await nominaService.getNominas()
      setNominas(data)
    } catch (error) {
      addToast({ type: "error", message: "Error al cargar nóminas" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalcular = async () => {
    if (!selectedNomina) return

    try {
      await nominaService.calcularNomina(selectedNomina.id)
      addToast({ type: "success", message: "Nómina calculada correctamente" })
      setShowCalcularAlert(false)
      setSelectedNomina(null)
      loadNominas()
    } catch (error) {
      addToast({ type: "error", message: "Error al calcular nómina" })
    }
  }

  const handlePagar = async () => {
    if (!selectedNomina) return

    try {
      await nominaService.pagarNomina(selectedNomina.id)
      addToast({ type: "success", message: "Nómina pagada correctamente" })
      setShowPagarAlert(false)
      setSelectedNomina(null)
      loadNominas()
    } catch (error) {
      addToast({ type: "error", message: "Error al pagar nómina" })
    }
  }

  const handleTimbrar = async (nomina: Nomina) => {
    try {
      await nominaService.timbrarNomina(nomina.id)
      addToast({ type: "success", message: "Nómina timbrada correctamente" })
      loadNominas()
    } catch (error) {
      addToast({ type: "error", message: "Error al timbrar nómina" })
    }
  }

  const getEstatusBadge = (estatus: string) => {
    const colors = {
      borrador: "bg-gray-100 text-gray-800",
      calculada: "bg-blue-100 text-blue-800",
      pagada: "bg-green-100 text-green-800",
      timbrada: "bg-purple-100 text-purple-800",
    }
    return colors[estatus as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const columns = [
    { key: "periodo", label: "Período" },
    {
      key: "fechaInicio",
      label: "Fecha Inicio",
      render: (value: string) => formatDate(value),
    },
    {
      key: "fechaFin",
      label: "Fecha Fin",
      render: (value: string) => formatDate(value),
    },
    {
      key: "fechaPago",
      label: "Fecha Pago",
      render: (value: string) => formatDate(value),
    },
    {
      key: "totalNeto",
      label: "Total Neto",
      render: (value: number) => formatCurrency(value),
    },
    {
      key: "estatus",
      label: "Estatus",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getEstatusBadge(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_: any, row: Nomina) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedNomina(row)
              setShowDetailModal(true)
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Ver detalle"
          >
            <Eye size={16} />
          </button>
          {row.estatus === "borrador" && (
            <button
              onClick={() => {
                setSelectedNomina(row)
                setShowCalcularAlert(true)
              }}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Calcular"
            >
              <Calculator size={16} />
            </button>
          )}
          {row.estatus === "calculada" && (
            <button
              onClick={() => {
                setSelectedNomina(row)
                setShowPagarAlert(true)
              }}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Pagar"
            >
              <DollarSign size={16} />
            </button>
          )}
          {row.estatus === "pagada" && (
            <button
              onClick={() => handleTimbrar(row)}
              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
              title="Timbrar"
            >
              <FileText size={16} />
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Nómina</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/nomina/empleados")} variant="secondary">
            Gestionar Empleados
          </Button>
          <Button onClick={() => navigate("/nomina/nueva")} icon={Plus}>
            Nueva Nómina
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <Table columns={columns} data={nominas} />
      </div>

      {/* Modal de detalle */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Nómina ${selectedNomina?.periodo}`}
        size="large"
      >
        {selectedNomina && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Período:</span>
                <p className="font-semibold">{selectedNomina.periodo}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Fecha de Pago:</span>
                <p className="font-semibold">{formatDate(selectedNomina.fechaPago)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Percepciones:</span>
                <p className="font-semibold text-green-600">{formatCurrency(selectedNomina.totalPercepciones)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Deducciones:</span>
                <p className="font-semibold text-red-600">{formatCurrency(selectedNomina.totalDeducciones)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600">Total Neto:</span>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedNomina.totalNeto)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Empleados ({selectedNomina.empleados.length})</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedNomina.empleados.map((emp) => (
                  <div key={emp.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{emp.empleadoNombre}</span>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(emp.neto)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Días:</span>
                        <span className="ml-1 font-medium">{emp.diasTrabajados}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Percepciones:</span>
                        <span className="ml-1 font-medium text-green-600">{formatCurrency(emp.totalPercepciones)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Deducciones:</span>
                        <span className="ml-1 font-medium text-red-600">{formatCurrency(emp.totalDeducciones)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Alert de calcular */}
      <Alert
        isOpen={showCalcularAlert}
        onClose={() => setShowCalcularAlert(false)}
        onConfirm={handleCalcular}
        title="Calcular Nómina"
        message={`¿Estás seguro de que deseas calcular la nómina "${selectedNomina?.periodo}"?`}
        type="warning"
      />

      {/* Alert de pagar */}
      <Alert
        isOpen={showPagarAlert}
        onClose={() => setShowPagarAlert(false)}
        onConfirm={handlePagar}
        title="Pagar Nómina"
        message={`¿Estás seguro de que deseas marcar como pagada la nómina "${selectedNomina?.periodo}"?`}
        type="warning"
      />
    </div>
  )
}
