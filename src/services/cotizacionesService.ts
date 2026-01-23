import { supabase } from "@/api/conection";
import { Cotizacion, DatosCotizacion, EstadoCotizacion, Producto } from "@/types/cotizacion";

type CotizacionDB = {
  id?: string | number | null;
  numero?: string | null;
  codigo?: string | null;
  cliente?: string | null;
  nombre_cliente?: string | null;
  fecha?: string | null;
  fecha_emision?: string | null;
  created_at?: string | null;
  monto_total?: number | string | null;
  montoTotal?: number | string | null;
  total?: number | string | null;
  monto?: number | string | null;
  estado?: string | null;
  status?: string | null;
};

type CotizacionCuerpoDB = {
  id: string;
  cotizacion_id: number;
  servicio_id: number | null;
  producto_id: number | null;
  nombre_servicio: string;
  nombre_producto: string;
  descripcion_producto: string | null;
  cantidad: number | string;
  precio_unitario: number | string;
  subtotal: number | string;
  created_at: string;
};

type CotizacionConsideracionDB = {
  id: number;
  cotizacion_id: number;
  texto: string;
  orden: number | null;
  created_at: string;
};

export type CotizacionDetalle = {
  cotizacion: CotizacionDB;
  cuerpo: CotizacionCuerpoDB[];
  consideraciones: CotizacionConsideracionDB[];
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeEstado = (value: unknown): EstadoCotizacion => {
  const estado = String(value ?? "").toLowerCase();
  if (estado === "aprobada") return "aprobada";
  if (estado === "pendiente") return "pendiente";
  if (estado === "rechazada") return "rechazada";
  if (estado === "expirada") return "expirada";
  return "pendiente";
};

const formatFecha = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("es-CL");
};

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

const parseProductoId = (producto: Producto): number | null => {
  if (typeof producto.productoId === "number") return producto.productoId;
  const parsed = Number(producto.id);
  return Number.isFinite(parsed) ? parsed : null;
};

const calcularTotal = (productos: Producto[], descuento: number) => {
  const subtotal = productos.reduce(
    (acc, producto) => acc + producto.cantidad * producto.precioUnitario,
    0
  );
  const total = subtotal * (1 - Math.min(Math.max(descuento, 0), 100) / 100);
  return { subtotal, total };
};

export const obtenerCotizaciones = async (): Promise<Cotizacion[]> => {
  const { data, error } = await supabase
    .from("cotizaciones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener cotizaciones:", error);
    throw new Error("No se pudieron obtener las cotizaciones");
  }

  return (data ?? []).map((cotizacion, index) => {
    const item = cotizacion as CotizacionDB;
    const idBase = item.id ?? item.numero ?? item.created_at ?? index;

    return {
      id: String(idBase),
      numero: item.numero ?? item.codigo ?? String(item.id ?? idBase),
      cliente: item.cliente ?? item.nombre_cliente ?? "Sin cliente",
      fecha: formatFecha(item.fecha ?? item.fecha_emision ?? item.created_at ?? ""),
      montoTotal: toNumber(item.monto_total ?? item.montoTotal ?? item.total ?? item.monto ?? 0),
      estado: normalizeEstado(item.estado ?? item.status),
    };
  });
};

export const obtenerCotizacionDetalle = async (
  id: number | string
): Promise<CotizacionDetalle> => {
  const cotizacionId = Number(id);
  if (!Number.isFinite(cotizacionId)) {
    throw new Error("ID de cotización inválido");
  }

  const { data: cotizacion, error: errorCotizacion } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("id", cotizacionId)
    .single();

  if (errorCotizacion || !cotizacion) {
    console.error("Error al obtener cotización:", errorCotizacion);
    throw new Error("No se pudo obtener la cotización");
  }

  const { data: cuerpo, error: errorCuerpo } = await supabase
    .from("cotizacion_cuerpo")
    .select("*")
    .eq("cotizacion_id", cotizacionId)
    .order("created_at", { ascending: true });

  if (errorCuerpo) {
    console.error("Error al obtener cuerpo de cotización:", errorCuerpo);
    throw new Error("No se pudo obtener el detalle de la cotización");
  }

  const { data: consideraciones, error: errorConsideraciones } = await supabase
    .from("cotizacion_consideraciones")
    .select("*")
    .eq("cotizacion_id", cotizacionId)
    .order("orden", { ascending: true });

  if (errorConsideraciones) {
    console.error("Error al obtener consideraciones:", errorConsideraciones);
    throw new Error("No se pudieron obtener las consideraciones");
  }

  return {
    cotizacion: cotizacion as CotizacionDB,
    cuerpo: (cuerpo ?? []) as CotizacionCuerpoDB[],
    consideraciones: (consideraciones ?? []) as CotizacionConsideracionDB[],
  };
};

export const crearCotizacion = async (
  datos: DatosCotizacion,
  productos: Producto[]
): Promise<number> => {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("Usuario no autenticado");
  }

  const descuento = datos.descuento ?? 0;
  const { total } = calcularTotal(productos, descuento);

  const { data: cotizacionCreada, error: errorCotizacion } = await supabase
    .from("cotizaciones")
    .insert({
      nombre_cliente: datos.cliente,
      evento: datos.evento || null,
      descuento,
      fecha: datos.fecha || null,
      total,
      user_id: authData.user.id,
    })
    .select("id")
    .single();

  if (errorCotizacion || !cotizacionCreada) {
    console.error("Error al crear cotización:", errorCotizacion);
    throw new Error("No se pudo guardar la cotización");
  }

  const cotizacionId = cotizacionCreada.id as number;

  const detalles = productos.map((producto) => ({
    id: generateId(),
    cotizacion_id: cotizacionId,
    servicio_id: producto.servicioId ?? null,
    producto_id: parseProductoId(producto),
    nombre_servicio: producto.nombreServicio || "Servicio",
    nombre_producto: producto.descripcion || "Producto",
    descripcion_producto: producto.descripcionProducto ?? null,
    cantidad: producto.cantidad,
    precio_unitario: producto.precioUnitario,
    subtotal: producto.cantidad * producto.precioUnitario,
  }));

  const { error: errorDetalle } = await supabase
    .from("cotizacion_cuerpo")
    .insert(detalles);

  if (errorDetalle) {
    console.error("Error al crear detalle de cotización:", errorDetalle);
    await supabase.from("cotizaciones").delete().eq("id", cotizacionId);
    throw new Error("No se pudieron guardar los productos de la cotización");
  }

  const consideraciones = datos.consideraciones
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter(Boolean);

  if (consideraciones.length > 0) {
    const consideracionesDB = consideraciones.map((texto, index) => ({
      cotizacion_id: cotizacionId,
      texto,
      orden: index + 1,
    }));

    const { error: errorConsideraciones } = await supabase
      .from("cotizacion_consideraciones")
      .insert(consideracionesDB);

    if (errorConsideraciones) {
      console.error("Error al guardar consideraciones:", errorConsideraciones);
      await supabase.from("cotizacion_cuerpo").delete().eq("cotizacion_id", cotizacionId);
      await supabase.from("cotizaciones").delete().eq("id", cotizacionId);
      throw new Error("No se pudieron guardar las consideraciones");
    }
  }

  return cotizacionId;
};
