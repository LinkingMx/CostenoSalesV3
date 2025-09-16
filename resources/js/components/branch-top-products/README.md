# BranchTopProducts Component

Componente de tabla avanzada para mostrar los productos más vendidos de una sucursal específica con funcionalidades completas de búsqueda, ordenamiento y paginación.

## Descripción General

El componente `BranchTopProducts` es una tabla de datos completamente funcional construida con TanStack Table v8 y shadcn/ui components, diseñada específicamente para dispositivos móviles con funcionalidades avanzadas de UX/UI.

## Características Principales

### ✅ Funcionalidades de Datos
- **Búsqueda en tiempo real** por nombre de producto
- **Ordenamiento dinámico** por cantidad, precio unitario y total
- **Paginación** con navegación anterior/siguiente
- **Filtrado automático** de productos con valor total < $10 MXN
- **Validación de datos** con manejo robusto de errores

### ✅ Diseño Mobile-First
- **Columna fija** para nombres de productos con scroll horizontal
- **Anchos optimizados** para pantallas móviles (470px total)
- **Iconos de ordenamiento** en círculos primary perfectos
- **Texto truncado** a 18 caracteres con popover para ver nombres completos
- **Formato sin decimales** para valores monetarios

### ✅ Experiencia de Usuario
- **Estados de carga** con skeleton components
- **Estados de error** con mensajes informativos
- **Estado vacío** cuando no hay productos
- **Popover compatible con iOS** para nombres completos
- **Animaciones suaves** en interacciones

## Arquitectura de Archivos

```
branch-top-products/
├── branch-top-products.tsx           # Componente principal
├── types.ts                          # Interfaces TypeScript
├── utils.ts                          # Utilidades y formateo
├── index.ts                          # Exportaciones
├── hooks/
│   └── use-top-products-table.ts     # Lógica de tabla con TanStack
└── components/
    ├── products-table-columns.tsx    # Definiciones de columnas
    └── products-table-search.tsx     # Componente de búsqueda
```

## Interfaces TypeScript

### TopProduct (API Response)
```typescript
interface TopProduct {
    item_id: number;
    name: string;
    quantity: number;
    unit_cost: number;
    percentage: number;
}
```

### TopProductTableRow (Tabla Procesada)
```typescript
interface TopProductTableRow extends TopProduct {
    total: number; // quantity * unit_cost
}
```

### Props del Componente Principal
```typescript
interface BranchTopProductsProps {
    data: TopProduct[] | null;
    isLoading?: boolean;
    error?: Error | string | null;
}
```

## Configuración de Columnas

### Distribución de Anchos (Mobile-Optimized)
- **Producto**: 180px (columna fija, fondo oscurecido)
- **Qty**: 80px (cantidad)
- **$ Unit**: 100px (precio unitario sin decimales)
- **TT**: 110px (total sin decimales)

### Características por Columna

#### 1. Producto (Fija)
```typescript
- Ancho: 180px (doble del estándar)
- Posición: sticky left-0 z-10
- Fondo: #6b5d4a (primary oscurecido)
- Texto: text-white
- Truncado: 18 caracteres máximo
- Popover: iOS-compatible para nombres completos
- Ordenamiento: Deshabilitado
```

#### 2. Qty (Cantidad)
```typescript
- Ancho: 80px
- Formato: Números enteros, decimales solo si necesarios
- Ordenamiento: Habilitado (default DESC)
- Alineación: text-right
```

#### 3. $ Unit (Precio Unitario)
```typescript
- Ancho: 100px
- Formato: MXN sin decimales (ej: $149)
- Ordenamiento: Habilitado
- Alineación: text-right
```

#### 4. TT (Total)
```typescript
- Ancho: 110px
- Formato: MXN sin decimales (ej: $154,960)
- Ordenamiento: Habilitado
- Alineación: text-right
- Cálculo: quantity * unit_cost
```

## Lógica de Filtrado

### Filtros Automáticos
```typescript
// 1. Filtro por precio unitario
products.filter(product => product.unit_cost >= 10)

// 2. Filtro por valor total
products.filter(product => (product.quantity * product.unit_cost) >= 10)
```

### Filtro de Búsqueda
```typescript
// Búsqueda insensible a mayúsculas/minúsculas en nombres
products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
)
```

## Funciones de Formateo

### Moneda Mexicana
```typescript
// Con decimales (legacy)
formatMXNCurrency(amount: number): string
// Resultado: "$149.00"

// Sin decimales (actual)
formatMXNCurrencyNoDecimals(amount: number): string
// Resultado: "$149"
```

### Cantidades
```typescript
formatQuantity(quantity: number): string
// Enteros: "100"
// Decimales: "10.5"
```

### Truncado de Texto
```typescript
truncateProductName(name: string, maxLength: number = 18): string
// "Producto Muy Largo..." (máximo 18 caracteres)
```

## Estados del Componente

### Loading State
```typescript
- Muestra: TableLoadingSkeleton
- Skeleton para: búsqueda, headers, 5 filas, paginación
- Duración: Hasta que data esté disponible
```

### Error State
```typescript
- Muestra: ErrorState component
- Icono: AlertCircle destructive
- Mensaje: Personalizable desde error prop
- Fallback: "Ocurrió un error al cargar los datos de productos"
```

### Empty State
```typescript
- Muestra: EmptyState component
- Icono: Package2 muted
- Mensaje: "No se encontraron productos vendidos en el período seleccionado"
- Condición: data válida pero array vacío
```

### Success State
```typescript
- Muestra: Tabla completa con datos
- Búsqueda: Habilitada
- Paginación: 10 items por página
- Ordenamiento: Por cantidad DESC (default)
```

## Integración con TanStack Table

