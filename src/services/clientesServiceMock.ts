/* eslint-disable @typescript-eslint/no-unused-vars */
//import api from "./api"
import { api } from "./api"

export interface Cliente {
  id: string
  nombre: string
  rfc?: string
  email?: string
  telefono?: string
  direccion?: string
  ciudad?: string
  estado?: string
  codigoPostal?: string
  limiteCredito?: number
  saldoPendiente?: number
  activo: boolean
  fechaRegistro: string
  notas?: string
  // Configuración de financiamiento
  tipoFinanciamiento?: "dias" | "monto" | "unidades"
  diasCredito?: number // para "dias": 7, 14, 30, etc.
  montoCredito?: number // para "monto": en pesos
  unidadesCredito?: number // para "unidades": ej. cajas
  // Tipo de precio
  tipoPrecio?: "general" | "mayoreo" | "especial"
}

export interface ClienteFormData {
  nombre: string
  rfc?: string
  email?: string
  telefono?: string
  direccion?: string
  ciudad?: string
  estado?: string
  codigoPostal?: string
  limiteCredito?: number
  activo: boolean
  notas?: string
  // Configuración de financiamiento
  tipoFinanciamiento?: "dias" | "monto" | "unidades"
  diasCredito?: number
  montoCredito?: number
  unidadesCredito?: number
  // Tipo de precio
  tipoPrecio?: "general" | "mayoreo" | "especial"
}

// Utilidad para simular latencia de red
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms))

// Generador simple de IDs
const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

// Base de datos en memoria (mock)
let clientesDb: Cliente[] = [
  {
    id: genId(),
    nombre: "Mariscos el Alamo",
    rfc: "ABC123456789",
    email: "semanal@correo.com",
    telefono: "555-111-2222",
    direccion: "Calle 1 #100",
    ciudad: "CDMX",
    estado: "CDMX",
    codigoPostal: "01000",
    limiteCredito: 0,
    saldoPendiente: 0,
    activo: true,
    fechaRegistro: new Date().toISOString(),
    notas: "Crédito por 7 días",
    tipoFinanciamiento: "dias",
    diasCredito: 7,
    tipoPrecio: "general",
  },
  {
    id: genId(),
    nombre: "Mariscos el Caracol",
    email: "mensual@correo.com",
    telefono: "555-333-4444",
    direccion: "Avenida 5 #50",
    ciudad: "GDL",
    estado: "Jalisco",
    codigoPostal: "44100",
    limiteCredito: 0,
    saldoPendiente: 2500,
    activo: true,
    fechaRegistro: new Date().toISOString(),
    notas: "Crédito por 30 días",
    tipoFinanciamiento: "dias",
    diasCredito: 30,
    tipoPrecio: "mayoreo",
  },
  {
    id: genId(),
    nombre: "Mario Ochoa",
    email: "monto@correo.com",
    telefono: "555-777-8888",
    direccion: "Calle 2 #200",
    ciudad: "MTY",
    estado: "NL",
    codigoPostal: "64000",
    limiteCredito: 0,
    saldoPendiente: 12000,
    activo: true,
    fechaRegistro: new Date().toISOString(),
    notas: "Crédito por monto en pesos",
    tipoFinanciamiento: "monto",
    montoCredito: 20000,
    tipoPrecio: "especial",
  },
  {
    id: genId(),
    nombre: "Mariscos la pitaya",
    email: "unidades@correo.com",
    telefono: "555-999-0000",
    direccion: "Calle 3 #300",
    ciudad: "PUE",
    estado: "Puebla",
    codigoPostal: "72000",
    limiteCredito: 0,
    saldoPendiente: 0,
    activo: true,
    fechaRegistro: new Date().toISOString(),
    notas: "Crédito por unidades (cajas)",
    tipoFinanciamiento: "unidades",
    unidadesCredito: 10,
    tipoPrecio: "general",
  },
]

export const clientesService = {
  getAll: async (): Promise<Cliente[]> => {
    await delay()
    return JSON.parse(JSON.stringify(clientesDb))
  },

  getById: async (id: string): Promise<Cliente> => {
    await delay()
    const found = clientesDb.find((c) => c.id === id)
    if (!found) throw new Error("Cliente no encontrado")
    return JSON.parse(JSON.stringify(found))
  },

  create: async (data: ClienteFormData): Promise<Cliente> => {
    await delay()
    const nuevo: Cliente = {
      id: genId(),
      nombre: data.nombre,
      rfc: data.rfc,
      email: data.email,
      telefono: data.telefono,
      direccion: data.direccion,
      ciudad: data.ciudad,
      estado: data.estado,
      codigoPostal: data.codigoPostal,
      limiteCredito: data.limiteCredito ?? 0,
      saldoPendiente: 0,
      activo: data.activo,
      fechaRegistro: new Date().toISOString(),
      notas: data.notas,
      // financiamiento
      tipoFinanciamiento: data.tipoFinanciamiento,
      diasCredito: data.diasCredito,
      montoCredito: data.montoCredito,
      unidadesCredito: data.unidadesCredito,
      tipoPrecio: data.tipoPrecio,
    }
    clientesDb.unshift(nuevo)
    return JSON.parse(JSON.stringify(nuevo))
  },

  update: async (id: string, data: Partial<ClienteFormData>): Promise<Cliente> => {
    await delay()
    const idx = clientesDb.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error("Cliente no encontrado")

    const current = clientesDb[idx]
    const actualizado: Cliente = {
      ...current,
      ...data,
    }
    clientesDb[idx] = actualizado
    return JSON.parse(JSON.stringify(actualizado))
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    clientesDb = clientesDb.filter((c) => c.id !== id)
  },

  getEstadoCuenta: async (id: string): Promise<any> => {
    await delay()
    const cliente = clientesDb.find((c) => c.id === id)
    if (!cliente) throw new Error("Cliente no encontrado")

    return {
      clienteId: id,
      saldoPendiente: cliente.saldoPendiente ?? 0,
      movimientos: [
        {
          id: genId(),
          fecha: new Date().toISOString(),
          tipo: "cargo",
          descripcion: "Compra en tienda",
          monto: 1500,
        },
        {
          id: genId(),
          fecha: new Date(Date.now() - 86400000).toISOString(),
          tipo: "abono",
          descripcion: "Pago",
          monto: -500,
        },
      ],
    }
  },
}

export default clientesService
