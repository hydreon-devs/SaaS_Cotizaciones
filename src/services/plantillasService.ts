import {
  PlantillaCotizacion,
  DatosCotizacion,
  Producto,
  PlantillaDB,
  PlantillaServicioDB,
  PlantillaProductoDB
} from '@/types/cotizacion';
import { supabase } from '@/api/conection';

/**
 * Genera un ID único para las tablas que usan varchar como PK
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Convierte la estructura normalizada de BD a formato de la aplicación
 */
function toAppFormat(plantillaDB: PlantillaDB): PlantillaCotizacion {
  // Extraer todos los productos de todos los servicios y convertirlos al formato Producto
  const productos: Producto[] = [];

  if (plantillaDB.servicios) {
    for (const servicio of plantillaDB.servicios) {
      if (servicio.productos) {
        for (const producto of servicio.productos) {
          productos.push({
            id: producto.id,
            descripcion: producto.nombre_producto,
            cantidad: producto.cantidad,
            precioUnitario: producto.precio_unitario,
          });
        }
      }
    }
  }

  // Crear el objeto DatosCotizacion con valores por defecto
  // El descuento se obtiene de la plantilla si existe
  const datos: DatosCotizacion = {
    cliente: '',
    evento: '',
    consideraciones: '',
    descuento: plantillaDB.descuento ?? 0,
    fecha: '',
    nombreEncargado: '',
    cargo: '',
    productos,
  };

  return {
    id: plantillaDB.id,
    nombre: plantillaDB.nombre,
    descripcion: plantillaDB.descripcion || '',
    icono: 'FileText', // Valor por defecto ya que no existe en la BD
    color: 'bg-blue-500', // Valor por defecto ya que no existe en la BD
    autor: 'Sistema', // Se podría obtener del user_id si se necesita
    fechaCreacion: plantillaDB.created_at,
    datos,
  };
}

/**
 * Servicio para gestionar plantillas en Supabase
 * HU-02: Gestión de Plantillas (CRUD)
 * Trabaja con estructura normalizada: plantillas → plantilla_servicios → plantilla_productos
 */
export class PlantillasService {
  /**
   * Obtiene todas las plantillas con sus servicios y productos relacionados
   */
  static async obtenerTodas(): Promise<PlantillaCotizacion[]> {
    // Obtener plantillas con servicios anidados
    const { data: plantillas, error: errorPlantillas } = await supabase
      .from('plantillas')
      .select(`
        *,
        servicios:plantilla_servicios (
          *,
          productos:plantilla_productos (*)
        )
      `)
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (errorPlantillas) {
      console.error('Error al obtener plantillas:', errorPlantillas);
      throw new Error('No se pudieron obtener las plantillas');
    }

    return (plantillas || []).map(toAppFormat);
  }

