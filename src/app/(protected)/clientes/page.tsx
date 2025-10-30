"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Search, Plus, Edit2, Trash2 } from "lucide-react"
import Button from "@/components/Button"
import Input from "@/components/Input"
import Table from "@/components/Table"
import Modal from "@/components/Modal"
import Alert from "@/components/Alert"
import { clientesService, type Cliente, type ClienteFormData } from "@/services/clientesService"
import { useUIStore } from "@/store/uiStore"
import { formatCurrency } from "@/utils/helpers"

export default function ClientesPage() {
  const { addToast } = useUIStore()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [formData, setFormData] = useState<ClienteFormData>({
    nombre: "",
    rfc: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    limiteCredito: 0,
    activo: true,
    notas: "",
  })

  useEffect(() => {
    loadClientes()
  }, [])

  useEffect(() => {
    filterClientes()
  }, [searchTerm, clientes])

  const loadClientes = async () => {
    try {
      const data = await clientesService.getAll()
      setClientes(data)
      setFilteredClientes(data)
    } catch (error) {
      addToast({ type: "error", message: "Error al cargar clientes" })
    } finally {
      setIsLoading(false)
    }
  }

  const filterClientes = () => {
    if (!searchTerm) {
      setFilteredClientes(clientes)
      return
    }

    const filtered = clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredClientes(filtered)
  }

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setSelectedCliente(cliente)
      setFormData({
        nombre: cliente.nombre,
        rfc: cliente.rfc,
        email: cliente.email,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
        ciudad: cliente.ciudad,
        estado: cliente.estado,
        codigoPostal: cliente.codigoPostal,
        limiteCredito: cliente.limiteCredito,
        activo: cliente.activo,
        notas: cliente.notas,
      })
    } else {
      setSelectedCliente(null)
      setFormData({
        nombre: "",
        rfc: "",
        email: "",
        telefono: "",
        direccion: "",
        ciudad: "",
        estado: "",
        codigoPostal: "",
        limiteCredito: 0,
        activo: true,
        notas: "",
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedCliente(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (selectedCliente) {
        await clientesService.update(selectedCliente.id, formData)
        addToast({ type: "success", message: "Cliente actualizado correctamente" })
      } else {
        await clientesService.create(formData)
        addToast({ type: "success", message: "Cliente creado correctamente" })
      }
      handleCloseModal()
      loadClientes()
    } catch (error) {
      addToast({ type: "error", message: "Error al guardar cliente" })
    }
  }

  const handleDelete = async () => {
    if (!selectedCliente) return

    try {
      await clientesService.delete(selectedCliente.id)
      addToast({ type: "success", message: "Cliente eliminado correctamente" })
      setShowDeleteAlert(false)
      setSelectedCliente(null)
      loadClientes()
    } catch (error) {
      addToast({ type: "error", message: "Error al eliminar cliente" })
    }
  }

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "rfc", label: "RFC" },
    { key: "email", label: "Email" },
    { key: "telefono", label: "Teléfono" },
    {
      key: "limiteCredito",
      label: "Límite Crédito",
      render: (value: number) => formatCurrency(value || 0),
    },
    {
      key: "saldoPendiente",
      label: "Saldo Pendiente",
      render: (value: number) => (
        <span className={value > 0 ? "text-red-600 font-semibold" : "text-gray-600"}>{formatCurrency(value || 0)}</span>
      ),
    },
    {
      key: "activo",
      label: "Estado",
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {value ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_: any, row: Cliente) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Editar"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedCliente(row)
              setShowDeleteAlert(true)
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Button onClick={() => handleOpenModal()} icon={Plus}>
          Nuevo Cliente
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <Input
            placeholder="Buscar por nombre, RFC o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>

        <Table columns={columns} data={filteredClientes} />
      </div>

      {/* Modal de formulario */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={selectedCliente ? "Editar Cliente" : "Nuevo Cliente"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre *"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
            <Input
              label="RFC"
              value={formData.rfc}
              onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            />
            <Input
              label="Dirección"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            />
            <Input
              label="Ciudad"
              value={formData.ciudad}
              onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
            />
            <Input
              label="Estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            />
            <Input
              label="Código Postal"
              value={formData.codigoPostal}
              onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
            />
            <Input
              label="Límite de Crédito"
              type="number"
              value={formData.limiteCredito?.toString()}
              onChange={(e) => setFormData({ ...formData, limiteCredito: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Cliente activo</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {selectedCliente ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Alert de confirmación de eliminación */}
      <Alert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleDelete}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente "${selectedCliente?.nombre}"?`}
        type="danger"
      />
    </div>
  )
}
