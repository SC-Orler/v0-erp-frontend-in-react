"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash2, Phone, Mail } from "lucide-react"
import Table from "@/components/Table"
import Button from "@/components/Button"
import Modal from "@/components/Modal"
import Input from "@/components/Input"
import { proveedoresService } from "@/services/proveedoresService"
import { useUIStore } from "@/store/uiStore"

/**
 * Página de gestión de proveedores
 */
export default function ProveedoresPage() {
  const { addToast } = useUIStore()
  const [proveedores, setProveedores] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedProveedor, setSelectedProveedor] = useState<any>(null)

  const [formData, setFormData] = useState({
    nombre: "",
    rfc: "",
    email: "",
    telefono: "",
    direccion: "",
    contacto: "",
  })

  useEffect(() => {
    loadProveedores()
  }, [])

  const loadProveedores = async () => {
    try {
      const data = await proveedoresService.getProveedores()
      setProveedores(data)
    } catch (error) {
      addToast({ type: "error", message: "Error al cargar proveedores" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (proveedor?: any) => {
    if (proveedor) {
      setSelectedProveedor(proveedor)
      setFormData(proveedor)
    } else {
      setSelectedProveedor(null)
      setFormData({
        nombre: "",
        rfc: "",
        email: "",
        telefono: "",
        direccion: "",
        contacto: "",
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (selectedProveedor) {
        await proveedoresService.updateProveedor(selectedProveedor.id, formData)
        addToast({ type: "success", message: "Proveedor actualizado" })
      } else {
        await proveedoresService.createProveedor(formData)
        addToast({ type: "success", message: "Proveedor creado" })
      }
      setShowModal(false)
      loadProveedores()
    } catch (error) {
      addToast({ type: "error", message: "Error al guardar proveedor" })
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este proveedor?")) {
      try {
        await proveedoresService.deleteProveedor(id)
        addToast({ type: "success", message: "Proveedor eliminado" })
        loadProveedores()
      } catch (error) {
        addToast({ type: "error", message: "Error al eliminar proveedor" })
      }
    }
  }

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "rfc", label: "RFC" },
    {
      key: "contacto",
      label: "Contacto",
      render: (p: any) => (
        <div>
          <p className="font-medium">{p.contacto}</p>
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
            <Phone className="h-3 w-3" />
            <span>{p.telefono}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail className="h-3 w-3" />
            <span>{p.email}</span>
          </div>
        </div>
      ),
    },
    { key: "direccion", label: "Dirección" },
    {
      key: "actions",
      label: "Acciones",
      render: (p: any) => (
        <div className="flex gap-2">
          <button onClick={() => handleOpenModal(p)} className="text-green-600 hover:text-green-700">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-600 mt-1">Gestión de proveedores</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table columns={columns} data={proveedores} />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Nombre de la Empresa"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="RFC"
              value={formData.rfc}
              onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
              required
            />
            <Input
              label="Nombre de Contacto"
              value={formData.contacto}
              onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Teléfono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              required
            />
          </div>

          <Input
            label="Dirección"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {selectedProveedor ? "Actualizar" : "Crear"} Proveedor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
