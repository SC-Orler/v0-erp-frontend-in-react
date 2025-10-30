"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Search, Plus, Edit2, Trash2 } from "lucide-react"
import Button from "@/components/Button"
import Input from "@/components/Input"
import Table from "@/components/Table"
import Modal from "@/components/Modal"
import Alert from "@/components/Alert"
import { usuariosService, type Usuario, type UsuarioFormData } from "@/services/usuariosService"
import { useUIStore } from "@/store/uiStore"
import { formatDate } from "@/utils/helpers"

export default function UsuariosPage() {
  const { addToast } = useUIStore()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState<UsuarioFormData>({
    nombre: "",
    email: "",
    password: "",
    rol: "cajero",
    activo: true,
  })

  useEffect(() => {
    loadUsuarios()
  }, [])

  useEffect(() => {
    filterUsuarios()
  }, [searchTerm, usuarios])

  const loadUsuarios = async () => {
    try {
      const data = await usuariosService.getAll()
      setUsuarios(data)
      setFilteredUsuarios(data)
    } catch (error) {
      addToast({ type: "error", message: "Error al cargar usuarios" })
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsuarios = () => {
    if (!searchTerm) {
      setFilteredUsuarios(usuarios)
      return
    }

    const filtered = usuarios.filter(
      (usuario) =>
        usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.rol.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsuarios(filtered)
  }

  const handleOpenModal = (usuario?: Usuario) => {
    if (usuario) {
      setSelectedUsuario(usuario)
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password: "",
        rol: usuario.rol,
        activo: usuario.activo,
      })
    } else {
      setSelectedUsuario(null)
      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol: "cajero",
        activo: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedUsuario(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (selectedUsuario) {
        const updateData = { ...formData }
        if (!updateData.password) {
          delete updateData.password
        }
        await usuariosService.update(selectedUsuario.id, updateData)
        addToast({ type: "success", message: "Usuario actualizado correctamente" })
      } else {
        if (!formData.password) {
          addToast({ type: "error", message: "La contraseña es requerida para nuevos usuarios" })
          return
        }
        await usuariosService.create(formData)
        addToast({ type: "success", message: "Usuario creado correctamente" })
      }
      handleCloseModal()
      loadUsuarios()
    } catch (error) {
      addToast({ type: "error", message: "Error al guardar usuario" })
    }
  }

  const handleDelete = async () => {
    if (!selectedUsuario) return

    try {
      await usuariosService.delete(selectedUsuario.id)
      addToast({ type: "success", message: "Usuario eliminado correctamente" })
      setShowDeleteAlert(false)
      setSelectedUsuario(null)
      loadUsuarios()
    } catch (error) {
      addToast({ type: "error", message: "Error al eliminar usuario" })
    }
  }

  const getRolBadge = (rol: string) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      cajero: "bg-blue-100 text-blue-800",
      contabilidad: "bg-green-100 text-green-800",
      almacen: "bg-yellow-100 text-yellow-800",
    }
    return colors[rol as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "email", label: "Email" },
    {
      key: "rol",
      label: "Rol",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getRolBadge(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
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
      key: "ultimoAcceso",
      label: "Último Acceso",
      render: (value: string) => (value ? formatDate(value) : "Nunca"),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_: any, row: Usuario) => (
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
              setSelectedUsuario(row)
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
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <Button onClick={() => handleOpenModal()} icon={Plus}>
          Nuevo Usuario
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <Input
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>

        <Table columns={columns} data={filteredUsuarios} />
      </div>

      {/* Modal de formulario */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={selectedUsuario ? "Editar Usuario" : "Nuevo Usuario"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre *"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />

          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label={selectedUsuario ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña *"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!selectedUsuario}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="cajero">Cajero</option>
              <option value="almacen">Almacén</option>
              <option value="contabilidad">Contabilidad</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Usuario activo</span>
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {selectedUsuario ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Alert de confirmación de eliminación */}
      <Alert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario "${selectedUsuario?.nombre}"?`}
        type="danger"
      />
    </div>
  )
}
