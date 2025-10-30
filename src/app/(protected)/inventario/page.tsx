"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash2, AlertTriangle, Package, Search } from "lucide-react"
import Table from "@/components/Table"
import Button from "@/components/Button"
import Modal from "@/components/Modal"
import Input from "@/components/Input"
import { inventarioService } from "@/services/inventarioService"
import { formatCurrency, isExpiringSoon, isExpired } from "@/utils/helpers"
import { useUIStore } from "@/store/uiStore"

/**
 * Página de gestión de inventario
 */
export default function InventarioPage() {
  const { addToast } = useUIStore()
  const [productos, setProductos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showMovimientoModal, setShowMovimientoModal] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("all")
  const [filterStock, setFilterStock] = useState<"all" | "bajo" | "normal">("all")

  // Form state
  const [formData, setFormData] = useState({
    nombre: "",
    claveSat: "",
    sku: "",
    categoria: "",
    unidad: "pza",
    precio: 0,
    costo: 0,
    stock: 0,
    stockMinimo: 0,
    fechaCaducidad: "",
    ubicacion: "",
  })

  // Movimiento state
  const [movimientoData, setMovimientoData] = useState({
    tipo: "entrada" as "entrada" | "salida",
    cantidad: 0,
    lote: "",
    fechaCaducidad: "",
    motivo: "",
  })

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      const data = await inventarioService.getProductos()
      setProductos(data)
    } catch (error) {
      console.error("Error cargando productos:", error)
      addToast({ type: "error", message: "Error al cargar productos" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (producto?: any) => {
    if (producto) {
      setSelectedProducto(producto)
      setFormData(producto)
    } else {
      setSelectedProducto(null)
      setFormData({
        nombre: "",
        claveSat: "",
        sku: "",
        categoria: "",
        unidad: "pza",
        precio: 0,
        costo: 0,
        stock: 0,
        stockMinimo: 0,
        fechaCaducidad: "",
        ubicacion: "",
      })
    }
    setShowModal(true)
  }

  const handleSaveProducto = async () => {
    try {
      if (selectedProducto) {
        await inventarioService.updateProducto(selectedProducto.id, formData)
        addToast({ type: "success", message: "Producto actualizado" })
      } else {
        await inventarioService.createProducto(formData)
        addToast({ type: "success", message: "Producto creado" })
      }
      setShowModal(false)
      loadProductos()
    } catch (error) {
      addToast({ type: "error", message: "Error al guardar producto" })
    }
  }

  const handleDeleteProducto = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await inventarioService.deleteProducto(id)
        addToast({ type: "success", message: "Producto eliminado" })
        loadProductos()
      } catch (error) {
        addToast({ type: "error", message: "Error al eliminar producto" })
      }
    }
  }

  const handleOpenMovimiento = (producto: any) => {
    setSelectedProducto(producto)
    setMovimientoData({
      tipo: "entrada",
      cantidad: 0,
      lote: "",
      fechaCaducidad: "",
      motivo: "",
    })
    setShowMovimientoModal(true)
  }

  const handleRegistrarMovimiento = async () => {
    try {
      await inventarioService.registrarMovimiento({
        productoId: selectedProducto.id,
        ...movimientoData,
      })
      addToast({ type: "success", message: "Movimiento registrado" })
      setShowMovimientoModal(false)
      loadProductos()
    } catch (error) {
      addToast({ type: "error", message: "Error al registrar movimiento" })
    }
  }

  // Filtrar productos
  const filteredProductos = productos.filter((producto) => {
    const matchesSearch =
      producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producto.sku.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategoria = filterCategoria === "all" || producto.categoria === filterCategoria

    const matchesStock =
      filterStock === "all" ||
      (filterStock === "bajo" && producto.stock <= producto.stockMinimo) ||
      (filterStock === "normal" && producto.stock > producto.stockMinimo)

    return matchesSearch && matchesCategoria && matchesStock
  })

  const categorias = inventarioService.getCategorias()

  const columns = [
    {
      key: "imagen",
      label: "Imagen",
      render: (p: any) => (
        <img src={p.imagen || "/placeholder.svg"} alt={p.nombre} className="w-12 h-12 object-cover rounded" />
      ),
    },
    { key: "sku", label: "SKU" },
    { key: "nombre", label: "Nombre" },
    { key: "categoria", label: "Categoría" },
    {
      key: "stock",
      label: "Stock",
      render: (p: any) => (
        <div className="flex items-center gap-2">
          <span className={p.stock <= p.stockMinimo ? "text-red-600 font-semibold" : ""}>
            {p.stock} {p.unidad}
          </span>
          {p.stock <= p.stockMinimo && <AlertTriangle className="h-4 w-4 text-red-600" />}
        </div>
      ),
    },
    {
      key: "precio",
      label: "Precio",
      render: (p: any) => formatCurrency(p.precio),
    },
    {
      key: "fechaCaducidad",
      label: "Caducidad",
      render: (p: any) => {
        const expired = isExpired(p.fechaCaducidad)
        const expiring = isExpiringSoon(p.fechaCaducidad)
        return (
          <span
            className={
              expired ? "text-red-600 font-semibold" : expiring ? "text-yellow-600 font-semibold" : "text-gray-600"
            }
          >
            {new Date(p.fechaCaducidad).toLocaleDateString("es-MX")}
          </span>
        )
      },
    },
    {
      key: "actions",
      label: "Acciones",
      render: (p: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenMovimiento(p)}
            className="text-blue-600 hover:text-blue-700"
            title="Movimiento"
          >
            <Package className="h-4 w-4" />
          </button>
          <button onClick={() => handleOpenModal(p)} className="text-green-600 hover:text-green-700" title="Editar">
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteProducto(p.id)}
            className="text-red-600 hover:text-red-700"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600 mt-1">Gestión de productos y stock</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-red-600 font-medium">Stock Bajo</p>
              <p className="text-2xl font-bold text-red-700">
                {productos.filter((p) => p.stock <= p.stockMinimo).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-600 font-medium">Próximos a Vencer</p>
              <p className="text-2xl font-bold text-yellow-700">
                {productos.filter((p) => isExpiringSoon(p.fechaCaducidad)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Productos</p>
              <p className="text-2xl font-bold text-blue-700">{productos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todo el stock</option>
            <option value="bajo">Stock bajo</option>
            <option value="normal">Stock normal</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow">
        <Table columns={columns} data={filteredProductos} />
      </div>

      {/* Modal de producto */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedProducto ? "Editar Producto" : "Nuevo Producto"}
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
            <Input
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Clave SAT"
              value={formData.claveSat}
              onChange={(e) => setFormData({ ...formData, claveSat: e.target.value })}
              required
            />
            <Input
              label="Categoría"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <select
                value={formData.unidad}
                onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pza">Pieza</option>
                <option value="kg">Kilogramo</option>
                <option value="litro">Litro</option>
                <option value="paquete">Paquete</option>
                <option value="caja">Caja</option>
              </select>
            </div>
            <Input
              label="Precio"
              type="number"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
              required
            />
            <Input
              label="Costo"
              type="number"
              value={formData.costo}
              onChange={(e) => setFormData({ ...formData, costo: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock Inicial"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              required
              disabled={!!selectedProducto}
            />
            <Input
              label="Stock Mínimo"
              type="number"
              value={formData.stockMinimo}
              onChange={(e) => setFormData({ ...formData, stockMinimo: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha de Caducidad"
              type="date"
              value={formData.fechaCaducidad}
              onChange={(e) => setFormData({ ...formData, fechaCaducidad: e.target.value })}
              required
            />
            <Input
              label="Ubicación"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              placeholder="Ej: Anaquel A1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSaveProducto} className="flex-1">
              {selectedProducto ? "Actualizar" : "Crear"} Producto
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de movimiento */}
      <Modal
        isOpen={showMovimientoModal}
        onClose={() => setShowMovimientoModal(false)}
        title={`Movimiento de Inventario - ${selectedProducto?.nombre}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimiento</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMovimientoData({ ...movimientoData, tipo: "entrada" })}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  movimientoData.tipo === "entrada"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium">Entrada</p>
              </button>
              <button
                onClick={() => setMovimientoData({ ...movimientoData, tipo: "salida" })}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  movimientoData.tipo === "salida"
                    ? "border-red-600 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium">Salida</p>
              </button>
            </div>
          </div>

          <Input
            label="Cantidad"
            type="number"
            value={movimientoData.cantidad}
            onChange={(e) => setMovimientoData({ ...movimientoData, cantidad: Number(e.target.value) })}
            required
          />

          <Input
            label="Lote"
            value={movimientoData.lote}
            onChange={(e) => setMovimientoData({ ...movimientoData, lote: e.target.value })}
            placeholder="Opcional"
          />

          <Input
            label="Fecha de Caducidad"
            type="date"
            value={movimientoData.fechaCaducidad}
            onChange={(e) => setMovimientoData({ ...movimientoData, fechaCaducidad: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <textarea
              value={movimientoData.motivo}
              onChange={(e) => setMovimientoData({ ...movimientoData, motivo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe el motivo del movimiento..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowMovimientoModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleRegistrarMovimiento} className="flex-1">
              Registrar Movimiento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
