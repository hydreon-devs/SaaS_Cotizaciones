import { Cotizacion, CotizacionDB, DatosCotizacion, Producto } from '@/types/cotizacion';
import { supabase } from '@/api/conection';

/**
 * Formatea la fecha de la BD al formato dd/mm/yyyy
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Genera un número de cotización basado en el ID
 */
function generateNumero(id: number): string {
  return `COT-${id.toString().padStart(5, '0')}`;
}

/**
 * Convierte la estructura de BD al formato de lista
 */
function toAppFormat(cotizacionDB: CotizacionDB): Cotizacion {
  return {
    id: cotizacionDB.id.toString(),
    numero: generateNumero(cotizacionDB.id),
    cliente: cotizacionDB.nombre_cliente || 'Sin nombre',
    fecha: formatDate(cotizacionDB.fecha || cotizacionDB.created_at),
    montoTotal: Number(cotizacionDB.total) || 0,
    estado: 'pendiente',
  };
}

/**
 * Convierte una cotización completa de BD al formato DatosCotizacion para precargar
 */
function toDatosCotizacion(cotizacionDB: CotizacionDB): DatosCotizacion {
  // Convertir el cuerpo de la cotización a productos
  const productos: Producto[] = (cotizacionDB.cuerpo || []).map((item) => ({
    id: item.id,
    descripcion: item.nombre_producto || item.descripcion_producto || '',
    cantidad: Number(item.cantidad) || 1,
    precioUnitario: Number(item.precio_unitario) || 0,
  }));

  // Concatenar las consideraciones ordenadas
  const consideraciones = (cotizacionDB.consideraciones || [])
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    .map((c) => c.texto)
    .join('\n');

  return {
    cliente: cotizacionDB.nombre_cliente || '',
    evento: cotizacionDB.evento || '',
    consideraciones,
    descuento: Number(cotizacionDB.descuento) || 0,
    fecha: cotizacionDB.fecha || '',
    nombreEncargado: '',
    cargo: '',
    productos,
  };
}

/**
 * Servicio para gestionar cotizaciones en Supabase
 */
export class CotizacionesService {
  /**
   * Obtiene todas las cotizaciones (visibles para todos los usuarios)
   */
  static async obtenerTodas(): Promise<Cotizacion[]> {
    const { data: cotizaciones, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener cotizaciones:', error);
      throw new Error('No se pudieron obtener las cotizaciones');
    }

    return (cotizaciones || []).map(toAppFormat);
  }

  /**
   * Obtiene una cotización por su ID con todos sus detalles para precargar
   */
  static async obtenerPorId(id: number): Promise<DatosCotizacion | null> {
    const { data: cotizacion, error } = await supabase
      .from('cotizaciones')
      .select(`
        *,
        cuerpo:cotizacion_cuerpo (*),
        consideraciones:cotizacion_consideraciones (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error al obtener cotización:', error);
      throw new Error('No se pudo obtener la cotización');
    }

    return toDatosCotizacion(cotizacion);
  }

  /**
   * Obtiene los clientes únicos de las cotizaciones para los filtros
   */
  static async obtenerClientes(): Promise<string[]> {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('nombre_cliente')
      .not('nombre_cliente', 'is', null);

    if (error) {
      console.error('Error al obtener clientes:', error);
      return [];
    }

    const clientesUnicos = [...new Set(
      (data || [])
        .map((c) => c.nombre_cliente)
        .filter((c): c is string => c !== null && c.trim() !== '')
    )];

    return clientesUnicos;
  }
}
