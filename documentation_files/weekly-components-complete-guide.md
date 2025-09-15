# Componentes Weekly - Guía Completa de Implementación

## Resumen Ejecutivo

Este documento describe la implementación completa de los tres componentes weekly del dashboard de CostenoSalesV3, incluyendo las optimizaciones de rendimiento implementadas para eliminar peticiones duplicadas a la API.

### Componentes Implementados
1. **weekly-chart-comparison** - Gráfico de comparación de 3 semanas
2. **weekly-sales-comparison** - Tabla comparativa de datos semanales
3. **weekly-sales-branches** - Tarjetas colapsibles de sucursales con métricas detalladas

### Optimizaciones de Rendimiento
- **Problema Resuelto**: Eliminación de 4 peticiones duplicadas → 1 petición compartida
- **Mejora**: 75% reducción en llamadas API
- **Patrón**: Context Provider compartido para gestión centralizada de datos

---

## 1. weekly-chart-comparison

### 📊 Descripción
Componente de gráfico interactivo que muestra la comparación de ventas diarias entre 3 semanas utilizando Recharts.

### 🎯 Funcionalidades Principales
- **Gráfico de líneas** con 3 semanas de datos comparativos
- **Renderizado condicional** - solo se muestra para semanas completas (Lun-Dom)
- **Tooltips informativos** con valores formateados en pesos mexicanos
- **Responsive design** adaptado a móvil y desktop
- **Integración con tema** - soporte para modo claro/oscuro

### 🏗️ Arquitectura

```
weekly-chart-comparison/
├── weekly-chart-comparison.tsx     # Componente principal
├── types.ts                        # Interfaces TypeScript
├── utils.ts                        # Generación de datos y validaciones
├── index.ts                        # Configuración de exports
└── components/
    ├── weekly-chart-header.tsx     # Header con icono y título
    └── weekly-comparison-chart.tsx # Implementación del gráfico Recharts
```

### 💾 Gestión de Datos
- **Fuente**: Context Provider `WeeklyChartProvider`
- **Validación**: Verificación de semana completa
- **Formato**: Datos transformados para compatibilidad con Recharts
- **Cache**: Datos compartidos entre componentes

