//import api from "./api"
import { api } from "./api"

export interface Empleado {
  id: string
  nombre: string
  rfc: string
  nss: string
  curp: string
  puesto: string
  salarioDiario: number
  salarioMensual: number
  fechaIngreso: string
  activo: boolean
  email?: string
  telefono?: string
}

export interface EmpleadoFormData {
  nombre: string
  rfc: string
  nss: string
  curp: string
  puesto: string
  salarioDiario: number
  fechaIngreso: string
  activo: boolean
  email?: string
  telefono?: string
}

export interface Nomina {
  id: string
  periodo: string
  fechaInicio: string
  fechaFin: string
  fechaPago: string
  estatus: "borrador" | "calculada" | "pagada" | "timbrada"
  totalPercepciones: number
  totalDeducciones: number
  totalNeto: number
  empleados: NominaEmpleado[]
  fechaCreacion: string
}

export interface NominaEmpleado {
  id: string
  empleadoId: string
  empleadoNombre: string
  diasTrabajados: number
  percepciones: Percepcion[]
  deducciones: Deduccion[]
  totalPercepciones: number
  totalDeducciones: number
  neto: number
}

export interface Percepcion {
  concepto: string
  clave: string
  monto: number
}

export interface Deduccion {
  concepto: string
  clave: string
  monto: number
}

export interface NominaFormData {
  periodo: string
  fechaInicio: string
  fechaFin: string
  fechaPago: string
  empleados: {
    empleadoId: string
    diasTrabajados: number
    horasExtra?: number
    bonos?: number
    otrasPercepciones?: number
    faltas?: number
  }[]
}

export const nominaService = {
  // Empleados
  getEmpleados: async (): Promise<Empleado[]> => {
    const response = await api.get("/nomina/empleados")
    return response.data
  },

  getEmpleadoById: async (id: string): Promise<Empleado> => {
    const response = await api.get(`/nomina/empleados/${id}`)
    return response.data
  },

  createEmpleado: async (data: EmpleadoFormData): Promise<Empleado> => {
    const response = await api.post("/nomina/empleados", data)
    return response.data
  },

  updateEmpleado: async (id: string, data: Partial<EmpleadoFormData>): Promise<Empleado> => {
    const response = await api.put(`/nomina/empleados/${id}`, data)
    return response.data
  },

  deleteEmpleado: async (id: string): Promise<void> => {
    await api.delete(`/nomina/empleados/${id}`)
  },

  // Nóminas
  getNominas: async (): Promise<Nomina[]> => {
    const response = await api.get("/nomina/nominas")
    return response.data
  },

  getNominaById: async (id: string): Promise<Nomina> => {
    const response = await api.get(`/nomina/nominas/${id}`)
    return response.data
  },

  createNomina: async (data: NominaFormData): Promise<Nomina> => {
    const response = await api.post("/nomina/nominas", data)
    return response.data
  },

  calcularNomina: async (id: string): Promise<Nomina> => {
    const response = await api.post(`/nomina/nominas/${id}/calcular`)
    return response.data
  },

  pagarNomina: async (id: string): Promise<Nomina> => {
    const response = await api.post(`/nomina/nominas/${id}/pagar`)
    return response.data
  },

  timbrarNomina: async (id: string): Promise<Nomina> => {
    const response = await api.post(`/nomina/nominas/${id}/timbrar`)
    return response.data
  },

  descargarRecibo: async (nominaId: string, empleadoId: string): Promise<Blob> => {
    const response = await api.get(`/nomina/nominas/${nominaId}/recibos/${empleadoId}`, {
      responseType: "blob",
    })
    return response.data
  },
}
