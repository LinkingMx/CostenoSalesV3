# Componentes Mensuales - Arquitectura y Especificaciones

## Resumen Ejecutivo

Este documento define la arquitectura completa para los componentes mensuales del dashboard de CostenoSalesV3, siguiendo los patrones establecidos exitosamente en los componentes weekly. Los componentes mensuales incluirán optimizaciones de rendimiento con contexto compartido y integración completa con la API.

---

## Endpoint API y Estructura de Datos

### 🌐 Endpoint de Datos Mensuales

**URL**: `http://192.168.100.20/api/main_dashboard_data`
**Método**: POST
**Headers**:
```
Accept: application/json
Content-Type: application/json
Authorization: Bearer 342|AxRYaMAz4RxhiMwYTXJmUvCXvkjq24MrXW3YgrF91ef9616f
```

**Request Body**:
```json
{
  "start_date": "2025-08-01",
  "end_date": "2025-08-31",
  "range": "month"
}
```

### 📊 Estructura de Respuesta API

```json
{
  "success": true,
  "message": "",
  "data": {
    "sales": {
      "total": 245571589,     // Venta total con impuestos
      "subtotal": 211699646   // Venta total sin impuestos
    },
    "cards": {
      "[BRANCH_NAME]": {
        "open_accounts": {
          "total": 0,           // Cantidad de cuentas abiertas
          "money": 0            // Dinero en cuentas abiertas
        },
        "closed_ticket": {
          "total": 1990,        // Cantidad de cuentas cerradas
          "money": 5780205.65   // Dinero en cuentas cerradas
        },
        "last_sales": 3770278.40,  // Ventas del mes pasado
        "average_ticket": 1034.03,  // Ticket promedio
        "percentage": {
          "icon": "up",         // "up" o "down" para iconos
          "qty": 53.31          // Porcentaje de crecimiento
        },
        "date": "2025-09-15 12:57",
        "store_id": 9,          // ID único de tienda
        "last_synchronization": "2025-09-15T18:57:09.376963Z",
        "brand": "ANIMAL",      // Marca de la tienda
        "region": "AM-AF",      // Región de la tienda
        "operational_address": null,
        "general_address": null
      }
    },
    "range": {
      "actual": 245512460.24,   // Mes actual (filtro seleccionado)
      "last": 228086400.35,     // Mes anterior
      "two_las": 206902314.55   // Hace 2 meses
    }
  }
}
```

---

## Arquitectura de Componentes Mensuales

### 📋 Componentes a Implementar

1. **monthly-chart-comparison** - Gráfico de comparación de 3 meses
2. **monthly-sales-comparison** - Tabla comparativa de métricas mensuales
3. **monthly-sales-branches** - Tarjetas colapsibles de sucursales mensuales

### 🏗️ Patrón de Arquitectura

Siguiendo el patrón exitoso de los componentes weekly:

```
MonthlyChartProvider (Context)
├── monthly-chart-comparison/
│   ├── monthly-chart-comparison.tsx
│   ├── types.ts
│   ├── utils.ts
│   └── components/
│       ├── monthly-chart-header.tsx
│       └── monthly-comparison-chart.tsx
├── monthly-sales-comparison/
│   ├── monthly-sales-comparison.tsx
│   ├── types.ts
│   └── utils.ts
└── monthly-sales-branches/
    ├── monthly-sales-branches.tsx
    ├── types.ts
    ├── utils.ts
    ├── hooks/use-monthly-branches.ts
    └── components/
        ├── monthly-sales-branches-header.tsx
        ├── branch-monthly-item.tsx
        ├── monthly-branches-loading-skeleton.tsx
        └── monthly-branches-error.tsx
```

---

## Especificaciones por Componente

### 1. MonthlyChartComparison

**Propósito**: Gráfico interactivo mostrando comparación de ventas diarias entre 3 meses.

