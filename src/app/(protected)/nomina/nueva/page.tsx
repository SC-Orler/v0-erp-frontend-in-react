"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Button from "@/components/Button"
import Input from "@/components/Input"
import { nominaService } from "@/services/nominaService"
import { useUIStore } from "@/store/uiStore"

interface EmpleadoNomina {
  empleadoId: string
  empleadoNombre: string
  diasTrabajados: number
  salarioDiario: number
}

export default function NuevaNominaPage() {
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    periodo: "",
    fechaInicio: "",
    fechaFin: "",
    fechaPago: "",
  })

  const [empleados, setEmpleados] = useState<EmpleadoNomina[]>([])
  const [showEmpleadoForm, setShowEmpleadoForm] = useState(false)
  const [empleadoForm, setEmpleadoForm] = useState({
    empleadoId: "",
    empleadoNombre: "",
    diasTrabajados: 15,
    salarioDiario: 0,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmpleadoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmpleadoForm((prev) => ({
      ...prev,
      [name]: name === "diasTrabajados" || name === "salarioDiario" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleAddEmpleado = () => {
    if (!empleadoForm.empleadoNombre || empleadoForm.salarioDiario <= 0) {
      addToast({ type: "error", message: "Complete los datos del empleado" })
      return
    }

    setEmpleados((prev) => [
      ...prev,
      {
        ...empleadoForm,
        empleadoId: `emp-${Date.now()}`,
      },
    ])

    setEmpleadoForm({
      empleadoId: "",
      empleadoNombre: "",
      diasTrabajados: 15,
      salarioDiario: 0,
    })
    setShowEmpleadoForm(false)
  }

  const handleRemoveEmpleado = (empleadoId: string) => {
    setEmpleados((prev) => prev.filter((emp) => emp.empleadoId !== empleadoId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.periodo || !formData.fechaInicio || !formData.fechaFin || !formData.fechaPago) {
      addToast({ type: "error", message: "Complete todos los campos requeridos" })
      return
    }

    if (empleados.length === 0) {
      addToast({ type: "error", message: "Agregue al menos un empleado" })
      return
    }

    setIsSubmitting(true)

    try {
      await nominaService.createNomina({
        ...formData,
        empleados: empleados.map((emp) => ({
          empleadoId: emp.empleadoId,
          diasTrabajados: emp.diasTrabajados,
        })),
      })

      addToast({ type: "success", message: "Nómina creada correctamente" })
      navigate("/nomina")
    } catch (error) {
      addToast({ type: "error", message: "Error al crear nómina" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/nomina")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Nueva Nómina</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Información General</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Período"
              name="periodo"
              value={formData.periodo}
              onChange={handleInputChange}
              placeholder="Ej: Quincenal 01/2025"
              required
            />
            <Input
              label="Fecha de Pago"
              name="fechaPago"
              type="date"
              value={formData.fechaPago}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Fecha de Inicio"
              name="fechaInicio"
              type="date"
              value={formData.fechaInicio}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Fecha de Fin"
              name="fechaFin"
              type="date"
              value={formData.fechaFin}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Empleados</h2>
            <Button type="button" onClick={() => setShowEmpleadoForm(true)} icon={Plus} variant="secondary">
              Agregar Empleado
            </Button>
          </div>

          {showEmpleadoForm && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Nombre del Empleado"
                  name="empleadoNombre"
                  value={empleadoForm.empleadoNombre}
                  onChange={handleEmpleadoInputChange}
                  placeholder="Nombre completo"
                />
                <Input
                  label="Días Trabajados"
                  name="diasTrabajados"
                  type="number"
                  value={empleadoForm.diasTrabajados}
                  onChange={handleEmpleadoInputChange}
                  min="1"
                  max="31"
                />
                <Input
                  label="Salario Diario"
                  name="salarioDiario"
                  type="number"
                  value={empleadoForm.salarioDiario}
                  onChange={handleEmpleadoInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={handleAddEmpleado}>
                  Agregar
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowEmpleadoForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {empleados.length > 0 ? (
            <div className="space-y-2">
              {empleados.map((emp) => (
                <div key={emp.empleadoId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{emp.empleadoNombre}</p>
                    <p className="text-sm text-gray-600">
                      {emp.diasTrabajados} días × ${emp.salarioDiario.toFixed(2)} = $
                      {(emp.diasTrabajados * emp.salarioDiario).toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmpleado(emp.empleadoId)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No hay empleados agregados. Haga clic en "Agregar Empleado" para comenzar.
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear Nómina"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/nomina")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
