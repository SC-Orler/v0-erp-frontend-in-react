"use client"

import { useState } from "react"
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone } from "lucide-react"
import Button from "@/components/Button"
import Toggle from "@/components/Toggle"
import Modal from "@/components/Modal"
import { ventasService } from "@/services/ventasService"
import { mockProductos, mockClientes } from "@/mocks/sampleData"
import { formatCurrency, calculateTotal, calculateIVA } from "@/utils/helpers"
import { useUIStore } from "@/store/uiStore"

interface CartItem {
  productoId: number
  nombre: string
  precio: number
  cantidad: number
  stock: number
}

/**
 * Página de Punto de Venta (POS)
 */
export default function POSPage() {
  const { addToast } = useUIStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [requiereFactura, setRequiereFactura] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null)
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "tarjeta" | "transferencia" | "credito">("efectivo")
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Filtrar productos según búsqueda
  const filteredProducts = mockProductos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Agregar producto al carrito
  const addToCart = (product: (typeof mockProductos)[0]) => {
    const existingItem = cart.find((item) => item.productoId === product.id)

    if (existingItem) {
      if (existingItem.cantidad < product.stock) {
        setCart(cart.map((item) => (item.productoId === product.id ? { ...item, cantidad: item.cantidad + 1 } : item)))
      } else {
        addToast({ type: "warning", message: "Stock insuficiente" })
      }
    } else {
      setCart([
        ...cart,
        {
          productoId: product.id,
          nombre: product.nombre,
          precio: product.precio,
          cantidad: 1,
          stock: product.stock,
        },
      ])
    }
  }

  // Actualizar cantidad
  const updateQuantity = (productoId: number, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.productoId === productoId) {
            const newQuantity = item.cantidad + delta
            if (newQuantity <= 0) return null
            if (newQuantity > item.stock) {
              addToast({ type: "warning", message: "Stock insuficiente" })
              return item
            }
            return { ...item, cantidad: newQuantity }
          }
          return item
        })
        .filter(Boolean) as CartItem[],
    )
  }

  // Remover del carrito
  const removeFromCart = (productoId: number) => {
    setCart(cart.filter((item) => item.productoId !== productoId))
  }

  // Calcular totales
  const subtotal = calculateTotal(cart)
  const iva = calculateIVA(subtotal)
  const total = subtotal + iva

  // Procesar venta
  const handleCheckout = async () => {
    if (cart.length === 0) {
      addToast({ type: "warning", message: "El carrito está vacío" })
      return
    }

    if (requiereFactura && !selectedCliente) {
      addToast({ type: "warning", message: "Selecciona un cliente para facturar" })
      return
    }

    setIsProcessing(true)

    try {
      const venta = await ventasService.createVenta({
        items: cart.map((item) => ({
          productoId: item.productoId,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precio,
        })),
        clienteId: selectedCliente || undefined,
        metodoPago,
        requiereFactura,
      })

      addToast({
        type: "success",
        message: `Venta ${venta.folio} registrada exitosamente`,
      })

      // Limpiar carrito
      setCart([])
      setRequiereFactura(false)
      setSelectedCliente(null)
      setMetodoPago("efectivo")
      setShowCheckoutModal(false)
    } catch (error) {
      addToast({ type: "error", message: "Error al procesar la venta" })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      {/* Panel de productos */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Punto de Venta</h1>

        {/* Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar productos por nombre o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow text-left"
            >
              <img
                src={product.imagen || "/placeholder.svg"}
                alt={product.nombre}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.nombre}</h3>
              <p className="text-xs text-gray-500 mb-2">Stock: {product.stock}</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(product.precio)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Panel de carrito */}
      <div className="w-full lg:w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-900">
            <ShoppingCart className="h-6 w-6" />
            <h2 className="text-xl font-bold">Carrito</h2>
            <span className="ml-auto bg-blue-600 text-white text-sm px-2 py-1 rounded-full">{cart.length}</span>
          </div>
        </div>

        {/* Items del carrito */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productoId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 text-sm flex-1">{item.nombre}</h3>
                  <button onClick={() => removeFromCart(item.productoId)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productoId, -1)}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.productoId, 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="font-bold text-gray-900">{formatCurrency(item.precio * item.cantidad)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totales y checkout */}
        <div className="p-6 border-t border-gray-200 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IVA (16%):</span>
              <span className="font-semibold">{formatCurrency(iva)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button onClick={() => setShowCheckoutModal(true)} disabled={cart.length === 0} className="w-full" size="lg">
            Procesar Venta
          </Button>
        </div>
      </div>

      {/* Modal de checkout */}
      <Modal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} title="Procesar Venta" size="lg">
        <div className="space-y-6">
          {/* Toggle factura */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Toggle checked={requiereFactura} onChange={setRequiereFactura} label="¿Requiere factura?" />
          </div>

          {/* Selección de cliente */}
          {requiereFactura && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
              <select
                value={selectedCliente || ""}
                onChange={(e) => setSelectedCliente(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar cliente</option>
                {mockClientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} - {cliente.rfc}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Método de Pago</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMetodoPago("efectivo")}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  metodoPago === "efectivo" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Banknote className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Efectivo</p>
              </button>
              <button
                onClick={() => setMetodoPago("tarjeta")}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  metodoPago === "tarjeta" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CreditCard className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Tarjeta</p>
              </button>
              <button
                onClick={() => setMetodoPago("transferencia")}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  metodoPago === "transferencia"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Smartphone className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Transferencia</p>
              </button>
              <button
                onClick={() => setMetodoPago("credito")}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  metodoPago === "credito" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CreditCard className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Crédito</p>
              </button>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IVA:</span>
              <span className="font-semibold">{formatCurrency(iva)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
              <span>Total:</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCheckoutModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleCheckout} isLoading={isProcessing} className="flex-1">
              Confirmar Venta
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