### Configuración del Hook
```typescript
const table = useReactTable({
    data: tableData,
    columns: productsTableColumns,
    state: { sorting, columnFilters, pagination, columnSizing },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualFiltering: true, // Búsqueda manual optimizada
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
});
```

### Estados Manejados
- **Sorting**: Estado de ordenamiento por columna
- **ColumnFilters**: Filtros aplicados (no usado actualmente)
- **Pagination**: Página actual y tamaño de página
- **ColumnSizing**: Anchos de columnas dinámicos

## Componente de Búsqueda

### ProductsTableSearch
```typescript
interface ProductsTableSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}
```

Características:
- Input con icono de búsqueda
- Debounce automático en el hook padre
- Reset de paginación al cambiar búsqueda
- Placeholder personalizable

## Paginación

### TablePagination Component
- **Botones circulares** con iconos ChevronLeft/ChevronRight
- **Color primary** con hover effects
- **Estados disabled** cuando no hay páginas disponibles
- **Texto informativo**: "Página X de Y"
- **Auto-hide**: Se oculta si no hay datos

## Popover para Nombres Completos

### Características iOS-Compatible
```typescript
<Popover>
    <PopoverTrigger asChild>
        <button className="flex items-center gap-1 font-medium text-white text-left group">
            <span>{truncatedName}</span>
            <Info className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
        </button>
    </PopoverTrigger>
    <PopoverContent className="w-80 p-3" side="top" align="start">
        <p className="text-sm font-medium">{fullName}</p>
    </PopoverContent>
</Popover>
```

Ventajas:
- **Touch-friendly**: Funciona con tap en iOS/Android
- **Posicionamiento inteligente**: Aparece arriba para no tapar contenido
- **Indicador visual**: Icono Info sutil
- **Accessible**: Compatible con lectores de pantalla

## Rendimiento y Optimización

### React Optimizations
- **React.memo**: Componentes memoizados para prevenir re-renders
- **useMemo**: Transformación y filtrado de datos optimizado
- **useCallback**: Funciones estables para props de componentes

### Data Processing
- **Filtrado en cascada**: Filtros aplicados secuencialmente
- **Búsqueda optimizada**: Solo en campos relevantes
- **Paginación eficiente**: Procesamiento solo de datos visibles

## Integración en BranchDetails

### Uso en la Página
```typescript
<BranchTopProducts
    data={branchData?.top_products || null}
    isLoading={isBranchLoading}
    error={branchError}
/>
```

### Datos del API
- **Endpoint**: Mismo endpoint que otros componentes de BranchDetails
- **Campo**: `branchData.top_products`
- **Formato**: Array de objetos TopProduct
- **Validación**: Automática con validateProductsData()

## Estilos y Theming

### Colores Utilizados
- **Primary**: #897053 (iconos, círculos de ordenamiento)
- **Primary Oscurecido**: #6b5d4a (fondo columna producto)
- **Text White**: Texto en columna producto
- **Foreground**: Texto en otras columnas
- **Border**: Separadores y bordes

### Responsive Behavior
- **Mobile-first**: Diseñado primero para móviles
- **Scroll horizontal**: Automático cuando excede 470px
- **Columna fija**: Siempre visible en scroll
- **Touch targets**: Mínimo 44px para iOS guidelines

## Testing y Validación

### Validación de Datos
```typescript
validateProductsData(data: unknown): data is TopProduct[]
// Valida estructura, tipos y valores mínimos requeridos
```

### Manejo de Errores
- **Network errors**: Capturados en el hook padre
- **Data validation**: Validación antes de procesamiento
- **Fallback states**: Estados por defecto para todos los casos

## Casos de Uso

### Casos Principales
1. **Visualizar productos top**: Lista ordenada por cantidad vendida
2. **Buscar producto específico**: Filtrado por nombre
3. **Analizar precios**: Comparar precios unitarios y totales
4. **Navegación de datos**: Paginación para datasets grandes

### Casos Edge
1. **Sin datos**: Estado vacío elegante
2. **Error de API**: Mensaje de error informativo
3. **Datos inválidos**: Validación y fallback
4. **Nombres muy largos**: Truncado con popover
5. **Productos baratos**: Filtrado automático < $10

## Mejores Prácticas de Implementación

### Código Limpio
- **Single Responsibility**: Cada componente tiene una función específica
- **Type Safety**: Interfaces TypeScript completas
- **Error Boundaries**: Manejo robusto de errores
- **Performance**: Optimizaciones de re-render

### UX/UI Guidelines
- **Mobile-first**: Prioridad en experiencia móvil
- **Touch-friendly**: Targets de al menos 44px
- **Clear feedback**: Estados visuales claros
- **Consistent design**: Alineado con design system

### Mantenibilidad
- **Modular**: Separación clara de responsabilidades
- **Documented**: Comentarios y documentación completa
- **Testable**: Estructura que facilita testing
- **Scalable**: Fácil agregar nuevas características

## Roadmap y Mejoras Futuras

### Características Planificadas
- [ ] Exportación a CSV/Excel
- [ ] Filtros avanzados por rango de precios
- [ ] Gráficos inline para tendencias
- [ ] Comparación entre períodos
- [ ] Métricas adicionales (margen, ROI)

### Optimizaciones Técnicas
- [ ] Virtualización para datasets muy grandes
- [ ] Cache inteligente de resultados de búsqueda
- [ ] Preload de páginas siguientes
- [ ] Optimización de bundle size

---

## Conclusión

El componente BranchTopProducts representa una implementación completa y robusta de una tabla de datos moderna, optimizada para dispositivos móviles y con todas las funcionalidades esperadas en una aplicación empresarial. Su arquitectura modular facilita el mantenimiento y futuras expansiones.