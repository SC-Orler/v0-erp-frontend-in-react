import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./app/login/page"
import DashboardPage from "./app/dashboard/page"
import ProtectedLayout from "./app/(protected)/layout"
import POSPage from "./app/(protected)/pos/page"
import VentasPage from "./app/(protected)/ventas/page"
import FacturasPage from "./app/(protected)/facturas/page"
import InventarioPage from "./app/(protected)/inventario/page"
import CajaPage from "./app/(protected)/caja/page"
import ProveedoresPage from "./app/(protected)/proveedores/page"
import ComprasPage from "./app/(protected)/compras/page"
import ClientesPage from "./app/(protected)/clientes/page"
import UsuariosPage from "./app/(protected)/usuarios/page"
import ContabilidadPage from "./app/(protected)/contabilidad/page"
import ReportesPage from "./app/(protected)/reportes/page"
import NominaPage from "./app/(protected)/nomina/page"
import EmpleadosPage from "./app/(protected)/nomina/empleados/page"
import { useAuthStore } from "./store/authStore"

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <ProtectedLayout>
              <Navigate to="/dashboard" replace />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/pos"
        element={
          <ProtectedLayout>
            <POSPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/ventas"
        element={
          <ProtectedLayout>
            <VentasPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/facturas"
        element={
          <ProtectedLayout>
            <FacturasPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/inventario"
        element={
          <ProtectedLayout>
            <InventarioPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/caja"
        element={
          <ProtectedLayout>
            <CajaPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/proveedores"
        element={
          <ProtectedLayout>
            <ProveedoresPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/compras"
        element={
          <ProtectedLayout>
            <ComprasPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/clientes"
        element={
          <ProtectedLayout>
            <ClientesPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedLayout>
            <UsuariosPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/contabilidad"
        element={
          <ProtectedLayout>
            <ContabilidadPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/reportes"
        element={
          <ProtectedLayout>
            <ReportesPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/nomina"
        element={
          <ProtectedLayout>
            <NominaPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/nomina/empleados"
        element={
          <ProtectedLayout>
            <EmpleadosPage />
          </ProtectedLayout>
        }
      />
    </Routes>
  )
}

export default App
