# Plan: Migración Gradual a Feature-Based Architecture

## Resumen

Migrar el proyecto de estructura plana a **feature-based architecture** de forma gradual, manteniendo la app funcionando en cada paso. Unificar servicios a funciones puras.

## Estructura Objetivo

```
src/
├── features/
│   ├── auth/           (login, protected routes, roles)
│   ├── cotizaciones/   (CRUD cotizaciones, exportación)
│   ├── plantillas/     (templates reutilizables)
│   ├── productos/      (catálogo de productos)
│   └── servicios/      (catálogo de servicios)
├── shared/
│   ├── components/     (Header, StatusBadge, ui/)
│   ├── hooks/          (use-mobile, use-toast)
│   ├── lib/            (utils)
│   └── types/          (tipos compartidos)
├── infrastructure/
│   ├── api/            (Supabase client)
│   └── contexts/       (providers globales)
└── App.tsx
```

---

## Fase 0: Preparación

### 0.1 Agregar path aliases

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@infrastructure/*": ["./src/infrastructure/*"]
    }
  }
}
```

**vite.config.ts:**
```typescript
alias: {
  "@": path.resolve(__dirname, "./src"),
  "@features": path.resolve(__dirname, "./src/features"),
  "@shared": path.resolve(__dirname, "./src/shared"),
  "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
}
```

### 0.2 Crear estructura de carpetas vacías

```bash
mkdir -p src/features/{auth,cotizaciones,plantillas,productos,servicios}/{components,hooks,services,pages,types}
mkdir -p src/shared/{components,hooks,lib,types}
mkdir -p src/infrastructure/{api,contexts}
```

---

## Fase 1: Infrastructure (Base compartida)

### Archivos a mover:
| Origen | Destino |
|--------|---------|
| `src/api/conection.ts` | `src/infrastructure/api/supabase.ts` |
| `src/lib/utils.ts` | `src/shared/lib/utils.ts` |
| `src/hooks/use-mobile.tsx` | `src/shared/hooks/use-mobile.ts` |
| `src/hooks/use-toast.ts` | `src/shared/hooks/use-toast.ts` |
| `src/utils/const.tsx` | `src/shared/constants/roles.ts` |

### Crear re-exports en ubicaciones originales para no romper imports existentes.

---

## Fase 2: Feature Auth

### Estructura:
```
src/features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── ProtectedRoute.tsx
├── hooks/
│   └── useAuth.ts
├── services/
│   └── authService.ts       ← Consolidar funciones de src/api/auth/*
├── context/
│   └── AuthProvider.tsx
├── pages/
│   └── LoginPage.tsx
├── types/
│   └── auth.types.ts
└── index.ts
```

### Archivos origen:
- `src/api/auth/singin.ts`, `singout.ts`, `getSession.ts`, `getRole.ts`, `getProfile.ts`, `inviteuser.ts`
- `src/contexts/AuthContext.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/pages/Login.tsx` (si existe)

### Refactorear a funciones:
```typescript
// src/features/auth/services/authService.ts
export const signIn = async (email: string, password: string) => { ... };
export const signOut = async () => { ... };
export const getSession = async () => { ... };
export const getCurrentUserRole = async () => { ... };
export const inviteUser = async (email: string) => { ... };
```

---

## Fase 3: Feature Servicios

### Estructura:
```
src/features/servicios/
├── components/
│   ├── ServicioForm.tsx
│   ├── ServiciosList.tsx
│   └── ServicioEditDialog.tsx
├── hooks/
│   └── useServicios.ts      ← NUEVO: custom hook
├── services/
│   └── serviciosService.ts  ← Ya usa funciones, solo mover
├── pages/
│   └── ServiciosPage.tsx
├── types/
│   └── servicio.types.ts
└── index.ts
```

### Archivos origen:
- `src/services/serviciosService.ts`
- `src/pages/Servicios.tsx` (355 loc) → dividir en componentes

---

## Fase 4: Feature Productos

### Estructura:
```
src/features/productos/
├── components/
│   ├── ProductoForm.tsx
│   ├── ProductosList.tsx
│   └── ProductoEditDialog.tsx
├── hooks/
│   └── useProductos.ts
├── services/
│   └── productosService.ts  ← Ya usa funciones, solo mover
├── pages/
│   └── ProductosPage.tsx
├── types/
│   └── producto.types.ts
└── index.ts
```

### Archivos origen:
- `src/services/productosService.ts`
- `src/pages/Productos.tsx` (478 loc) → dividir en componentes

---

## Fase 5: Feature Plantillas

### Estructura:
```
src/features/plantillas/
├── components/
│   ├── PlantillaCard.tsx
│   └── PlantillasList.tsx
├── hooks/
│   └── usePlantillas.ts
├── services/
│   └── plantillasService.ts  ← REFACTOREAR clase → funciones
├── pages/
│   └── PlantillasPage.tsx
├── types/
│   └── plantilla.types.ts
└── index.ts
```

### Refactorear clase a funciones:
```typescript
// ANTES: PlantillasService.obtenerTodas()
// DESPUÉS: obtenerPlantillas()

export const obtenerPlantillas = async () => { ... };
export const obtenerPlantillaPorId = async (id: string) => { ... };
export const crearPlantilla = async (...) => { ... };
export const actualizarPlantilla = async (...) => { ... };
export const eliminarPlantilla = async (id: string) => { ... };
```

---

## Fase 6: Feature Cotizaciones (La más compleja)

### Estructura:
```
src/features/cotizaciones/
├── components/
│   ├── CotizacionForm/
│   │   ├── CotizacionInfoCard.tsx
│   │   ├── ProductosSelector.tsx
│   │   ├── ProductosList.tsx
│   │   └── GuardarPlantillaDialog.tsx
│   ├── CotizacionesList/
│   │   ├── CotizacionesTable.tsx
│   │   ├── CotizacionesFilters.tsx
│   │   └── DeleteCotizacionDialog.tsx
│   └── VistaPrevia/
│       └── VistaPrevia.tsx
├── hooks/
│   ├── useCotizaciones.ts
│   ├── useCotizacionForm.ts
│   └── useProductosSelector.ts
├── services/
│   ├── cotizacionesService.ts    ← UNIFICAR clase+funciones → solo funciones
│   └── wordExportService.ts      ← REFACTOREAR clase → funciones
├── pages/
│   ├── NuevaCotizacionPage.tsx   ← Reducir de 647 loc a ~100 loc
│   ├── CotizacionesListaPage.tsx ← Reducir de 433 loc a ~80 loc
│   └── CotizacionDetallePage.tsx
├── types/
│   └── cotizacion.types.ts
└── index.ts
```

### Dividir NuevaCotizacion.tsx (647 loc):
1. **CotizacionInfoCard.tsx** - Form de cliente, evento, fecha, descuento
2. **ProductosSelector.tsx** - Select servicio + tabla productos disponibles
3. **ProductosList.tsx** - Tabla productos agregados con cantidad
4. **GuardarPlantillaDialog.tsx** - Dialog guardar como plantilla
5. **useCotizacionForm.ts** - Hook con lógica del formulario
6. **useProductosSelector.ts** - Hook con lógica de selección productos

### Unificar cotizacionesService.ts:
```typescript
// Eliminar la clase CotizacionesService, dejar solo funciones:
export const obtenerCotizaciones = async () => { ... };
export const obtenerCotizacionDetalle = async (id: number) => { ... };
export const obtenerClientes = async () => { ... };
export const crearCotizacion = async (datos, productos) => { ... };
export const eliminarCotizacion = async (id: number) => { ... };
```

---

## Fase 7: Separar tipos compartidos

### Mover tipos de `src/types/cotizacion.ts` a cada feature:

| Tipo | Destino |
|------|---------|
| `Servicio` | `@features/servicios/types/servicio.types.ts` |
| `ProductoServicio` | `@features/productos/types/producto.types.ts` |
| `PlantillaCotizacion`, `PlantillaDB` | `@features/plantillas/types/plantilla.types.ts` |
| `Cotizacion`, `DatosCotizacion`, `Producto` | `@features/cotizaciones/types/cotizacion.types.ts` |

### Re-exportar desde shared para compatibilidad:
```typescript
// src/shared/types/index.ts
export type { Servicio } from '@features/servicios/types/servicio.types';
export type { ProductoServicio } from '@features/productos/types/producto.types';
// ...
```

---

## Fase 8: Limpieza final

1. Actualizar `App.tsx` con imports desde `@features/*`
2. Eliminar re-exports obsoletos
3. Eliminar carpetas legacy vacías: `src/pages/`, `src/services/`, `src/contexts/`
4. Resolver rutas duplicadas (`/productos` vs `/configuracion/productos`)

---

## Archivos Críticos

1. `src/pages/NuevaCotizacion.tsx` - 647 loc, dividir en 6+ archivos
2. `src/pages/CotizacionesLista.tsx` - 433 loc, dividir en 4+ archivos
3. `src/services/cotizacionesService.ts` - Unificar clase+funciones
4. `src/services/plantillasService.ts` - Refactorear clase a funciones
5. `src/types/cotizacion.ts` - Separar por feature
6. `tsconfig.json` + `vite.config.ts` - Agregar path aliases

---

## Verificación (después de cada fase)

```bash
pnpm lint        # Sin errores
pnpm build       # Compila exitosamente
pnpm dev         # App funciona, sin errores de consola
```

### Tests manuales por feature:
- **Auth**: Login/logout funciona, rutas protegidas redirigen
- **Servicios**: CRUD servicios funciona
- **Productos**: CRUD productos funciona, filtro por servicio
- **Plantillas**: Crear/editar/eliminar plantillas
- **Cotizaciones**: Crear cotización, exportar PDF/Word, ver lista

---

## Progreso

- [ ] Fase 0.1: Configurar path aliases
- [ ] Fase 0.2: Crear estructura de carpetas
- [ ] Fase 1: Migrar infrastructure
- [ ] Fase 2: Migrar feature Auth
- [ ] Fase 3: Migrar feature Servicios
- [ ] Fase 4: Migrar feature Productos
- [ ] Fase 5: Migrar feature Plantillas
- [ ] Fase 6: Migrar feature Cotizaciones
- [ ] Fase 7: Separar tipos compartidos
- [ ] Fase 8: Limpieza final
