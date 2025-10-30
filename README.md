# ERP Lite Frontend

Sistema ERP completo para gestión de tiendas y negocios con soporte para:
- Punto de Venta (POS)
- Ventas con y sin factura (CFDI vía FacturAPI)
- Inventario avanzado
- Compras y proveedores
- Clientes y CRM
- Usuarios y roles
- Reportes y exportación
- Nómina
- Cortes de caja
- Contabilidad básica

## Tecnologías

- React 18+
- Vite 5+ (build tool)
- React Router v6 (routing)
- TypeScript
- Tailwind CSS v4
- Axios (HTTP client)
- Zustand (estado global)
- React Hook Form (formularios)
- Recharts (gráficas)
- jsPDF & XLSX (exportación)

## Instalación

1. Clonar el repositorio

2. Instalar dependencias:
\`\`\`bash
npm install
# o
bun install
\`\`\`

3. Configurar variables de entorno:
\`\`\`bash
cp .env.example .env
\`\`\`

Editar `.env` con la URL de tu backend:
\`\`\`
VITE_API_URL=http://localhost:3001/api
\`\`\`

4. Ejecutar en modo desarrollo:
\`\`\`bash
npm run dev
# o
bun dev
\`\`\`

5. Abrir http://localhost:5173

## Estructura del Proyecto

\`\`\`
src/
├── app/                    # Páginas de la aplicación
│   ├── login/             # Página de login
│   ├── dashboard/         # Dashboard principal
│   ├── (protected)/       # Rutas protegidas
│   │   ├── pos/           # Punto de venta
│   │   ├── ventas/        # Gestión de ventas
│   │   ├── facturas/      # Facturas CFDI
│   │   ├── inventario/    # Inventario
│   │   ├── compras/       # Compras
│   │   ├── proveedores/   # Proveedores
│   │   ├── clientes/      # Clientes
│   │   ├── usuarios/      # Usuarios
│   │   ├── reportes/      # Reportes
│   │   ├── nomina/        # Nómina
│   │   ├── contabilidad/  # Contabilidad
│   │   ├── crm/           # CRM
│   │   └── caja/          # Cortes de caja
├── components/            # Componentes reutilizables
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Table.tsx
│   ├── Modal.tsx
│   ├── Alert.tsx
│   ├── Toggle.tsx
│   ├── Pagination.tsx
│   ├── Sidebar.tsx
│   ├── ToastContainer.tsx
│   └── MetricCard.tsx
├── services/              # Servicios API (Axios)
│   ├── api.ts            # Configuración base de Axios
│   ├── authService.ts
│   ├── ventasService.ts
│   ├── facturasService.ts
│   ├── inventarioService.ts
│   ├── comprasService.ts
│   ├── proveedoresService.ts
│   ├── clientesService.ts
│   ├── usuariosService.ts
│   ├── reportesService.ts
│   ├── nominaService.ts
│   ├── contabilidadService.ts
│   └── cajaService.ts
├── store/                 # Zustand stores
│   ├── authStore.ts      # Estado de autenticación
│   └── uiStore.ts        # Estado de UI (toasts, modals)
├── utils/                 # Utilidades
│   └── helpers.ts        # Funciones auxiliares
├── mocks/                 # Datos de ejemplo
│   └── sampleData.ts     # Mock data para desarrollo
├── data/                  # Datos estáticos
│   ├── mockCuentasContables.ts
│   └── mockEmpleados.ts
├── App.tsx               # Componente principal con rutas
├── main.tsx              # Punto de entrada
└── index.css             # Estilos globales
\`\`\`

## Usuarios de Prueba

Para desarrollo con datos mock:

- **Admin**: admin@empresa.com / admin123
- **Cajero**: cajero@empresa.com / cajero123
- **Contabilidad**: conta@empresa.com / conta123

## Flujo de Trabajo

### Punto de Venta (POS)
1. Abrir caja (apertura de turno)
2. Agregar productos al carrito
3. Seleccionar si requiere factura
4. Si requiere factura, seleccionar cliente
5. Elegir método de pago
6. Procesar venta
7. Imprimir ticket o descargar factura

### Cortes de Caja
1. Apertura: registrar monto inicial
2. Durante el turno: todas las ventas se asocian a la caja abierta
3. Cierre: contar efectivo, registrar totales por método de pago
4. Sistema calcula diferencias y genera reporte

### Facturación
- Ventas con factura se timbran automáticamente vía FacturAPI
- Descargar PDF y XML desde el módulo de facturas
- Cancelar facturas con motivo

## API Endpoints

El frontend espera los siguientes endpoints en el backend:

### Autenticación
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Ventas
- GET /api/ventas
- POST /api/ventas
- GET /api/ventas/:id

### Facturas
- GET /api/facturas
- POST /api/facturas/:id/cancelar
- GET /api/facturas/:id/pdf
- GET /api/facturas/:id/xml

### Inventario
- GET /api/productos
- POST /api/productos
- PUT /api/productos/:id
- DELETE /api/productos/:id
- POST /api/inventario/movimiento

### Caja
- POST /api/caja/apertura
- POST /api/caja/cierre
- GET /api/caja
- GET /api/caja/:id

### Clientes
- GET /api/clientes
- POST /api/clientes
- PUT /api/clientes/:id
- DELETE /api/clientes/:id

### Reportes
- GET /api/reportes/dashboard
- GET /api/reportes/ventas
- GET /api/reportes/inventario

## Características

- ✅ Responsive design (desktop/tablet)
- ✅ Protección de rutas por rol
- ✅ Búsqueda y filtros en todas las tablas
- ✅ Paginación
- ✅ Exportación a Excel y PDF
- ✅ Notificaciones toast
- ✅ Modals para CRUD
- ✅ Modo desarrollo con datos mock
- ✅ Hot Module Replacement (HMR) con Vite
- ✅ TypeScript para type safety
- ✅ Path aliases (@/ para imports)

## Build para Producción

\`\`\`bash
npm run build
# o
bun run build
\`\`\`

Los archivos optimizados se generarán en la carpeta `dist/`.

Para previsualizar el build:
\`\`\`bash
npm run preview
# o
bun run preview
\`\`\`

## Soporte

Para problemas o preguntas, contactar al equipo de desarrollo.
