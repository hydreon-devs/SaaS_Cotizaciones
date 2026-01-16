import { PlantillaCotizacion, DatosCotizacion } from '@/types/cotizacion';

const STORAGE_KEY = 'plantillas_cotizaciones';

/**
 * Servicio para gestionar plantillas en localStorage
 * HU-02: Gestión de Plantillas (CRUD)
 */
export class PlantillasService {
  /**
   * Obtiene todas las plantillas guardadas
   */
  static obtenerTodas(): PlantillaCotizacion[] {
    try {
      const plantillas = localStorage.getItem(STORAGE_KEY);
      return plantillas ? JSON.parse(plantillas) : [];
    } catch (error) {
      console.error('Error al obtener plantillas:', error);
      return [];
    }
  }

  /**
   * Obtiene una plantilla específica por ID
   */
  static obtenerPorId(id: string): PlantillaCotizacion | null {
    const plantillas = this.obtenerTodas();
    return plantillas.find(p => p.id === id) || null;
  }

  /**
   * Crea una nueva plantilla
   */
  static crear(
    nombre: string,
    descripcion: string,
    datos: DatosCotizacion,
    autor: string,
    icono: string = 'FileText',
    color: string = 'bg-gray-500'
  ): PlantillaCotizacion {
    if (!nombre || !autor) {
      throw new Error('El nombre y el autor son requeridos');
    }

    const plantillas = this.obtenerTodas();
    const nuevaPlantilla: PlantillaCotizacion = {
      id: this.generarId(),
      nombre,
      descripcion,
      icono,
      color,
      autor,
      fechaCreacion: new Date().toISOString(),
      datos,
    };

    plantillas.push(nuevaPlantilla);
    this.guardarTodas(plantillas);

    return nuevaPlantilla;
  }

  /**
   * Actualiza una plantilla existente
   */
  static actualizar(
    id: string,
    actualizaciones: Partial<Omit<PlantillaCotizacion, 'id' | 'fechaCreacion'>>
  ): PlantillaCotizacion {
    const plantillas = this.obtenerTodas();
    const indice = plantillas.findIndex(p => p.id === id);

    if (indice === -1) {
      throw new Error(`No se encontró la plantilla con ID: ${id}`);
    }

    const plantillaActualizada = {
      ...plantillas[indice],
      ...actualizaciones,
      // Preservar id y fechaCreacion original
      id: plantillas[indice].id,
      fechaCreacion: plantillas[indice].fechaCreacion,
    };

    plantillas[indice] = plantillaActualizada;
    this.guardarTodas(plantillas);

    return plantillaActualizada;
  }

  /**
   * Elimina una plantilla
   */
  static eliminar(id: string): boolean {
    const plantillas = this.obtenerTodas();
    const plantillasFiltradas = plantillas.filter(p => p.id !== id);

    if (plantillas.length === plantillasFiltradas.length) {
      throw new Error(`No se encontró la plantilla con ID: ${id}`);
    }

    this.guardarTodas(plantillasFiltradas);
    return true;
  }

  /**
   * Guarda todas las plantillas en localStorage
   */
  private static guardarTodas(plantillas: PlantillaCotizacion[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plantillas));
    } catch (error) {
      console.error('Error al guardar plantillas:', error);
      throw new Error('No se pudieron guardar las plantillas');
    }
  }

  /**
   * Genera un ID único para una plantilla
   */
  private static generarId(): string {
    return `plantilla-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Limpia todas las plantillas (útil para testing)
   */
  static limpiarTodas(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
