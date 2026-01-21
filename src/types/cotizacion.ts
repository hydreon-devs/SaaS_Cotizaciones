export type EstadoCotizacion = "aprobada" | "pendiente" | "rechazada" | "expirada";

export interface Cotizacion {
  id: string;
  numero: string;
  cliente: string;
  fecha: string;
  montoTotal: number;
  estado: EstadoCotizacion;
}

export interface Producto {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
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
