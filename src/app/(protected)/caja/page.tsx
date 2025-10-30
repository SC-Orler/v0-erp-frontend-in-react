"use client"

import { useEffect, useState } from "react"
import { DollarSign, XCircle, Eye, Plus } from "lucide-react"
import Button from "@/components/Button"
import Modal from "@/components/Modal"
import Input from "@/components/Input"
import Table from "@/components/Table"
import { cajaService } from "@/services/cajaService"
import { useAuthStore } from "@/store/authStore"
import { useUIStore } from "@/store/uiStore"
import { formatCurrency, formatDateTime } from "@/utils/helpers"

/**
 * Página de gestión de caja (cortes de caja)
 */
export default function CajaPage() {
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const [cajaAbierta, setCajaAbierta] = useState<any>(null)
  const [cajas, setCajas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAperturaModal, setShowAperturaModal] = useState(false)
  const [showCierreModal, setShowCierreModal] = useState(false)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [selectedCaja, setSelectedCaja] = useState<any>(null)
  const [ventasCaja, setVentasCaja] = useState<any[]>([])

  // Form state
  const [montoInicial, setMontoInicial] = useState(1000)
  const [montoContado, setMontoContado] = useState(0)
  const [observaciones, setObservaciones] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      if (user) {
        const cajaActual = await cajaService.getCajaAbierta(user.id)
        setCajaAbierta(cajaActual)

        const todasCajas = await cajaService.getCajas({ usuarioId: user.id })
        setCajas(todasCajas)
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAbrirCaja = async () => {
    if (!user) return

    try {
      const nuevaCaja = await cajaService.abrirCaja({
        usuarioId: user.id,
        montoInicial,
      })

      setCajaAbierta(nuevaCaja)
      setShowAperturaModal(false)
      addToast({ type: "success", message: "Caja abierta exitosamente" })
      loadData()
    } catch (error: any) {
      addToast({ type: "error", message: error.message || "Error al abrir caja" })
    }
  }

  const handleCerrarCaja = async () => {
    if (!cajaAbierta) return

    try {
      await cajaService.cerrarCaja({
        cajaId: cajaAbierta.id,
        montoContado,
        observaciones,
      })

      setCajaAbierta(null)
      setShowCierreModal(false)
      setMontoContado(0)
      setObservaciones("")
      addToast({ type: "success", message: "Caja cerrada exitosamente" })
      loadData()
    } catch (error: any) {
      addToast({ type: "error", message: error.message || "Error al cerrar caja" })
    }
  }

  const handleVerDetalle = async (caja: any) => {
    setSelectedCaja(caja)
    try {
      const ventas = await cajaService.getVentasCaja(caja.id)
      setVentasCaja(ventas)
      setShowDetalleModal(true)
    } catch (error) {
      addToast({ type: "error", message: "Error al cargar detalle" })
    }
  }

  const columns = [
    { key: "folio", label: "Folio" },
    {
      key: "fechaApertura",
      label: "Apertura",
      render: (c: any) => formatDateTime(c.fechaApertura),
    },
    {
      key: "fechaCierre",
      label: "Cierre",
      render: (c: any) => (c.fechaCierre ? formatDateTime(c.fechaCierre) : "-"),
    },
    {
      key: "montoInicial",
      label: "Monto Inicial",
      render: (c: any) => formatCurrency(c.montoInicial),
    },
    {
      key: "montoFinal",
      label: "Monto Final",
      render: (c: any) => (c.montoFinal ? formatCurrency(c.montoFinal) : "-"),
    },
    {
      key: "diferencia",
      label: "Diferencia",
      render: (c: any) =>
        c.diferencia !== null ? (
          <span className={c.diferencia === 0 ? "text-green-600" : "text-red-600 font-semibold"}>
            {formatCurrency(c.diferencia)}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (c: any) =>
        c.estado === "abierta" ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Abierta</span>
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Cerrada</span>
        ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (c: any) => (
        <button onClick={() => handleVerDetalle(c)} className="text-blue-600 hover:text-blue-700">
          <Eye className="h-4 w-4" />
        </button>
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
          <h1 className="text-3xl font-bold text-gray-900">Caja</h1>
          <p className="text-gray-600 mt-1">Gestión de cortes de caja</p>
        </div>
      </div>

      {/* Estado de caja actual */}
      {cajaAbierta ? (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-green-600 text-white p-3 rounded-full">
                <DollarSign className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-900">Caja Abierta</h2>
                <p className="text-green-700">Folio: {cajaAbierta.folio}</p>
                <p className="text-sm text-green-600">Apertura: {formatDateTime(cajaAbierta.fechaApertura)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-700 mb-1">Monto Inicial</p>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(cajaAbierta.montoInicial)}</p>
              <Button variant="danger" onClick={() => setShowCierreModal(true)} className="mt-4">
                Cerrar Caja
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 text-white p-3 rounded-full">
                <XCircle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-900">No hay caja abierta</h2>
                <p className="text-blue-700">Abre una caja para comenzar a registrar ventas</p>
              </div>
            </div>
            <Button onClick={() => setShowAperturaModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Abrir Caja
            </Button>
          </div>
        </div>
      )}

      {/* Historial de cajas */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historial de Cortes</h2>
        </div>
        <Table columns={columns} data={cajas} />
      </div>

      {/* Modal de apertura */}
      <Modal isOpen={showAperturaModal} onClose={() => setShowAperturaModal(false)} title="Abrir Caja">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              Registra el monto inicial en efectivo con el que comenzarás tu turno. Este monto se usará para calcular la
              diferencia al cierre.
            </p>
          </div>

          <Input
            label="Monto Inicial en Efectivo"
            type="number"
            value={montoInicial}
            onChange={(e) => setMontoInicial(Number(e.target.value))}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAperturaModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleAbrirCaja} className="flex-1">
              Abrir Caja
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de cierre */}
      <Modal isOpen={showCierreModal} onClose={() => setShowCierreModal(false)} title="Cerrar Caja" size="lg">
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium mb-2">Importante:</p>
            <p className="text-sm text-yellow-700">
              Cuenta el efectivo físico en caja y registra el monto exacto. El sistema calculará automáticamente la
              diferencia.
            </p>
          </div>

          {/* Resumen de ventas */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-gray-900">Resumen del Turno</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Monto Inicial</p>
                <p className="text-lg font-semibold">{formatCurrency(cajaAbierta?.montoInicial || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ventas en Efectivo</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(cajaAbierta?.totalEfectivo || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ventas con Tarjeta</p>
                <p className="text-lg font-semibold">{formatCurrency(cajaAbierta?.totalTarjeta || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transferencias</p>
                <p className="text-lg font-semibold">{formatCurrency(cajaAbierta?.totalTransferencia || 0)}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-300">
              <p className="text-sm text-gray-600">Efectivo Esperado</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency((cajaAbierta?.montoInicial || 0) + (cajaAbierta?.totalEfectivo || 0))}
              </p>
            </div>
          </div>

          <Input
            label="Efectivo Contado"
            type="number"
            value={montoContado}
            onChange={(e) => setMontoContado(Number(e.target.value))}
            required
            helperText="Cuenta el efectivo físico en caja"
          />

          {montoContado > 0 && (
            <div
              className={`p-4 rounded-lg ${
                montoContado === (cajaAbierta?.montoInicial || 0) + (cajaAbierta?.totalEfectivo || 0)
                  ? "bg-green-50"
                  : "bg-red-50"
              }`}
            >
              <p className="text-sm font-medium mb-1">Diferencia:</p>
              <p
                className={`text-2xl font-bold ${
                  montoContado === (cajaAbierta?.montoInicial || 0) + (cajaAbierta?.totalEfectivo || 0)
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(montoContado - ((cajaAbierta?.montoInicial || 0) + (cajaAbierta?.totalEfectivo || 0)))}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Notas adicionales sobre el cierre..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCierreModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleCerrarCaja} variant="danger" className="flex-1">
              Confirmar Cierre
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de detalle */}
      <Modal
        isOpen={showDetalleModal}
        onClose={() => setShowDetalleModal(false)}
        title={`Detalle de Caja - ${selectedCaja?.folio}`}
        size="xl"
      >
        <div className="space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Apertura</p>
              <p className="font-semibold">{selectedCaja && formatDateTime(selectedCaja.fechaApertura)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Cierre</p>
              <p className="font-semibold">
                {selectedCaja?.fechaCierre ? formatDateTime(selectedCaja.fechaCierre) : "En curso"}
              </p>
            </div>
          </div>

          {/* Totales por método */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Totales por Método de Pago</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700 mb-1">Efectivo</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(selectedCaja?.totalEfectivo || 0)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Tarjeta</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(selectedCaja?.totalTarjeta || 0)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700 mb-1">Transferencia</p>
                <p className="text-xl font-bold text-purple-900">
                  {formatCurrency(selectedCaja?.totalTransferencia || 0)}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-700 mb-1">Crédito</p>
                <p className="text-xl font-bold text-yellow-900">{formatCurrency(selectedCaja?.totalCredito || 0)}</p>
              </div>
            </div>
          </div>

          {/* Resumen final */}
          {selectedCaja?.estado === "cerrada" && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Monto Inicial:</span>
                <span className="font-semibold">{formatCurrency(selectedCaja.montoInicial)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Efectivo Esperado:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedCaja.montoInicial + selectedCaja.totalEfectivo)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Efectivo Contado:</span>
                <span className="font-semibold">{formatCurrency(selectedCaja.montoFinal)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-semibold">Diferencia:</span>
                <span
                  className={`font-bold text-lg ${selectedCaja.diferencia === 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(selectedCaja.diferencia)}
                </span>
              </div>
            </div>
          )}

          {/* Ventas */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Ventas del Turno ({ventasCaja.length})</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {ventasCaja.map((venta) => (
                <div key={venta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{venta.folio}</p>
                    <p className="text-xs text-gray-600">{formatDateTime(venta.fecha)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(venta.total)}</p>
                    <p className="text-xs text-gray-600 capitalize">{venta.metodoPago}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
