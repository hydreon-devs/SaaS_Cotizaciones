export type EstadoCotizacion = "aprobada" | "pendiente" | "rechazada" | "expirada";

export interface Cotizacion {
  id: string;
  numero: string;
  cliente: string;
  fecha: string;
  montoTotal: number;
  estado: EstadoCotizacion;
}

export interface Servicio {
  id: number;
  nombre: string | null;
  descripcion: string | null;
  estado: string | null;
  created_at: string;
  updated_at: string;
}

export interface Producto {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  productoId?: number | null;
  servicioId?: number | null;
  nombreServicio?: string | null;
  descripcionProducto?: string | null;
}

export interface ProductoServicio {
  id: number;
  id_servicio: number;
  nombre: string | null;
  descripcion: string | null;
  precio: number | null;
  estado: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatosCotizacion {
  cliente: string;
  evento: string;
  consideraciones: string;
  descuento: number;
  fecha: string;
  nombreEncargado: string;
  cargo: string;
  productos: Producto[];
}

export interface PlantillaCotizacion {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  autor: string; // Nombre del creador de la plantilla
  fechaCreacion: string; // ISO string de fecha de creación
  datos: DatosCotizacion;
}

// ==========================================
// Tipos para la estructura normalizada de BD
// ==========================================

/**
 * Producto dentro de un servicio de plantilla (tabla: plantilla_productos)
 */
export interface PlantillaProductoDB {
  id: string;
  plantilla_servicio_id: string;
  producto_id: number | null;
  nombre_producto: string;
  descripcion_producto: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
}

/**
 * Servicio de plantilla con sus productos (tabla: plantilla_servicios)
 */
export interface PlantillaServicioDB {
  id: string;
  plantilla_id: string;
  servicio_id: number | null;
  nombre_servicio: string;
  descripcion_servicio: string | null;
  orden: number | null;
  created_at: string;
  productos?: PlantillaProductoDB[];
}

/**
 * Plantilla principal (tabla: plantillas)
 */
export interface PlantillaDB {
  id: string;
  nombre: string;
  descripcion: string | null;
  es_publica: boolean | null;
  version: number | null;
  activo: boolean | null;
  user_id: string | null;
  descuento: number | null;
  created_at: string;
  updated_at: string;
  servicios?: PlantillaServicioDB[];
}
