import { api } from "./api"
import { mockCajas, mockVentas } from "@/mocks/sampleData"
import { generateFolio } from "@/utils/helpers"

interface Caja {
  id: number
  folio: string
  usuarioId: number
  usuarioNombre: string
  fechaApertura: string
  fechaCierre: string | null
  montoInicial: number
  montoFinal: number | null
  totalEfectivo: number
  totalTarjeta: number
  totalTransferencia: number
  totalCredito: number
  diferencia: number | null
  estado: "abierta" | "cerrada"
  observaciones: string
}

interface AperturaCajaData {
  usuarioId: number
  montoInicial: number
  sucursalId?: number
}

interface CierreCajaData {
  cajaId: number
  montoContado: number
  observaciones?: string
}

/**
 * Servicio de caja (cortes de caja)
 */
export const cajaService = {
  /**
   * Obtener todas las cajas
   */
  async getCajas(params?: { start?: string; end?: string; usuarioId?: number }): Promise<Caja[]> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filtered = [...mockCajas]

          if (params?.usuarioId) {
            filtered = filtered.filter((c) => c.usuarioId === params.usuarioId)
          }

          resolve(filtered)
        }, 300)
      })
    }

    const response = await api.get<Caja[]>("/caja", { params })
    return response.data
  },

  /**
   * Obtener caja por ID
   */
  async getCajaById(id: number): Promise<Caja> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const caja = mockCajas.find((c) => c.id === id)
          if (caja) {
            resolve(caja)
          } else {
            reject(new Error("Caja no encontrada"))
          }
        }, 300)
      })
    }

    const response = await api.get<Caja>(`/caja/${id}`)
    return response.data
  },

  /**
   * Obtener caja abierta del usuario actual
   */
  async getCajaAbierta(usuarioId: number): Promise<Caja | null> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          const cajaAbierta = mockCajas.find((c) => c.usuarioId === usuarioId && c.estado === "abierta")
          resolve(cajaAbierta || null)
        }, 300)
      })
    }

    const response = await api.get<Caja | null>(`/caja/abierta/${usuarioId}`)
    return response.data
  },

  /**
   * Abrir caja (apertura de turno)
   */
  async abrirCaja(data: AperturaCajaData): Promise<Caja> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Verificar si ya hay una caja abierta
          const cajaAbierta = mockCajas.find((c) => c.usuarioId === data.usuarioId && c.estado === "abierta")
          if (cajaAbierta) {
            reject(new Error("Ya tienes una caja abierta"))
            return
          }

          const newCaja: Caja = {
            id: mockCajas.length + 1,
            folio: generateFolio("CAJA"),
            usuarioId: data.usuarioId,
            usuarioNombre: "Usuario",
            fechaApertura: new Date().toISOString(),
            fechaCierre: null,
            montoInicial: data.montoInicial,
            montoFinal: null,
            totalEfectivo: 0,
            totalTarjeta: 0,
            totalTransferencia: 0,
            totalCredito: 0,
            diferencia: null,
            estado: "abierta",
            observaciones: "",
          }

          mockCajas.push(newCaja)
          resolve(newCaja)
        }, 500)
      })
    }

    const response = await api.post<Caja>("/caja/apertura", data)
    return response.data
  },

  /**
   * Cerrar caja (cierre de turno)
   */
  async cerrarCaja(data: CierreCajaData): Promise<Caja> {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const caja = mockCajas.find((c) => c.id === data.cajaId)
          if (!caja) {
            reject(new Error("Caja no encontrada"))
            return
          }

          if (caja.estado === "cerrada") {
            reject(new Error("La caja ya está cerrada"))
            return
          }

          // Calcular totales por método de pago
          const ventasCaja = mockVentas.filter((v) => v.cajaId === data.cajaId)

          const totalEfectivo = ventasCaja
            .filter((v) => v.metodoPago === "efectivo")
            .reduce((sum, v) => sum + v.total, 0)

          const totalTarjeta = ventasCaja.filter((v) => v.metodoPago === "tarjeta").reduce((sum, v) => sum + v.total, 0)

          const totalTransferencia = ventasCaja
            .filter((v) => v.metodoPago === "transferencia")
            .reduce((sum, v) => sum + v.total, 0)

          const totalCredito = ventasCaja.filter((v) => v.metodoPago === "credito").reduce((sum, v) => sum + v.total, 0)

          const montoEsperado = caja.montoInicial + totalEfectivo
          const diferencia = data.montoContado - montoEsperado

          // Actualizar caja
          caja.fechaCierre = new Date().toISOString()
          caja.montoFinal = data.montoContado
          caja.totalEfectivo = totalEfectivo
          caja.totalTarjeta = totalTarjeta
          caja.totalTransferencia = totalTransferencia
          caja.totalCredito = totalCredito
          caja.diferencia = diferencia
          caja.estado = "cerrada"
          caja.observaciones = data.observaciones || ""

          resolve(caja)
        }, 500)
      })
    }

    const response = await api.post<Caja>("/caja/cierre", data)
    return response.data
  },

  /**
   * Obtener ventas de una caja
   */
  async getVentasCaja(cajaId: number) {
    // Modo desarrollo
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          const ventas = mockVentas.filter((v) => v.cajaId === cajaId)
          resolve(ventas)
        }, 300)
      })
    }

    const response = await api.get(`/caja/${cajaId}/ventas`)
    return response.data
  },
}
