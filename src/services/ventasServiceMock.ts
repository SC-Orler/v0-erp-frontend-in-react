import { generateFolio } from "@/utils/helpers"
import { clientesService as clientesServiceMock, type Cliente } from "./clientesServiceMock"

export interface VentaItem {
  productoId: number
  nombre: string
  cantidad: number
  precio: number
}

export interface CreateVentaData {
  items: VentaItem[]
  clienteId?: string
  metodoPago: "efectivo" | "tarjeta" | "transferencia" | "credito"
  requiereFactura: boolean
  cajaId?: number
}

export type VentaEstado = "pendiente" | "pagada" | "facturada"

export interface Venta {
  id: string
  folio: string
  fecha: string
  clienteId: string | null
  clienteNombre: string
  items: VentaItem[]
  subtotal: number
  iva: number
  total: number
  metodoPago: string
  requiereFactura: boolean
  estado: VentaEstado
  facturaId: string | null
  usuarioId: string
  cajaId: number | null
}

// Mock DB en memoria
let ventasDb: Venta[] = []

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms))

function calcTotales(items: VentaItem[]) {
  const subtotal = items.reduce((sum, it) => sum + it.precio * it.cantidad, 0)
  const iva = subtotal * 0.16
  const total = subtotal + iva
  return { subtotal, iva, total }
}

async function validarFinanciamiento(cliente: Cliente, items: VentaItem[]) {
  const { total } = calcTotales(items)

  // Reunir ventas pendientes del cliente
  const pendientes = ventasDb.filter((v) => v.clienteId === cliente.id && v.estado === "pendiente")

  if (cliente.tipoFinanciamiento === "dias") {
    const dias = cliente.diasCredito ?? 0
    if (dias <= 0) throw new Error("El cliente no tiene días de crédito configurados")

    // Regla simple: vencimiento = fechaRegistro + diasCredito
    const inicio = new Date(cliente.fechaRegistro).getTime()
    const vence = inicio + dias * 24 * 60 * 60 * 1000
    const hoy = Date.now()
    if (hoy > vence) {
      throw new Error("Crédito vencido por días. No se puede realizar la venta a crédito.")
    }
  }

  if (cliente.tipoFinanciamiento === "monto") {
    const saldoPendiente = pendientes.reduce((s, v) => s + v.total, 0)
    const limite = cliente.montoCredito ?? 0
    if (limite <= 0) throw new Error("El cliente no tiene monto de crédito configurado")
    if (saldoPendiente + total > limite) {
      throw new Error("Crédito por monto excedido. No se puede realizar la venta.")
    }
  }

  if (cliente.tipoFinanciamiento === "unidades") {
    const unidadesPend = pendientes.reduce((s, v) => s + v.items.reduce((a, it) => a + it.cantidad, 0), 0)
    const unidadesVenta = items.reduce((a, it) => a + it.cantidad, 0)
    const limiteU = cliente.unidadesCredito ?? 0
    if (limiteU <= 0) throw new Error("El cliente no tiene unidades de crédito configuradas")
    if (unidadesPend + unidadesVenta > limiteU) {
      throw new Error("Crédito por unidades excedido. No se puede realizar la venta.")
    }
  }
}

export const ventasServiceMock = {
  async getVentas(): Promise<Venta[]> {
    await delay()
    return JSON.parse(JSON.stringify(ventasDb))
  },
  async createVenta(data: CreateVentaData): Promise<Venta> {
    await delay()

    const { subtotal, iva, total } = calcTotales(data.items)

    let clienteNombre = "Público General"
    let clienteId: string | null = null

    if (data.clienteId) {
      const cliente = await clientesServiceMock.getById(data.clienteId)
      clienteId = cliente.id
      clienteNombre = cliente.nombre

      // Si método es "credito" o requiereFactura sin pago inmediato, validar financiamiento
      if (data.metodoPago === "credito") {
        await validarFinanciamiento(cliente, data.items)
      }
    }

    const venta: Venta = {
      id: Math.random().toString(36).slice(2),
      folio: generateFolio("V"),
      fecha: new Date().toISOString(),
      clienteId,
      clienteNombre,
      items: data.items,
      subtotal,
      iva,
      total,
      metodoPago: data.metodoPago,
      requiereFactura: data.requiereFactura,
      estado: data.metodoPago === "credito" && clienteId ? "pendiente" : "pagada",
      facturaId: null,
      usuarioId: "1",
      cajaId: data.cajaId || null,
    }

    ventasDb.push(venta)
    return JSON.parse(JSON.stringify(venta))
  },

  async getVentasByCliente(clienteId: string): Promise<Venta[]> {
    await delay()
    return ventasDb.filter((v) => v.clienteId === clienteId)
  },

  async listarPendientesParaFactura(clienteId: string): Promise<Venta[]> {
    await delay()
    return ventasDb.filter((v) => v.clienteId === clienteId && v.estado !== "facturada")
  },

  async marcarFacturadas(ventaIds: string[], facturaId: string) {
    await delay()
    ventasDb = ventasDb.map((v) => (ventaIds.includes(v.id) ? { ...v, estado: "facturada", facturaId } : v))
  },

  // Utilidad para estado/margen
  async getEstadoCreditoCliente(clienteId: string) {
    await delay()
    const cliente = await clientesServiceMock.getById(clienteId)
    const pendientes = ventasDb.filter((v) => v.clienteId === clienteId && v.estado === "pendiente")
    const saldoPendiente = pendientes.reduce((s, v) => s + v.total, 0)
    const unidadesPend = pendientes.reduce((s, v) => s + v.items.reduce((a, it) => a + it.cantidad, 0), 0)

    if (cliente.tipoFinanciamiento === "monto") {
      const limite = cliente.montoCredito ?? 0
      return { tipo: "monto", disponible: Math.max(0, limite - saldoPendiente), saldoPendiente }
    }
    if (cliente.tipoFinanciamiento === "unidades") {
      const limiteU = cliente.unidadesCredito ?? 0
      return { tipo: "unidades", disponible: Math.max(0, limiteU - unidadesPend), saldoPendiente }
    }
    if (cliente.tipoFinanciamiento === "dias") {
      const dias = cliente.diasCredito ?? 0
      const inicio = new Date(cliente.fechaRegistro).getTime()
      const vence = inicio + dias * 24 * 60 * 60 * 1000
      const diasRestantes = Math.ceil((vence - Date.now()) / (24 * 60 * 60 * 1000))
      return { tipo: "dias", diasRestantes, saldoPendiente }
    }
    return { tipo: "contado", saldoPendiente }
  },
}

export default ventasServiceMock
