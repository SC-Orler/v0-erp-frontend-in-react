//import api from "./api"
import { api } from "./api"

export interface Poliza {
  id: string
  numero: string
  fecha: string
  tipo: "ingreso" | "egreso" | "diario"
  concepto: string
  total: number
  movimientos: MovimientoPoliza[]
  estatus: "borrador" | "aplicada" | "cancelada"
  creadoPor: string
  fechaCreacion: string
}

export interface MovimientoPoliza {
  id: string
  cuentaContable: string
  nombreCuenta: string
  debe: number
  haber: number
  referencia?: string
}

export interface PolizaFormData {
  fecha: string
  tipo: "ingreso" | "egreso" | "diario"
  concepto: string
  movimientos: Omit<MovimientoPoliza, "id">[]
}

export interface CuentaContable {
  id: string
  codigo: string
  nombre: string
  tipo: "activo" | "pasivo" | "capital" | "ingreso" | "egreso"
  nivel: number
  padre?: string
}

export const contabilidadService = {
  // Pólizas
  getPolizas: async (filters?: { fechaInicio?: string; fechaFin?: string; tipo?: string }): Promise<Poliza[]> => {
    const response = await api.get("/contabilidad/polizas", { params: filters })
    return response.data
  },

  getPolizaById: async (id: string): Promise<Poliza> => {
    const response = await api.get(`/contabilidad/polizas/${id}`)
    return response.data
  },

  createPoliza: async (data: PolizaFormData): Promise<Poliza> => {
    const response = await api.post("/contabilidad/polizas", data)
    return response.data
  },

  aplicarPoliza: async (id: string): Promise<Poliza> => {
    const response = await api.post(`/contabilidad/polizas/${id}/aplicar`)
    return response.data
  },

  cancelarPoliza: async (id: string): Promise<Poliza> => {
    const response = await api.post(`/contabilidad/polizas/${id}/cancelar`)
    return response.data
  },

  // Catálogo de cuentas
  getCuentasContables: async (): Promise<CuentaContable[]> => {
    const response = await api.get("/contabilidad/cuentas")
    return response.data
  },

  // Reportes
  getBalanzaComprobacion: async (fechaInicio: string, fechaFin: string): Promise<any> => {
    const response = await api.get("/contabilidad/reportes/balanza", {
      params: { fechaInicio, fechaFin },
    })
    return response.data
  },

  getEstadoResultados: async (fechaInicio: string, fechaFin: string): Promise<any> => {
    const response = await api.get("/contabilidad/reportes/estado-resultados", {
      params: { fechaInicio, fechaFin },
    })
    return response.data
  },
}
