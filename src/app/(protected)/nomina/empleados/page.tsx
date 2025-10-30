"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Search, Plus, Edit2, Trash2 } from "lucide-react"
import Button from "@/components/Button"
import Input from "@/components/Input"
import Table from "@/components/Table"
import Modal from "@/components/Modal"
import Alert from "@/components/Alert"
import { nominaService, type Empleado, type EmpleadoFormData } from "@/services/nominaService"
import { useUIStore } from "@/store/uiStore"
import { formatCurrency, formatDate } from "@/utils/helpers"

export default function EmpleadosPage() {
  const { addToast } = useUIStore()
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [filteredEmpleados, setFilteredEmpleados] = useState<Empleado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null)
  const [formData, setFormData] = useState<EmpleadoFormData>({
    nombre: "",
    rfc: "",
    nss: "",
    curp: "",
    puesto: "",
    salarioDiario: 0,
    fechaIngreso: new Date().toISOString().split("T")[0],
    activo: true,
    email: "",
    telefono: "",
  })

  useEffect(() => {
    loadEmpleados()
  }, [])

  useEffect(() => {
    filterEmpleados()
  }, [searchTerm, empleados])

  const loadEmpleados = async () => {
    try {
      const data = await nominaService.getEmpleados()
      setEmpleados(data)
      setFilteredEmpleados(data)
    } catch (error) {
      addToast({ type: "error", message: "Error al cargar empleados" })
    } finally {
      setIsLoading(false)
    }
  }

  const filterEmpleados = () => {
    if (!searchTerm) {
      setFilteredEmpleados(empleados)
      return
    }

    const filtered = empleados.filter(
      (empleado) =>
        empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.puesto.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredEmpleados(filtered)
  }

  const handleOpenModal = (empleado?: Empleado) => {
    if (empleado) {
      setSelectedEmpleado(empleado)
      setFormData({
        nombre: empleado.nombre,
        rfc: empleado.rfc,
        nss: empleado.nss,
        curp: empleado.curp,
        puesto: empleado.puesto,
        salarioDiario: empleado.salarioDiario,
        fechaIngreso: empleado.fechaIngreso,
        activo: empleado.activo,
        email: empleado.email,
        telefono: empleado.telefono,
      })
    } else {
      setSelectedEmpleado(null)
      setFormData({
        nombre: "",
        rfc: "",
        nss: "",
        curp: "",
        puesto: "",
        salarioDiario: 0,
        fechaIngreso: new Date().toISOString().split("T")[0],
        activo: true,
        email: "",
        telefono: "",
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedEmpleado(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (selectedEmpleado) {
        await nominaService.updateEmpleado(selectedEmpleado.id, formData)
        addToast({ type: "success", message: "Empleado actualizado correctamente" })
      } else {
        await nominaService.createEmpleado(formData)
        addToast({ type: "success", message: "Empleado creado correctamente" })
      }
      handleCloseModal()
      loadEmpleados()
    } catch (error) {
      addToast({ type: "error", message: "Error al guardar empleado" })
    }
  }

  const handleDelete = async () => {
    if (!selectedEmpleado) return

    try {
      await nominaService.deleteEmpleado(selectedEmpleado.id)
      addToast({ type: "success", message: "Empleado eliminado correctamente" })
      setShowDeleteAlert(false)
      setSelectedEmpleado(null)
      loadEmpleados()
    } catch (error) {
      addToast({ type: "error", message: "Error al eliminar empleado" })
    }
  }

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "rfc", label: "RFC" },
    { key: "puesto", label: "Puesto" },
    {
      key: "salarioDiario",
      label: "Salario Diario",
      render: (value: number) => formatCurrency(value),
    },
    {
      key: "salarioMensual",
      label: "Salario Mensual",
      render: (value: number) => formatCurrency(value),
    },
    {
      key: "fechaIngreso",
      label: "Fecha Ingreso",
      render: (value: string) => formatDate(value),
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
      render: (_: any, row: Empleado) => (
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
              setSelectedEmpleado(row)
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
        <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
        <Button onClick={() => handleOpenModal()} icon={Plus}>
          Nuevo Empleado
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <Input
            placeholder="Buscar por nombre, RFC o puesto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>

        <Table columns={columns} data={filteredEmpleados} />
      </div>

      {/* Modal de formulario */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedEmpleado ? "Editar Empleado" : "Nuevo Empleado"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre Completo *"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="RFC *"
              value={formData.rfc}
              onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
              required
            />
            <Input
              label="NSS *"
              value={formData.nss}
              onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
              required
            />
            <Input
              label="CURP *"
              value={formData.curp}
              onChange={(e) => setFormData({ ...formData, curp: e.target.value })}
              required
            />
            <Input
              label="Puesto *"
              value={formData.puesto}
              onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
              required
            />
            <Input
              label="Salario Diario *"
              type="number"
              step="0.01"
              value={formData.salarioDiario.toString()}
              onChange={(e) => setFormData({ ...formData, salarioDiario: Number(e.target.value) })}
              required
            />
            <Input
              label="Fecha de Ingreso *"
              type="date"
              value={formData.fechaIngreso}
              onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
              required
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
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Empleado activo</span>
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {selectedEmpleado ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Alert de confirmación de eliminación */}
      <Alert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleDelete}
        title="Eliminar Empleado"
        message={`¿Estás seguro de que deseas eliminar al empleado "${selectedEmpleado?.nombre}"?`}
        type="danger"
      />
    </div>
  )
}
