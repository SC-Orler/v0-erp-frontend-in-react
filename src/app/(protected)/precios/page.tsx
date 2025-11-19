"use client"

import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Save } from "lucide-react"
import Button from "@/components/Button"
import Input from "@/components/Input"
import Table from "@/components/Table"
import Modal from "@/components/Modal"
import ConfirmDialog from "@/components/ConfirmDialog"
import preciosServiceMock, { type TipoPrecioConfig } from "@/services/preciosServiceMock"

export default function TiposPrecioPage() {
  const [tipos, setTipos] = useState<TipoPrecioConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<TipoPrecioConfig | null>(null)
  const [form, setForm] = useState<{ clave: string; nombre: string; cargo: number; activo: boolean }>(
    { clave: "", nombre: "", cargo: 0, activo: true },
  )
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const data = await preciosServiceMock.getAll()
      setTipos(data)
    } finally {
      setIsLoading(false)
    }
  }

  const openNew = () => {
    setSelected(null)
    setForm({ clave: "", nombre: "", cargo: 0, activo: true })
    setShowModal(true)
  }

  const openEdit = (t: TipoPrecioConfig) => {
    setSelected(t)
    setForm({ clave: t.clave, nombre: t.nombre, cargo: t.cargo, activo: t.activo })
    setShowModal(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selected) {
        await preciosServiceMock.update(selected.id, form)
      } else {
        await preciosServiceMock.create(form)
      }
      setShowModal(false)
      await load()
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const confirmDelete = (t: TipoPrecioConfig) => {
    setSelected(t)
    setShowDelete(true)
  }

  const doDelete = async () => {
    if (!selected) return
    try {
      await preciosServiceMock.delete(selected.id)
      setShowDelete(false)
      setSelected(null)
      await load()
    } catch (err) {
      alert("No se pudo eliminar")
    }
  }

  const columns = [
    { key: "clave", label: "Clave" },
    { key: "nombre", label: "Nombre" },
    {
      key: "cargo",
      label: "Cargo (MXN)",
      render: (row: TipoPrecioConfig) => `$${row.cargo.toFixed(2)}`,
    },
    {
      key: "activo",
      label: "Estado",
      render: (row: TipoPrecioConfig) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
          {row.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (row: TipoPrecioConfig) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Editar">
            <Edit2 size={16} />
          </button>
          <button onClick={() => confirmDelete(row)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Eliminar">
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
        <h1 className="text-3xl font-bold text-gray-900">Tipos de precio</h1>
        <Button onClick={openNew} icon={Plus}>Nuevo Tipo</Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <Table columns={columns} data={tipos} />
      </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? "Editar tipo" : "Nuevo tipo"}>
          <form onSubmit={save} className="space-y-4">
            <Input label="Clave *" value={form.clave} onChange={(e) => setForm({ ...form, clave: e.target.value })} required />
            <Input label="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            <Input label="Cargo (MXN)" type="number" value={form.cargo.toString()} onChange={(e) => setForm({ ...form, cargo: Number(e.target.value) })} />

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
              Activo
            </label>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button type="submit" icon={Save}>Guardar</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={doDelete}
          title="Eliminar Tipo"
          message={`¿Eliminar el tipo "${selected?.nombre ?? ""}"?`}
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
    </div>
  )
}