  /**
   * Obtiene una plantilla por su ID
   */
  static async obtenerPorId(id: string): Promise<PlantillaCotizacion | null> {
    const { data: plantilla, error } = await supabase
      .from('plantillas')
      .select(`
        *,
        servicios:plantilla_servicios (
          *,
          productos:plantilla_productos (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error al obtener plantilla:', error);
      throw new Error('No se pudo obtener la plantilla');
    }

    return toAppFormat(plantilla);
  }

  /**
   * Crea una nueva plantilla con sus servicios y productos
   */
  static async crear(
    nombre: string,
    descripcion: string,
    datos: DatosCotizacion,
    _autor: string,
    _icono: string = 'FileText',
    _color: string = 'bg-gray-500'
  ): Promise<PlantillaCotizacion> {
    if (!nombre) {
      throw new Error('El nombre es requerido');
    }

    // Obtener el usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    const plantillaId = generateId();

    // 1. Crear la plantilla principal
    const { error: errorPlantilla } = await supabase
      .from('plantillas')
      .insert({
        id: plantillaId,
        nombre,
        descripcion,
        es_publica: true,
        version: 1,
        activo: true,
        user_id: user.id,
        descuento: datos.descuento ?? 0,
      });

    if (errorPlantilla) {
      console.error('Error al crear plantilla:', errorPlantilla);
      throw new Error('No se pudo crear la plantilla');
    }

    // 2. Crear un servicio genérico para agrupar los productos
    if (datos.productos.length > 0) {
      const servicioId = generateId();

      const { error: errorServicio } = await supabase
        .from('plantilla_servicios')
        .insert({
          id: servicioId,
          plantilla_id: plantillaId,
          nombre_servicio: 'Servicios',
          descripcion_servicio: 'Servicios de la plantilla',
          orden: 1,
        });

      if (errorServicio) {
        console.error('Error al crear servicio de plantilla:', errorServicio);
        // Rollback: eliminar la plantilla creada
        await supabase.from('plantillas').delete().eq('id', plantillaId);
        throw new Error('No se pudo crear el servicio de la plantilla');
      }

      // 3. Crear los productos asociados al servicio
      const productosDB = datos.productos.map((producto, index) => ({
        id: generateId(),
        plantilla_servicio_id: servicioId,
        nombre_producto: producto.descripcion,
        descripcion_producto: producto.descripcion,
        cantidad: producto.cantidad,
        precio_unitario: producto.precioUnitario,
        subtotal: producto.cantidad * producto.precioUnitario,
      }));

      const { error: errorProductos } = await supabase
        .from('plantilla_productos')
        .insert(productosDB);

      if (errorProductos) {
        console.error('Error al crear productos de plantilla:', errorProductos);
        // Rollback: eliminar servicio y plantilla
        await supabase.from('plantilla_servicios').delete().eq('id', servicioId);
        await supabase.from('plantillas').delete().eq('id', plantillaId);
        throw new Error('No se pudieron crear los productos de la plantilla');
      }
    }

    // Obtener la plantilla creada con todos sus datos relacionados
    const plantillaCreada = await this.obtenerPorId(plantillaId);
    if (!plantillaCreada) {
      throw new Error('Error al recuperar la plantilla creada');
    }

    return plantillaCreada;
  }

  /**
   * Actualiza una plantilla existente (solo metadatos, no productos)
   */
  static async actualizar(
    id: string,
    actualizaciones: Partial<Omit<PlantillaCotizacion, 'id' | 'fechaCreacion'>>
  ): Promise<PlantillaCotizacion> {
    const updateData: Record<string, unknown> = {};

    if (actualizaciones.nombre) updateData.nombre = actualizaciones.nombre;
    if (actualizaciones.descripcion !== undefined) updateData.descripcion = actualizaciones.descripcion;
    if (actualizaciones.datos?.descuento !== undefined) updateData.descuento = actualizaciones.datos.descuento;
    // icono y color no existen en la BD, se ignoran

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('plantillas')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar plantilla:', error);
      if (error.code === 'PGRST116') {
        throw new Error(`No se encontró la plantilla con ID: ${id}`);
      }
      throw new Error('No se pudo actualizar la plantilla');
    }

    const plantillaActualizada = await this.obtenerPorId(id);
    if (!plantillaActualizada) {
      throw new Error('Error al recuperar la plantilla actualizada');
    }

    return plantillaActualizada;
  }

  /**
   * Elimina una plantilla y todos sus datos relacionados (cascade)
   */
  static async eliminar(id: string): Promise<boolean> {
    // Primero obtener los servicios para poder eliminar sus productos
    const { data: servicios } = await supabase
      .from('plantilla_servicios')
      .select('id')
      .eq('plantilla_id', id);

    if (servicios && servicios.length > 0) {
      const servicioIds = servicios.map(s => s.id);

      // Eliminar productos de los servicios
      const { error: errorProductos } = await supabase
        .from('plantilla_productos')
        .delete()
        .in('plantilla_servicio_id', servicioIds);

      if (errorProductos) {
        console.error('Error al eliminar productos:', errorProductos);
        throw new Error('No se pudieron eliminar los productos de la plantilla');
      }

      // Eliminar servicios
      const { error: errorServicios } = await supabase
        .from('plantilla_servicios')
        .delete()
        .eq('plantilla_id', id);

      if (errorServicios) {
        console.error('Error al eliminar servicios:', errorServicios);
        throw new Error('No se pudieron eliminar los servicios de la plantilla');
      }
    }

    // Finalmente eliminar la plantilla
    const { error } = await supabase
      .from('plantillas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar plantilla:', error);
      throw new Error(`No se pudo eliminar la plantilla con ID: ${id}`);
    }

    return true;
  }
}
