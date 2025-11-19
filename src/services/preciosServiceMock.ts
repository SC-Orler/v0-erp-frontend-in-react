export interface TipoPrecioConfig {
  id: string
  clave: string // identificador estable, ej. "general", "mayoreo", "especial"
  nombre: string // etiqueta visible
  cargo: number // monto en pesos a sumar (puede ser negativo si es descuento)
  activo: boolean
}

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms))
const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

let tiposPrecioDb: TipoPrecioConfig[] = [
  { id: genId(), clave: "general", nombre: "General", cargo: 0, activo: true },
  { id: genId(), clave: "mayoreo", nombre: "Mayoreo", cargo: 5, activo: true },
  { id: genId(), clave: "especial", nombre: "Especial", cargo: 8, activo: true },
]

export const preciosServiceMock = {
  async getAll(): Promise<TipoPrecioConfig[]> {
    await delay()
    // retornar copia
    return JSON.parse(JSON.stringify(tiposPrecioDb))
  },

  async create(data: { clave: string; nombre: string; cargo: number; activo?: boolean }): Promise<TipoPrecioConfig> {
    await delay()
    if (tiposPrecioDb.some((t) => t.clave === data.clave)) {
      throw new Error("Ya existe un tipo de precio con esa clave")
    }
    const nuevo: TipoPrecioConfig = { id: genId(), activo: true, ...data, activo: data.activo ?? true }
    tiposPrecioDb.push(nuevo)
    return JSON.parse(JSON.stringify(nuevo))
  },

  async update(id: string, data: Partial<Omit<TipoPrecioConfig, "id">>): Promise<TipoPrecioConfig> {
    await delay()
    const idx = tiposPrecioDb.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error("Tipo de precio no encontrado")

    // Validar clave duplicada si cambia
    if (data.clave && tiposPrecioDb.some((t, i) => i !== idx && t.clave === data.clave)) {
      throw new Error("Ya existe un tipo de precio con esa clave")
    }

    const actualizado = { ...tiposPrecioDb[idx], ...data }
    tiposPrecioDb[idx] = actualizado
    return JSON.parse(JSON.stringify(actualizado))
  },

  async delete(id: string): Promise<void> {
    await delay()
    tiposPrecioDb = tiposPrecioDb.filter((t) => t.id !== id)
  },
}

export default preciosServiceMock