**Características**:
- **Tipo de gráfico**: Línea múltiple con Recharts
- **Datos**: 3 líneas representando los últimos 3 meses
- **Eje X**: Días del mes (1-31)
- **Eje Y**: Valores de venta en pesos mexicanos
- **Renderizado condicional**: Solo para rangos de mes completo
- **Colores**: Paleta consistente con tema (#897053 y variaciones)

**Fuente de datos**:
- Utiliza `range` del API response
- `actual`, `last`, `two_las` para las 3 líneas del gráfico

**Estados**:
- Loading con skeleton animation
- Error con retry functionality
- Success con gráfico interactivo

### 2. MonthlySalesComparison

**Propósito**: Tabla comparativa de métricas de ventas mensuales con indicadores de crecimiento.

**Características**:
- **Métricas principales**:
  - Ventas totales (actual vs anterior)
  - Crecimiento porcentual
  - Comparación con hace 2 meses
- **Formato de moneda**: Pesos mexicanos (es-MX)
- **Indicadores visuales**: Badges verdes/rojos según crecimiento
- **Responsive**: Adaptado para móvil y desktop

**Fuente de datos**:
- Utiliza `range` del API response
- Calcula crecimientos y porcentajes automáticamente

**Lógica de negocio**:
```typescript
const currentMonth = range.actual;
const lastMonth = range.last;
const twoMonthsAgo = range.two_las;

const monthOverMonthGrowth = ((currentMonth - lastMonth) / lastMonth) * 100;
const twoMonthGrowth = ((currentMonth - twoMonthsAgo) / twoMonthsAgo) * 100;
```

### 3. MonthlySalesBranches

**Propósito**: Tarjetas colapsibles mostrando métricas detalladas por sucursal para el mes seleccionado.

**Características**:
- **Tarjetas colapsibles**: Una por sucursal (~37 sucursales)
- **Información en header**:
  - Nombre de sucursal (truncado a 15 caracteres)
  - Total de ventas (closed_ticket.money)
  - Badge de crecimiento (percentage.qty con icon)
  - Avatar con inicial de marca
- **Detalles expandibles**:
  - Cuentas cerradas
  - Ticket promedio
  - Total de tickets
  - Marca y región
- **Ordenamiento**: Por ventas totales descendente
- **Cuentas abiertas**: Siempre ocultas (no aplican para datos históricos mensuales)

**Fuente de datos**:
- Utiliza `cards` del API response
- Transformación similar a weekly pero sin lógica de cuentas abiertas

**Lógica de negocio específica**:
```typescript
interface MonthlyBranchData {
  id: string;
  name: string;
  location?: string;
  totalSales: number;          // closed_ticket.money (NO suma con open_accounts)
  percentage: number;          // percentage.qty
  percentageIcon: "up" | "down"; // percentage.icon
  lastMonthSales: number;      // last_sales
  averageTicket: number;       // average_ticket
  totalTickets: number;        // closed_ticket.total
  avatar: string;              // Primera letra de brand
  brand: string;               // brand
  region: string;              // region
}
```

---

## Optimización de Rendimiento

### 🚀 MonthlyChartProvider Context

Siguiendo el patrón exitoso de WeeklyChartProvider:

```typescript
// contexts/monthly-chart-context.tsx
interface MonthlyChartContextValue {
  monthlyData: MonthlyChartApiResponse | null;
  isLoading: boolean;
  error: string | null;
  isValidCompleteMonth: boolean;
  refetch: () => void;
}

export const MonthlyChartProvider = ({ children, selectedDateRange }) => {
  const monthlyChartData = useMonthlyChart(selectedDateRange);

  return (
    <MonthlyChartContext.Provider value={monthlyChartData}>
      {children}
    </MonthlyChartContext.Provider>
  );
};
```

### 📊 Service Layer Integration

**Archivo**: `monthly-chart.service.ts`

```typescript
export const fetchMonthlyChartWithRetry = async (
  startDate: string,
  endDate: string,
  maxRetries: number = 3
): Promise<MonthlyChartServiceResult> => {
  // Request con range: "month"
  const body = {
    start_date: startDate,
    end_date: endDate,
    range: "month"
  };

  // Implementación similar a weekly-chart.service.ts
  // con manejo de cache y retry logic
};
```

### 🔄 Flujo de Datos Optimizado

1. **Usuario selecciona mes**: En MainFilterCalendar
2. **MonthlyChartProvider**: Recibe selectedDateRange
3. **Validación de mes completo**: useMonthlyChart verifica que sea mes completo
4. **API call única**: fetchMonthlyChartWithRetry con range="month"
5. **Distribución de datos**:
   - `monthly-chart-comparison`: Usa `range` para gráfico
   - `monthly-sales-comparison`: Usa `range` para métricas
   - `monthly-sales-branches`: Usa `cards` para sucursales
6. **Estados compartidos**: Loading, error, success para todos

---

## Validaciones y Lógica de Negocio

### 📅 Validación de Mes Completo

```typescript
// utils/month-validation.ts
export function isCompleteMonthSelected(dateRange?: DateRange): boolean {
  if (!dateRange?.from || !dateRange?.to) return false;

  const start = new Date(dateRange.from);
  const end = new Date(dateRange.to);

  // Verificar que sea primer día del mes
  const isFirstDay = start.getDate() === 1;

  // Verificar que sea último día del mes
  const lastDayOfMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0);
  const isLastDay = end.getDate() === lastDayOfMonth.getDate();

  return isFirstDay && isLastDay &&
         start.getMonth() === end.getMonth() &&
         start.getFullYear() === end.getFullYear();
}
```

### 💰 Cálculos de Métricas

```typescript
// Para monthly-sales-comparison
interface MonthlyMetrics {
  currentMonth: number;
  lastMonth: number;
  twoMonthsAgo: number;
  monthOverMonthGrowth: number;
  twoMonthGrowth: number;
  isPositiveGrowth: boolean;
}

export function calculateMonthlyMetrics(rangeData: ApiRangeData): MonthlyMetrics {
  const currentMonth = rangeData.actual;
  const lastMonth = rangeData.last;
  const twoMonthsAgo = rangeData.two_las;

  const monthOverMonthGrowth = lastMonth > 0
    ? ((currentMonth - lastMonth) / lastMonth) * 100
    : 0;

  const twoMonthGrowth = twoMonthsAgo > 0
    ? ((currentMonth - twoMonthsAgo) / twoMonthsAgo) * 100
    : 0;

  return {
    currentMonth,
    lastMonth,
    twoMonthsAgo,
    monthOverMonthGrowth,
    twoMonthGrowth,
    isPositiveGrowth: monthOverMonthGrowth > 0
  };
}
```

### 🏪 Transformación de Datos de Sucursales

```typescript
// Para monthly-sales-branches
export function transformApiCardsToMonthlyBranches(
  cardsData: Record<string, ApiMonthlyCardData>
): MonthlyBranchData[] {
  return Object.entries(cardsData)
    .map(([branchName, apiData]) => ({
      id: apiData.store_id.toString(),
      name: branchName,
      location: apiData.region,
      totalSales: apiData.closed_ticket.money, // Solo cuentas cerradas en mensual
      percentage: apiData.percentage.qty,
      percentageIcon: apiData.percentage.icon,
      lastMonthSales: apiData.last_sales,
      averageTicket: apiData.average_ticket,
      totalTickets: apiData.closed_ticket.total,
      avatar: apiData.brand ? apiData.brand.charAt(0).toUpperCase() : branchName.charAt(0).toUpperCase(),
      brand: apiData.brand,
      region: apiData.region
    }))
    .sort((a, b) => b.totalSales - a.totalSales); // Ordenar por ventas descendente
}
```

---

## Estados y Manejo de Errores

### 🔄 Estados de Carga

Cada componente tendrá estados consistentes:

1. **Loading**: Skeleton animations específicas para cada tipo
2. **Error**: Componentes de error con retry functionality
3. **Empty**: Estados cuando no hay datos para el mes
4. **Success**: Renderizado normal con datos

### 🚨 Manejo de Errores

```typescript
interface MonthlyErrorProps {
  error: string;
  onRetry?: () => void;
  errorType?: 'network' | 'validation' | 'data' | 'unknown';
}

// Errores específicos:
// - Red/conectividad
// - Validación de fechas
// - Datos incompletos del API
// - Errores de transformación
```

---

## Integración con Dashboard

### 📍 Ubicación en Dashboard

```tsx
// pages/dashboard.tsx
<MonthlyChartProvider selectedDateRange={selectedDateRange}>
  <MonthlyErrorBoundary>
    <MonthlySalesComparison selectedDateRange={selectedDateRange} />
  </MonthlyErrorBoundary>

  <MonthlyChartComparison selectedDateRange={selectedDateRange} />

  <MonthlySalesBranches selectedDateRange={selectedDateRange} />
</MonthlyChartProvider>
```

### 🎯 Renderizado Condicional

Los componentes solo se renderizan cuando:
- Se selecciona un mes completo (1er día al último día)
- La fecha seleccionada es válida
- El contexto provider está disponible

---

## Consideraciones de UX/UI

### 🎨 Diseño Visual

**Consistencia con componentes weekly**:
- Misma paleta de colores (#897053)
- Iconografía consistente (Lucide React)
- Espaciado y tipografía unificados
- Responsive design mobile-first

**Elementos específicos mensuales**:
- Formato de fechas en español para meses
- Etiquetas adaptadas ("Mes actual", "Mes anterior", "Hace 2 meses")
- Gráficos con escala temporal mensual

### 📱 Responsive Design

- **Mobile**: Vista apilada con componentes de ancho completo
- **Tablet**: Layout de 2 columnas donde sea apropiado
- **Desktop**: Layout optimizado con espacio eficiente

### ♿ Accesibilidad

- ARIA labels en español para elementos mensuales
- Navegación por teclado completa
- Contraste adecuado en todos los estados
- Lectores de pantalla con anuncios contextuales

---

## Testing y Validación

### 🧪 Casos de Prueba

1. **Validación de fechas**:
   - Mes completo vs parcial
   - Diferentes años
   - Meses con diferentes cantidades de días

2. **Transformación de datos**:
   - API response completa
   - Datos faltantes o nulos
   - Sucursales sin datos

3. **Estados de componentes**:
   - Loading, error, empty, success
   - Transiciones entre estados
   - Retry functionality

### 📊 Datos de Prueba

```typescript
// Ejemplos de datos para testing
const mockMonthlyApiResponse = {
  success: true,
  data: {
    sales: { total: 245571589, subtotal: 211699646 },
    cards: {
      "Animal (Calzada)": {
        // ... estructura completa como en el ejemplo
      }
    },
    range: {
      actual: 245512460.24,
      last: 228086400.35,
      two_las: 206902314.55
    }
  }
};
```

---

## Cronograma de Implementación

### 📅 Fases de Desarrollo

**Fase 1: Infraestructura**
- MonthlyChartProvider context
- monthly-chart.service.ts
- Validaciones y utilities base

**Fase 2: Componente MonthlySalesComparison**
- Implementación de tabla comparativa
- Cálculos de métricas
- Estados de loading/error

**Fase 3: Componente MonthlyChartComparison**
- Gráfico Recharts
- Transformación de datos
- Integración con tema

**Fase 4: Componente MonthlySalesBranches**
- Tarjetas colapsibles
- Transformación de datos de sucursales
- Estados y validaciones

**Fase 5: Integración y Optimización**
- Integración en dashboard
- Testing completo
- Documentación final

---

## Conclusión

La arquitectura de componentes mensuales seguirá los patrones probados de los componentes weekly, asegurando:

- **Consistencia**: Misma estructura y patrones
- **Rendimiento**: Optimización con contexto compartido
- **Mantenibilidad**: Código limpio y documentado
- **Escalabilidad**: Patrón reutilizable para futuros componentes

La implementación aprovechará las lecciones aprendidas de la optimización weekly, resultando en una solución robusta y eficiente para la visualización de datos mensuales.

**Fecha de documentación**: Septiembre 15, 2024
**Versión**: 1.0 - Especificación inicial