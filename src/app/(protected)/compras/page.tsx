"use client"

import { useEffect, useState } from "react"
import { Plus, Eye, CheckCircle, XCircle } from "lucide-react"
import Table from "@/components/Table"
import Button from "@/components/Button"
import Modal from "@/components/Modal"
import Input from "@/components/Input"
import { comprasService } from "@/services/comprasService"
import { proveedoresService } from "@/services/proveedoresService"
import { inventarioService } from "@/services/inventarioService"
import { formatCurrency, formatDateTime } from "@/utils/helpers"
import { useUIStore } from "@/store/uiStore"

/**
 * Página de gestión de compras
 */
export default function ComprasPage() {
  const { addToast } = useUIStore()
  const [compras, setCompras] = useState<any[]>([])
  const [proveedores, setProveedores] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [selectedCompra, setSelectedCompra] = useState<any>(null)

  const [formData, setFormData] = useState({
    proveedorId: 0,
    items: [] as any[],
    facturaProveedor: "",
    observaciones: "",
  })

  const [newItem, setNewItem] = useState({
    productoId: 0,
    cantidad: 0,
    precioUnitario: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [comprasData, proveedoresData, productosData] = await Promise.all([
        comprasService.getCompras(),
        proveedoresService.getProveedores(),
        inventarioService.getProductos(),
      ])
      setCompras(comprasData)
      setProveedores(proveedoresData)
      setProductos(productosData)
    } catch (error) {
      addToast({ type: "error", message: "Error al cargar datos" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = () => {
    setFormData({
      proveedorId: 0,
      items: [],
      facturaProveedor: "",
      observaciones: "",
    })
    setShowModal(true)
  }

  const handleAddItem = () => {
    if (newItem.productoId === 0 || newItem.cantidad <= 0 || newItem.precioUnitario <= 0) {
      addToast({ type: "warning", message: "Completa todos los campos del producto" })
      return
    }

    const producto = productos.find((p) => p.id === newItem.productoId)
    if (!producto) return

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          cantidad: newItem.cantidad,
          precioUnitario: newItem.precioUnitario,
        },
      ],
    })

    setNewItem({ productoId: 0, cantidad: 0, precioUnitario: 0 })
  }

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleSave = async () => {
    if (formData.proveedorId === 0) {
      addToast({ type: "warning", message: "Selecciona un proveedor" })
      return
    }

    if (formData.items.length === 0) {
      addToast({ type: "warning", message: "Agrega al menos un producto" })
      return
    }

    try {
      await comprasService.createCompra(formData)
      addToast({ type: "success", message: "Compra registrada" })
      setShowModal(false)
      loadData()
    } catch (error) {
      addToast({ type: "error", message: "Error al registrar compra" })
    }
  }

  const handleMarcarRecibida = async (id: number) => {
    try {
      await comprasService.marcarRecibida(id)
      addToast({ type: "success", message: "Compra marcada como recibida" })
      loadData()
    } catch (error) {
      addToast({ type: "error", message: "Error al actualizar compra" })
    }
  }

  const subtotal = formData.items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0)
  const iva = subtotal * 0.16
  const total = subtotal + iva

  const columns = [
    { key: "folio", label: "Folio" },
    {
      key: "fecha",
      label: "Fecha",
      render: (c: any) => formatDateTime(c.fecha),
    },
    { key: "proveedorNombre", label: "Proveedor" },
    {
      key: "total",
      label: "Total",
      render: (c: any) => formatCurrency(c.total),
    },
    {
      key: "estado",
      label: "Estado",
      render: (c: any) => {
        const estados = {
          pendiente: <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pendiente</span>,
          recibida: <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Recibida</span>,
          cancelada: <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Cancelada</span>,
        }
        return estados[c.estado as keyof typeof estados]
      },
    },
    {
      key: "actions",
      label: "Acciones",
      render: (c: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedCompra(c)
              setShowDetalleModal(true)
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
          </button>
          {c.estado === "pendiente" && (
            <button onClick={() => handleMarcarRecibida(c.id)} className="text-green-600 hover:text-green-700">
              <CheckCircle className="h-4 w-4" />
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compras</h1>
          <p className="text-gray-600 mt-1">Gestión de órdenes de compra</p>
        </div>
        <Button onClick={handleOpenModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Compra
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table columns={columns} data={compras} />
      </div>

      {/* Modal de nueva compra */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Compra" size="xl">
        <div className="space-y-6">
          {/* Selección de proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor *</label>
            <select
              value={formData.proveedorId}
              onChange={(e) => setFormData({ ...formData, proveedorId: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Seleccionar proveedor</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Agregar productos */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Agregar Productos</h3>
            <div className="grid grid-cols-4 gap-3 mb-3">
              <select
                value={newItem.productoId}
                onChange={(e) => setNewItem({ ...newItem, productoId: Number(e.target.value) })}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Seleccionar producto</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Cantidad"
                value={newItem.cantidad || ""}
                onChange={(e) => setNewItem({ ...newItem, cantidad: Number(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Precio"
                value={newItem.precioUnitario || ""}
                onChange={(e) => setNewItem({ ...newItem, precioUnitario: Number(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button onClick={handleAddItem} size="sm" variant="secondary" className="w-full">
              Agregar Producto
            </Button>
          </div>

          {/* Lista de productos */}
          {formData.items.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Productos ({formData.items.length})</h3>
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.nombre}</p>
                      <p className="text-xs text-gray-600">
                        {item.cantidad} x {formatCurrency(item.precioUnitario)} ={" "}
                        {formatCurrency(item.cantidad * item.precioUnitario)}
                      </p>
                    </div>
                    <button onClick={() => handleRemoveItem(index)} className="text-red-600 hover:text-red-700">
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totales */}
          {formData.items.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>IVA (16%):</span>
                <span className="font-semibold">{formatCurrency(iva)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                <span>Total:</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Factura del Proveedor"
              value={formData.facturaProveedor}
              onChange={(e) => setFormData({ ...formData, facturaProveedor: e.target.value })}
              placeholder="Número de factura"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Registrar Compra
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de detalle */}
      <Modal
        isOpen={showDetalleModal}
        onClose={() => setShowDetalleModal(false)}
        title={`Detalle de Compra - ${selectedCompra?.folio}`}
        size="lg"
      >
        {selectedCompra && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Proveedor</p>
                <p className="font-semibold">{selectedCompra.proveedorNombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-semibold">{formatDateTime(selectedCompra.fecha)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>
              <div className="space-y-2">
                {selectedCompra.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium">{item.nombre}</p>
                      <p className="text-sm text-gray-600">
                        {item.cantidad} x {formatCurrency(item.precioUnitario)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.cantidad * item.precioUnitario)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(selectedCompra.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA:</span>
                <span className="font-semibold">{formatCurrency(selectedCompra.iva)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                <span>Total:</span>
                <span className="text-blue-600">{formatCurrency(selectedCompra.total)}</span>
              </div>
            </div>

            {selectedCompra.facturaProveedor && (
              <div>
                <p className="text-sm text-gray-600">Factura del Proveedor</p>
                <p className="font-semibold">{selectedCompra.facturaProveedor}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
