# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SaaS Cotizaciones is a quotation management system for creating, managing, and exporting quotations as PDF documents. Built with React 18, TypeScript, Vite, and Tailwind CSS. Uses shadcn/ui components with Radix UI primitives.

## Commands

```bash
pnpm dev          # Start development server (port 8080)
pnpm build        # Production build
pnpm build:dev    # Development build
pnpm lint         # Run ESLint
pnpm test         # Run Vitest tests
pnpm test:ui      # Run tests with UI
pnpm preview      # Preview production build
```

## Architecture

### Directory Structure

- `src/pages/` - Route page components (smart components with business logic)
- `src/components/` - Reusable components (Header, ProtectedRoute, VistaPrevia, StatusBadge, ThemeToggle)
- `src/components/ui/` - shadcn/ui library components (58+ components)
- `src/contexts/` - React Context providers (AuthContext for authentication)
- `src/services/` - Business logic services (PlantillasService for template CRUD)
- `src/types/` - TypeScript type definitions (cotizacion.ts)
- `src/hooks/` - Custom hooks (useIsMobile, useToast)
- `src/data/` - Mock data (cotizacionesMock, serviciosMock)
- `src/lib/` - Utilities (cn function for class merging)

### Routing (React Router v6)

| Path | Component | Protected |
|------|-----------|-----------|
| `/login` | Login | No |
| `/` | CotizacionesLista | Yes |
| `/nueva` | NuevaCotizacion | Yes |
| `/plantillas` | Plantillas | Yes |

### State Management

1. **AuthContext** - Authentication state with localStorage persistence
   - Test credentials: `admin@cotizaciones.cl` / `admin123`
2. **Local state** - useState for forms, filters, modals
3. **PlantillasService** - localStorage-based template storage (key: `plantillas_cotizaciones`)
4. **React Query** - Provider configured, ready for API integration

### Key Patterns

- **ProtectedRoute** wraps authenticated routes, redirects to `/login`
- **PlantillasService** uses static methods for template CRUD with error handling
- **VistaPrevia** uses forwardRef for PDF generation via html2canvas + jsPDF
- **Theme** managed by next-themes with class-based dark mode

### Core Types (src/types/cotizacion.ts)

```typescript
EstadoCotizacion = "aprobada" | "pendiente" | "rechazada" | "expirada"
Cotizacion       // Quotation summary (id, numero, cliente, fecha, montoTotal, estado)
Producto         // Line item (id, descripcion, cantidad, precioUnitario)
DatosCotizacion  // Full quotation data with productos array
PlantillaCotizacion // Saved template with metadata and datos
```

### Localization

- Language: Spanish
- Currency: CLP (Chilean Pesos) with 19% IVA
- Date format: dd/mm/yyyy

## Key Files

- `src/App.tsx` - Routing and provider setup
- `src/contexts/AuthContext.tsx` - Authentication logic
- `src/pages/NuevaCotizacion.tsx` - Main quotation form (most complex page)
- `src/services/plantillasService.ts` - Template CRUD operations
- `src/components/VistaPrevia.tsx` - PDF preview template
