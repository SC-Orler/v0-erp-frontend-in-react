"use client"

import { useEffect, useState } from "react"
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone, User } from "lucide-react"
import Button from "@/components/Button"
import Toggle from "@/components/Toggle"
import Modal from "@/components/Modal"
import ventasServiceMock from "@/services/ventasServiceMock"
import { mockProductos } from "@/mocks/sampleData"
import { clientesService, type Cliente } from "@/services/clientesServiceMock"
import preciosServiceMock, { type TipoPrecioConfig } from "@/services/preciosServiceMock"
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
  const [clienteEspecial, setClienteEspecial] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [estadoCredito, setEstadoCredito] = useState<any>(null)
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "tarjeta" | "transferencia" | "credito">("efectivo")
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [tiposPrecio, setTiposPrecio] = useState<TipoPrecioConfig[]>([])

  // Filtrar productos según búsqueda
  const filteredProducts = mockProductos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Agregar producto al carrito
  const addToCart = (product: (typeof mockProductos)[0]) => {
    const existingItem = cart.find((item) => item.productoId === product.id)

    // precio ajustado por tipoPrecio del cliente
    const cargo = selectedCustomer?.tipoPrecio
      ? tiposPrecio.find((t) => t.clave === selectedCustomer.tipoPrecio)?.cargo ?? 0
      : 0
    const precioAjustado = product.precio + cargo

    if (existingItem) {
      if (existingItem.cantidad < product.stock) {
        setCart(
          cart.map((item) =>
            item.productoId === product.id ? { ...item, cantidad: item.cantidad + 1, precio: precioAjustado } : item,
          ),
        )
      } else {
        addToast({ type: "warning", message: "Stock insuficiente" })
      }
    } else {
      setCart([
        ...cart,
        {
          productoId: product.id,
          nombre: product.nombre,
          precio: precioAjustado,
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
  // Cargar clientes al inicio
  useEffect(() => {
    clientesService.getAll().then(setClientes).catch(() => {
      addToast({ type: "error", message: "Error al cargar clientes" })
    })
  }, [])

  // Cargar tipos de precio dinámicos
  useEffect(() => {
    preciosServiceMock
      .getAll()
      .then(setTiposPrecio)
      .catch(() => setTiposPrecio([]))
  }, [])

  // Actualizar estado de crédito cuando selecciona cliente
  useEffect(() => {
    if (selectedCustomer) {
      ventasServiceMock
        .getEstadoCreditoCliente(selectedCustomer.id)
        .then(setEstadoCredito)
        .catch(() => setEstadoCredito(null))
    } else {
      setEstadoCredito(null)
    }
  }, [selectedCustomer])

  const handleCheckout = async () => {
    if (cart.length === 0) {
      addToast({ type: "warning", message: "El carrito está vacío" })
      return
    }

    if (requiereFactura && !selectedCustomer) {
      addToast({ type: "warning", message: "Selecciona un cliente para facturar" })
      return
    }
    // Si es cliente especial, debe seleccionar un cliente con crédito
    if (clienteEspecial) {
      if (!selectedCustomer) {
        addToast({ type: "warning", message: "Selecciona un cliente especial con crédito" })
        return
      }
      if (!selectedCustomer.tipoFinanciamiento) {
        addToast({ type: "warning", message: "El cliente seleccionado no tiene crédito" })
        return
      }
    }

    setIsProcessing(true)

    try {
      const venta = await ventasServiceMock.createVenta({
        items: cart.map((item) => ({
          productoId: item.productoId,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precio,
        })),
        clienteId: selectedCustomer?.id || undefined,
        metodoPago: clienteEspecial ? "credito" : metodoPago,
        requiereFactura,
      })

      addToast({
        type: "success",
        message: `Venta ${venta.folio} registrada exitosamente`,
      })

      // Limpiar carrito
      setCart([])
      setRequiereFactura(false)
      setClienteEspecial(false)
      setSelectedCustomer(null)
      setMetodoPago("efectivo")
      setShowCheckoutModal(false)
    } catch (error) {
      addToast({ type: "error", message: (error as Error)?.message || "Error al procesar la venta" })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handler for customer selection
  const handleSelectCustomer = (customer: Cliente) => {
    setSelectedCustomer(customer)
    setShowCustomerDialog(false)
  }

  // Handler for new customer registration
  const handleNewCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const payload = {
      nombre: formData.get("nombre") as string,
      rfc: formData.get("rfc") as string,
      email: (formData.get("email") as string) || undefined,
      telefono: (formData.get("telefono") as string) || undefined,
      direccion: (formData.get("direccion") as string) || undefined,
      ciudad: "",
      estado: "",
      codigoPostal: "",
      limiteCredito: 0,
      activo: true,
      notas: "",
    }

    try {
      const nuevo = await clientesService.create(payload)
      setClientes((prev) => [nuevo, ...prev])
      setSelectedCustomer(nuevo)
    setShowNewCustomerForm(false)
    setShowCustomerDialog(false)
    addToast({ type: "success", message: "Cliente registrado exitosamente" })
  } catch (err) {
    addToast({ type: "error", message: "Error al registrar cliente" })
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
          {/* Opciones de cliente y factura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Toggle checked={clienteEspecial} onChange={setClienteEspecial} label="Cliente especial (a crédito)" />
              <p className="text-xs text-gray-500 mt-1">Solo muestra clientes con crédito y registra venta como crédito.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Toggle checked={requiereFactura} onChange={setRequiereFactura} label="¿Requiere factura ahora?" />
              <p className="text-xs text-gray-500 mt-1">Si se activa, se emitirá factura en este momento.</p>
            </div>
          </div>

          {/* Selección de cliente */}
          {(clienteEspecial || requiereFactura) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
              {selectedCustomer ? (
                <div className="rounded-lg border border-gray-300 p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{selectedCustomer.nombre}</p>
                      <p className="text-sm text-gray-600 mt-1">RFC: {selectedCustomer.rfc}</p>
                      {selectedCustomer.email && (
                        <p className="text-sm text-gray-600">Email: {selectedCustomer.email}</p>
                      )}
                    </div>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setSelectedCustomer(null)}>
                      Cambiar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowCustomerDialog(true)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Seleccionar Cliente
                </Button>
              )}
            </div>
          )}

          {/* Método de pago */}
          {!clienteEspecial && (
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
          )}

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

      <Modal
        isOpen={showCustomerDialog}
        onClose={() => {
          setShowCustomerDialog(false)
          setShowNewCustomerForm(false)
        }}
        title={showNewCustomerForm ? "Registrar Nuevo Cliente" : "Seleccionar Cliente"}
        size="lg"
      >
        {!showNewCustomerForm ? (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar cliente por nombre o RFC..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Customer List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {(clienteEspecial ? clientes.filter((c) => !!c.tipoFinanciamiento) : clientes).map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => handleSelectCustomer(cliente)}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <p className="font-semibold text-gray-900">{cliente.nombre}</p>
                  <p className="text-sm text-gray-600 mt-1">RFC: {cliente.rfc}</p>
                  {cliente.email && <p className="text-sm text-gray-500">Email: {cliente.email}</p>}
                </button>
              ))}
            </div>

            {/* New Customer Button */}
            <Button type="button" variant="secondary" className="w-full" onClick={() => setShowNewCustomerForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Nuevo Cliente
            </Button>
          </div>
        ) : (
          <form onSubmit={handleNewCustomer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón Social *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RFC *</label>
                <input
                  type="text"
                  name="rfc"
                  required
                  maxLength={13}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Régimen Fiscal *</label>
                <select
                  name="regimenFiscal"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="601">601 - General de Ley Personas Morales</option>
                  <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                  <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
                  <option value="606">606 - Arrendamiento</option>
                  <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                  <option value="621">621 - Incorporación Fiscal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uso de CFDI *</label>
                <select
                  name="usoCFDI"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="G01">G01 - Adquisición de mercancías</option>
                  <option value="G02">G02 - Devoluciones, descuentos o bonificaciones</option>
                  <option value="G03">G03 - Gastos en general</option>
                  <option value="I01">I01 - Construcciones</option>
                  <option value="I02">I02 - Mobilario y equipo de oficina</option>
                  <option value="P01">P01 - Por definir</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setShowNewCustomerForm(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Guardar Cliente
              </Button>
            </div>
          </form> 
        )}
      </Modal>
    </div>
  )
}
