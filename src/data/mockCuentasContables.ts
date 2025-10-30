export const mockCuentasContables = [
  // Activo
  { id: "1", codigo: "1000", nombre: "Activo", tipo: "activo" as const, nivel: 1 },
  { id: "2", codigo: "1100", nombre: "Activo Circulante", tipo: "activo" as const, nivel: 2, padre: "1000" },
  { id: "3", codigo: "1101", nombre: "Caja", tipo: "activo" as const, nivel: 3, padre: "1100" },
  { id: "4", codigo: "1102", nombre: "Bancos", tipo: "activo" as const, nivel: 3, padre: "1100" },
  { id: "5", codigo: "1103", nombre: "Clientes", tipo: "activo" as const, nivel: 3, padre: "1100" },
  { id: "6", codigo: "1104", nombre: "Inventarios", tipo: "activo" as const, nivel: 3, padre: "1100" },

  // Pasivo
  { id: "7", codigo: "2000", nombre: "Pasivo", tipo: "pasivo" as const, nivel: 1 },
  { id: "8", codigo: "2100", nombre: "Pasivo Circulante", tipo: "pasivo" as const, nivel: 2, padre: "2000" },
  { id: "9", codigo: "2101", nombre: "Proveedores", tipo: "pasivo" as const, nivel: 3, padre: "2100" },
  { id: "10", codigo: "2102", nombre: "Acreedores", tipo: "pasivo" as const, nivel: 3, padre: "2100" },

  // Capital
  { id: "11", codigo: "3000", nombre: "Capital", tipo: "capital" as const, nivel: 1 },
  { id: "12", codigo: "3101", nombre: "Capital Social", tipo: "capital" as const, nivel: 2, padre: "3000" },
  { id: "13", codigo: "3102", nombre: "Utilidad del Ejercicio", tipo: "capital" as const, nivel: 2, padre: "3000" },

  // Ingresos
  { id: "14", codigo: "4000", nombre: "Ingresos", tipo: "ingreso" as const, nivel: 1 },
  { id: "15", codigo: "4101", nombre: "Ventas", tipo: "ingreso" as const, nivel: 2, padre: "4000" },
  { id: "16", codigo: "4102", nombre: "Otros Ingresos", tipo: "ingreso" as const, nivel: 2, padre: "4000" },

  // Egresos
  { id: "17", codigo: "5000", nombre: "Egresos", tipo: "egreso" as const, nivel: 1 },
  { id: "18", codigo: "5101", nombre: "Costo de Ventas", tipo: "egreso" as const, nivel: 2, padre: "5000" },
  { id: "19", codigo: "5102", nombre: "Gastos de Operación", tipo: "egreso" as const, nivel: 2, padre: "5000" },
  { id: "20", codigo: "5103", nombre: "Gastos Administrativos", tipo: "egreso" as const, nivel: 2, padre: "5000" },
]
