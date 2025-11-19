import { generateFolio } from "@/utils/helpers"
import ventasSvc, { ventasServiceMock, type Venta } from "./ventasServiceMock"

export interface FacturaItem {
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Factura {
  id: string
  folio: string
  clienteId: string
  fecha: string
  items: FacturaItem[]
  subtotal: number
  iva: number
  total: number
  tipo: "global" | "individual"
  ventasIncluidas: string[]
}

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms))

let facturasDb: Factura[] = []

export const facturasServiceMock = {
  async createFacturaGlobal(params: {
    clienteId: string
    consolidacion?: "porProducto" | "lineaUnica"
  }): Promise<Factura> {
    await delay()

    const ventasPendientes: Venta[] = await ventasServiceMock.listarPendientesParaFactura(params.clienteId)
    const ventasAFacturar = ventasPendientes.filter((v) => v.estado !== "facturada")

    if (ventasAFacturar.length === 0) {
      throw new Error("No hay ventas pendientes para facturar")
    }

    let items: FacturaItem[] = []

    if (params.consolidacion === "lineaUnica") {
      const total = ventasAFacturar.reduce((s, v) => s + v.total, 0)
      const subtotal = ventasAFacturar.reduce((s, v) => s + v.subtotal, 0)
      const iva = ventasAFacturar.reduce((s, v) => s + v.iva, 0)
      items = [
        {
          descripcion: "Venta global del periodo",
          cantidad: 1,
          precioUnitario: total,
          subtotal: total,
        },
      ]
      const factura: Factura = {
        id: Math.random().toString(36).slice(2),
        folio: generateFolio("F"),
        clienteId: params.clienteId,
        fecha: new Date().toISOString(),
        items,
        subtotal,
        iva,
        total,
        tipo: "global",
        ventasIncluidas: ventasAFacturar.map((v) => v.id),
      }
      facturasDb.push(factura)
      await ventasServiceMock.marcarFacturadas(factura.ventasIncluidas, factura.id)
      return JSON.parse(JSON.stringify(factura))
    }

    // Consolidación por producto (nombre)
    const map = new Map<string, { cantidad: number; subtotal: number }>()
    let subtotal = 0
    let iva = 0
    let total = 0

    for (const v of ventasAFacturar) {
      subtotal += v.subtotal
      iva += v.iva
      total += v.total
      for (const it of v.items) {
        const key = it.nombre
        const entry = map.get(key) || { cantidad: 0, subtotal: 0 }
        entry.cantidad += it.cantidad
        entry.subtotal += it.cantidad * it.precio
        map.set(key, entry)
      }
    }

    items = Array.from(map.entries()).map(([nombre, e]) => ({
      descripcion: nombre,
      cantidad: e.cantidad,
      precioUnitario: e.subtotal / e.cantidad,
      subtotal: e.subtotal,
    }))

    const factura: Factura = {
      id: Math.random().toString(36).slice(2),
      folio: generateFolio("F"),
      clienteId: params.clienteId,
      fecha: new Date().toISOString(),
      items,
      subtotal,
      iva,
      total,
      tipo: "global",
      ventasIncluidas: ventasAFacturar.map((v) => v.id),
    }

    facturasDb.push(factura)
    await ventasServiceMock.marcarFacturadas(factura.ventasIncluidas, factura.id)
    return JSON.parse(JSON.stringify(factura))
  },

  async getFacturasByCliente(clienteId: string): Promise<Factura[]> {
    await delay()
    return facturasDb.filter((f) => f.clienteId === clienteId)
  },
}

export default facturasServiceMock
