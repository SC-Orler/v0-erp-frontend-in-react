"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Plus, CheckCircle, XCircle, Eye } from "lucide-react"
import Button from "@/components/Button"
import Input from "@/components/Input"
import Table from "@/components/Table"
import Modal from "@/components/Modal"
import Alert from "@/components/Alert"
import {
  contabilidadService,
  type Poliza,
  type PolizaFormData,
  type CuentaContable,
} from "@/services/contabilidadService"
import { useUIStore } from "@/store/uiStore"
import { formatCurrency, formatDate } from "@/utils/helpers"

export default function ContabilidadPage() {
  const { addToast } = useUIStore()
  const [polizas, setPolizas] = useState<Poliza[]>([])
  const [cuentas, setCuentas] = useState<CuentaContable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAplicarAlert, setShowAplicarAlert] = useState(false)
  const [selectedPoliza, setSelectedPoliza] = useState<Poliza | null>(null)
  const [formData, setFormData] = useState<PolizaFormData>({
    fecha: new Date().toISOString().split("T")[0],
    tipo: "diario",
    concepto: "",
    movimientos: [
      { cuentaContable: "", nombreCuenta: "", debe: 0, haber: 0, referencia: "" },
      { cuentaContable: "", nombreCuenta: "", debe: 0, haber: 0, referencia: "" },
    ],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [polizasData, cuentasData] = await Promise.all([
        contabilidadService.getPolizas(),
        contabilidadService.getCuentasContables(),
      ])
      setPolizas(polizasData)
      setCuentas(cuentasData)
    } catch (error) {
      addToast({ type: "error", message: "Error al cargar datos" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = () => {
    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      tipo: "diario",
      concepto: "",
      movimientos: [
        { cuentaContable: "", nombreCuenta: "", debe: 0, haber: 0, referencia: "" },
        { cuentaContable: "", nombreCuenta: "", debe: 0, haber: 0, referencia: "" },
      ],
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleAddMovimiento = () => {
    setFormData({
      ...formData,
      movimientos: [
        ...formData.movimientos,
        { cuentaContable: "", nombreCuenta: "", debe: 0, haber: 0, referencia: "" },
      ],
    })
  }

  const handleRemoveMovimiento = (index: number) => {
    if (formData.movimientos.length <= 2) {
      addToast({ type: "error", message: "Debe haber al menos 2 movimientos" })
      return
    }
    const newMovimientos = formData.movimientos.filter((_, i) => i !== index)
    setFormData({ ...formData, movimientos: newMovimientos })
  }

  const handleMovimientoChange = (index: number, field: string, value: any) => {
    const newMovimientos = [...formData.movimientos]
    newMovimientos[index] = { ...newMovimientos[index], [field]: value }

    // Si cambia la cuenta, actualizar el nombre
    if (field === "cuentaContable") {
      const cuenta = cuentas.find((c) => c.codigo === value)
      if (cuenta) {
        newMovimientos[index].nombreCuenta = cuenta.nombre
      }
    }

    setFormData({ ...formData, movimientos: newMovimientos })
  }

  const calculateTotals = () => {
    const totalDebe = formData.movimientos.reduce((sum, mov) => sum + (Number(mov.debe) || 0), 0)
    const totalHaber = formData.movimientos.reduce((sum, mov) => sum + (Number(mov.haber) || 0), 0)
    return { totalDebe, totalHaber, diferencia: totalDebe - totalHaber }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { totalDebe, totalHaber, diferencia } = calculateTotals()

    if (Math.abs(diferencia) > 0.01) {
      addToast({ type: "error", message: "La póliza no está cuadrada. Debe = Haber" })
      return
    }

    try {
      await contabilidadService.createPoliza(formData)
      addToast({ type: "success", message: "Póliza creada correctamente" })
      handleCloseModal()
      loadData()
    } catch (error) {
      addToast({ type: "error", message: "Error al crear póliza" })
    }
  }

  const handleAplicarPoliza = async () => {
    if (!selectedPoliza) return

    try {
      await contabilidadService.aplicarPoliza(selectedPoliza.id)
      addToast({ type: "success", message: "Póliza aplicada correctamente" })
      setShowAplicarAlert(false)
      setSelectedPoliza(null)
      loadData()
    } catch (error) {
      addToast({ type: "error", message: "Error al aplicar póliza" })
    }
  }

  const getEstatusBadge = (estatus: string) => {
    const colors = {
      borrador: "bg-gray-100 text-gray-800",
      aplicada: "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
    }
    return colors[estatus as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getTipoBadge = (tipo: string) => {
    const colors = {
      ingreso: "bg-green-100 text-green-800",
      egreso: "bg-red-100 text-red-800",
      diario: "bg-blue-100 text-blue-800",
    }
    return colors[tipo as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const columns = [
    { key: "numero", label: "Número" },
    {
      key: "fecha",
      label: "Fecha",
      render: (value: string) => formatDate(value),
    },
    {
      key: "tipo",
      label: "Tipo",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getTipoBadge(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    { key: "concepto", label: "Concepto" },
    {
      key: "total",
      label: "Total",
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
      render: (_: any, row: Poliza) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedPoliza(row)
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
                setSelectedPoliza(row)
                setShowAplicarAlert(true)
              }}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Aplicar"
            >
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      ),
    },
  ]

  const totals = calculateTotals()

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
        <h1 className="text-3xl font-bold text-gray-900">Contabilidad - Pólizas</h1>
        <Button onClick={handleOpenModal} icon={Plus}>
          Nueva Póliza
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <Table columns={columns} data={polizas} />
      </div>

      {/* Modal de nueva póliza */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title="Nueva Póliza" size="large">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Fecha *"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="diario">Diario</option>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
            </div>
            <Input
              label="Concepto *"
              value={formData.concepto}
              onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
              required
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Movimientos</h3>
              <Button type="button" size="sm" onClick={handleAddMovimiento}>
                Agregar Movimiento
              </Button>
            </div>

            <div className="space-y-3">
              {formData.movimientos.map((mov, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cuenta Contable</label>
                    <select
                      value={mov.cuentaContable}
                      onChange={(e) => handleMovimientoChange(index, "cuentaContable", e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {cuentas.map((cuenta) => (
                        <option key={cuenta.id} value={cuenta.codigo}>
                          {cuenta.codigo} - {cuenta.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Debe</label>
                    <input
                      type="number"
                      step="0.01"
                      value={mov.debe}
                      onChange={(e) => handleMovimientoChange(index, "debe", e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Haber</label>
                    <input
                      type="number"
                      step="0.01"
                      value={mov.haber}
                      onChange={(e) => handleMovimientoChange(index, "haber", e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Referencia</label>
                    <input
                      type="text"
                      value={mov.referencia}
                      onChange={(e) => handleMovimientoChange(index, "referencia", e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveMovimiento(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Debe:</span>
                  <span className="ml-2 font-semibold">{formatCurrency(totals.totalDebe)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Haber:</span>
                  <span className="ml-2 font-semibold">{formatCurrency(totals.totalHaber)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Diferencia:</span>
                  <span
                    className={`ml-2 font-semibold ${Math.abs(totals.diferencia) > 0.01 ? "text-red-600" : "text-green-600"}`}
                  >
                    {formatCurrency(totals.diferencia)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={Math.abs(totals.diferencia) > 0.01}>
              Crear Póliza
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de detalle */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Póliza ${selectedPoliza?.numero}`}
        size="large"
      >
        {selectedPoliza && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Fecha:</span>
                <p className="font-semibold">{formatDate(selectedPoliza.fecha)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Tipo:</span>
                <p className="font-semibold">{selectedPoliza.tipo}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600">Concepto:</span>
                <p className="font-semibold">{selectedPoliza.concepto}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Movimientos</h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Cuenta</th>
                    <th className="px-3 py-2 text-right">Debe</th>
                    <th className="px-3 py-2 text-right">Haber</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPoliza.movimientos.map((mov) => (
                    <tr key={mov.id} className="border-t">
                      <td className="px-3 py-2">
                        {mov.cuentaContable} - {mov.nombreCuenta}
                      </td>
                      <td className="px-3 py-2 text-right">{formatCurrency(mov.debe)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(mov.haber)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(selectedPoliza.total)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(selectedPoliza.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Alert de aplicar póliza */}
      <Alert
        isOpen={showAplicarAlert}
        onClose={() => setShowAplicarAlert(false)}
        onConfirm={handleAplicarPoliza}
        title="Aplicar Póliza"
        message={`¿Estás seguro de que deseas aplicar la póliza "${selectedPoliza?.numero}"? Esta acción no se puede deshacer.`}
        type="warning"
      />
    </div>
  )
}