### 🎨 Diseño Visual
- **Colores**: Paleta primaria (#897053) con variaciones
- **Líneas**: 3 líneas de colores diferenciados
- **Eje X**: Días abreviados en español (LUN, MAR, MIÉ...)
- **Eje Y**: Oculto para diseño limpio
- **Grid**: Líneas horizontales adaptativas al tema

### 📝 Uso

```tsx
import { WeeklyChartComparison } from '@/components/weekly-chart-comparison';

// Dentro de WeeklyChartProvider
<WeeklyChartComparison selectedDateRange={dateRange} />
```

---

## 2. weekly-sales-comparison

### 📋 Descripción
Componente de tabla comparativa que muestra métricas de ventas semanales con datos de crecimiento y análisis temporal.

### 🎯 Funcionalidades Principales
- **Tabla comparativa** con métricas de ventas actuales vs anteriores
- **Indicadores de crecimiento** con colores semánticos (verde/rojo)
- **Formato de moneda** en pesos mexicanos
- **Estados de carga** con skeleton animations
- **Manejo de errores** con botón de reintento

### 🏗️ Arquitectura

```
weekly-sales-comparison/
├── weekly-sales-comparison.tsx     # Componente principal
├── types.ts                        # Interfaces TypeScript
├── utils.ts                        # Transformación de datos API
└── hooks/
    └── use-weekly-sales-comparison.ts # Hook de integración API
```

### 💾 Gestión de Datos
- **Fuente**: Context Provider `WeeklyChartProvider` (optimizado)
- **Anteriormente**: Hook independiente `use-weekly-sales-comparison.ts`
- **Transformación**: Función `transformApiRangeToComparisonData`
- **Sección API**: Utiliza datos de `range` del endpoint

### 📊 Estructura de Datos

```typescript
interface WeeklySalesComparisonData {
  current: {
    totalSales: number;
    totalTickets: number;
    averageTicket: number;
  };
  previous: {
    totalSales: number;
    totalTickets: number;
    averageTicket: number;
  };
  growth: {
    salesGrowth: number;
    ticketsGrowth: number;
    averageTicketGrowth: number;
  };
}
```

### 🎨 Diseño Visual
- **Tabla responsive** con diseño limpio
- **Badges de crecimiento** con colores semánticos
- **Formato de moneda** mexicana consistente
- **Iconografía** usando Lucide React
- **Spacing** optimizado para móvil

### 📝 Uso

```tsx
import { WeeklySalesComparison } from '@/components/weekly-sales-comparison';

// Dentro de WeeklyChartProvider
<WeeklySalesComparison selectedDateRange={dateRange} />
```

---

## 3. weekly-sales-branches

### 🏪 Descripción
Componente de tarjetas colapsibles que muestra métricas detalladas por sucursal, incluyendo cuentas abiertas, cerradas y tickets promedio.

### 🎯 Funcionalidades Principales
- **Tarjetas colapsibles** independientes por sucursal
- **Métricas detalladas** de ventas por branch
- **Lógica condicional** - cuentas abiertas solo en semana actual
- **Ordenamiento** por ventas totales (descendente)
- **Truncamiento de nombres** a 15 caracteres con tooltip
- **Estados de carga** con skeleton de 6 items

### 🏗️ Arquitectura

```
weekly-sales-branches/
├── weekly-sales-branches.tsx               # Componente principal
├── types.ts                                # Interfaces TypeScript
├── utils.ts                                # Transformación y validaciones
├── index.ts                                # Exports
├── hooks/
│   └── use-weekly-branches.ts             # Hook de gestión de estado
└── components/
    ├── weekly-sales-branches-header.tsx   # Header del componente
    ├── branch-collapsible-item.tsx        # Item colapsible individual
    ├── weekly-branches-loading-skeleton.tsx # Estado de carga
    └── weekly-branches-error.tsx          # Estado de error
```

### 💾 Gestión de Datos
- **Fuente**: Context Provider `WeeklyChartProvider`
- **Hook**: `useWeeklyBranches` para gestión de estado local
- **Transformación**: `transformApiCardsToBranchData`
- **Sección API**: Utiliza datos de `cards` del endpoint
- **Validación**: Verificación de semana actual para cuentas abiertas

### 📊 Estructura de Datos

```typescript
interface BranchSalesData {
  id: string;
  name: string;
  location?: string;
  totalSales: number;
  percentage: number;
  openAccounts: number;      // Solo en semana actual
  closedSales: number;
  averageTicket: number;
  totalTickets: number;
  avatar: string;
}
```

### 🎨 Diseño Visual
- **Collapsible cards** con animaciones suaves
- **Avatares de sucursal** con iniciales
- **Badges de crecimiento** con colores dinámicos
- **Layout responsive** optimizado para móvil
- **Iconografía consistente** (TicketMinus, TicketCheck, TicketPercent)

### 🔒 Lógica de Negocio
- **Cuentas Abiertas**: Solo se muestran si `isCurrentWeek === true`
- **Semanas Pasadas**: Oculta card de cuentas abiertas (no pueden existir)
- **Ordenamiento**: Por `totalSales` descendente
- **Truncamiento**: Nombres > 15 caracteres con "..." y tooltip

### 📝 Uso

```tsx
import { WeeklySalesBranches } from '@/components/weekly-sales-branches';

// Dentro de WeeklyChartProvider
<WeeklySalesBranches selectedDateRange={dateRange} />
```

---

## Arquitectura de Optimización Compartida

### 🚀 Problema Original
- **4 peticiones duplicadas** al endpoint `main_dashboard_data`
- **Consumo innecesario** de recursos del servidor
- **Latencia aumentada** en la carga del dashboard

### ✅ Solución Implementada

#### 1. WeeklyChartProvider Context
```typescript
// contexts/weekly-chart-context.tsx
export const WeeklyChartProvider = ({ children, selectedDateRange }) => {
  const weeklyChartData = useWeeklyChart(selectedDateRange);

  return (
    <WeeklyChartContext.Provider value={weeklyChartData}>
      {children}
    </WeeklyChartContext.Provider>
  );
};
```

#### 2. Hook Centralizado
```typescript
// hooks/use-weekly-chart.ts
export const useWeeklyChart = (selectedDateRange) => {
  // Una sola petición API gestionada centralmente
  // Datos compartidos entre todos los componentes
  // Estados de carga y error unificados
};
```

#### 3. Servicio Optimizado
```typescript
// services/weekly-chart.service.ts
export const fetchRawWeeklyData = async (startDate, endDate, maxRetries = 3) => {
  // Control de peticiones activas
  // Prevención de duplicados concurrentes
  // Gestión de caché mejorada
};
```

### 📈 Resultados de la Optimización
- **Reducción 75%**: De 4 peticiones → 1 petición
- **Cache único**: Datos compartidos eficientemente
- **Estado centralizado**: Loading/error unificados
- **Mejor UX**: Carga más rápida y consistente

---

## Integración en Dashboard

### 📍 Ubicación en Dashboard
```tsx
// pages/dashboard.tsx
export default function Dashboard({ selectedDateRange }) {
  return (
    <WeeklyChartProvider selectedDateRange={selectedDateRange}>
      <WeeklyChartComparison selectedDateRange={selectedDateRange} />
      <WeeklySalesComparison selectedDateRange={selectedDateRange} />
      <WeeklySalesBranches selectedDateRange={selectedDateRange} />
    </WeeklyChartProvider>
  );
}
```

### 🔄 Flujo de Datos
1. **Usuario selecciona semana** en MainFilterCalendar
2. **WeeklyChartProvider** recibe `selectedDateRange`
3. **useWeeklyChart** ejecuta validación de semana completa
4. **Una sola petición API** se realiza si es válida
5. **Todos los componentes** reciben datos del contexto
6. **Renderizado condicional** según validaciones específicas

---

## Consideraciones Técnicas

### 🔧 TypeScript
- **Interfaces completas** para todos los tipos de datos
- **Validación en tiempo de compilación**
- **Exports organizados** en archivos index.ts
- **Props tipadas** para todos los componentes

### ⚡ Rendimiento
- **React.memo** en componentes críticos
- **useMemo/useCallback** para cálculos costosos
- **Lazy rendering** solo cuando semana válida
- **Skeleton loading** para mejor UX

### 🎯 Escalabilidad
- **Patrón reutilizable** para otros grupos de componentes
- **Context provider** fácilmente extensible
- **Servicios modulares** con responsabilidades claras
- **Hooks composables** para lógica reutilizable

### 🛡️ Manejo de Errores
- **Estados de error** individuales por componente
- **Botones de reintento** con feedback visual
- **Logging detallado** en modo desarrollo
- **Fallbacks graceful** para datos faltantes

---

## Guía de Mantenimiento

### ✅ Buenas Prácticas
1. **Mantener contexto único** - no duplicar providers
2. **Validar datos API** antes de transformar
3. **Preservar interfaces existentes** al hacer cambios
4. **Testear con diferentes rangos** de fechas
5. **Monitorear peticiones** en DevTools Network

### 🚨 Puntos de Atención
- **No mover componentes** fuera del WeeklyChartProvider
- **Verificar validaciones** de semana completa
- **Mantener formato** de moneda mexicana consistente
- **Preservar estados de carga** individuales
- **No modificar servicio** sin revisar todos los componentes

### 🔍 Debugging
```bash
# Verificar una sola petición API
1. Abrir DevTools → Network
2. Seleccionar semana completa
3. Filtrar por "main_dashboard"
4. Confirmar solo 1 request

# Debug en consola (modo desarrollo)
- useWeeklyChart: logs de efectos
- fetchRawWeeklyData: logs de peticiones
- transformaciones: logs de datos procesados
```

---

## Conclusión

La implementación de los componentes weekly representa una solución completa y optimizada para la visualización de datos semanales en el dashboard de CostenoSalesV3. La arquitectura de contexto compartido no solo resuelve problemas de rendimiento sino que establece un patrón escalable para futuros desarrollos.

### 🎯 Logros Principales
- ✅ **3 componentes weekly** completamente funcionales
- ✅ **Optimización de API** con 75% menos peticiones
- ✅ **Arquitectura escalable** con Context Provider
- ✅ **UX mejorada** con estados de carga y error
- ✅ **Código maintible** con TypeScript y documentación

### 📅 Última Actualización
Septiembre 15, 2024 - Versión 1.0 Completa