import { api } from "./api"

interface Factura {
  id: number
  folio: string
  uuid: string
  fecha: string
  clienteId: number
  clienteNombre: string
  rfc: string
  subtotal: number
  iva: number
  total: number
  estado: "vigente" | "cancelada"
  pdfUrl: string
  xmlUrl: string
  ventaId: number
}

/**
 * Servicio de facturas CFDI
 */
export const facturasService = {
  /**
   * Obtener todas las facturas
   */
  async getFacturas(params?: {
    start?: string
    end?: string
    clienteId?: number
    estado?: string
  }): Promise<Factura[]> {
    const response = await api.get<Factura[]>("/facturas", { params })
    return response.data
  },

  /**
   * Obtener una factura por ID
   */
  async getFacturaById(id: number): Promise<Factura> {
    const response = await api.get<Factura>(`/facturas/${id}`)
    return response.data
  },

  /**
   * Cancelar una factura
   */
  async cancelarFactura(id: number, motivo: string): Promise<void> {
    await api.post(`/facturas/${id}/cancelar`, { motivo })
  },

  /**
   * Descargar PDF de factura
   */
  async downloadPDF(id: number): Promise<Blob> {
    const response = await api.get(`/facturas/${id}/pdf`, {
      responseType: "blob",
    })
    return response.data
  },

  /**
   * Descargar XML de factura
   */
  async downloadXML(id: number): Promise<Blob> {
    const response = await api.get(`/facturas/${id}/xml`, {
      responseType: "blob",
    })
    return response.data
  },
}
