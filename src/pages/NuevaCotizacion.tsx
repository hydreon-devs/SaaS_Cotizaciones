import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Trash2, Download, Save, Loader2, RotateCcw } from "lucide-react";
import VistaPrevia from "@/components/VistaPrevia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatosCotizacion, Producto, ProductoServicio, Servicio } from "@/types/cotizacion";
import { PlantillasService } from "@/services/plantillasService";
import { crearCotizacion } from "@/services/cotizacionesService";
import { obtenerServicios } from "@/services/serviciosService";
import { obtenerProductos } from "@/services/productosService";
import { WordExportService } from "@/services/wordExportService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const NuevaCotizacion = () => {
  const location = useLocation();
  const { user } = useAuth();
  const plantillaData = location.state?.plantilla as DatosCotizacion | undefined;
  const cotizacionData = location.state?.cotizacion as DatosCotizacion | undefined;
  const vistaPreviaRef = useRef<HTMLDivElement>(null);

  const [datos, setDatos] = useState<DatosCotizacion>({
    cliente: "",
    evento: "",
    consideraciones: "",
    descuento: 0,
    iva: 19,
    fecha: "",
    nombreEncargado: "Carlos Jaramillo",
    cargo: "Director general",
    productos: [],
  });

  const [ivaHabilitado, setIvaHabilitado] = useState(true);
  const ivaGuardadoRef = useRef<number>(19);

  useEffect(() => {
    const dataBase = cotizacionData ?? plantillaData;
    if (!dataBase) return;

    const productos = dataBase.productos.map((p, index) => {
      const productoId =
        typeof p.productoId === "number"
          ? p.productoId
          : Number.isFinite(Number(p.id))
            ? Number(p.id)
            : null;

      return {
        ...p,
        id: `${Date.now()}-${index}`,
        productoId,
      };
    });

    setDatos({
      ...dataBase,
      productos,
    });

    if (cotizacionData) {
      toast.success("Cotización cargada correctamente");
    } else {
      toast.success("Plantilla cargada correctamente");
    }
  }, []);

  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>("");
  const [dialogPlantillaAbierto, setDialogPlantillaAbierto] = useState(false);
  const [nombrePlantilla, setNombrePlantilla] = useState("");
  const [descripcionPlantilla, setDescripcionPlantilla] = useState("");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [productosServicio, setProductosServicio] = useState<ProductoServicio[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [guardandoCotizacion, setGuardandoCotizacion] = useState(false);
  const [guardandoPlantilla, setGuardandoPlantilla] = useState(false);
  const [descargandoWord, setDescargandoWord] = useState(false);

  const handleInputChange = (field: keyof DatosCotizacion, value: string | number) => {
    setDatos((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleIva = useCallback((habilitado: boolean) => {
    if (!habilitado) {
      ivaGuardadoRef.current = datos.iva ?? 19;
      setDatos((prev) => ({ ...prev, iva: 0 }));
    } else {
      setDatos((prev) => ({ ...prev, iva: ivaGuardadoRef.current }));
    }
    setIvaHabilitado(habilitado);
  }, [datos.iva]);

  useEffect(() => {
    let activo = true;

    const cargarServicios = async () => {
      setCargandoServicios(true);
      try {
        const data = await obtenerServicios();
        if (!activo) return;
        setServicios(data);
      } catch (error) {
        if (!activo) return;
        console.error(error);
        toast.error("No se pudieron cargar los servicios");
      } finally {
        if (activo) setCargandoServicios(false);
      }
    };

    cargarServicios();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;

    const cargarProductos = async () => {
      if (!servicioSeleccionado) {
        setProductosServicio([]);
        return;
      }

      setCargandoProductos(true);
      try {
        const data = await obtenerProductos(Number(servicioSeleccionado));
        if (!activo) return;
        setProductosServicio(data);
      } catch (error) {
        if (!activo) return;
        console.error(error);
        toast.error("No se pudieron cargar los productos del servicio");
      } finally {
        if (activo) setCargandoProductos(false);
      }
    };

    cargarProductos();

    return () => {
      activo = false;
    };
  }, [servicioSeleccionado]);

  const handleAgregarProducto = (producto: ProductoServicio) => {
    const productoId = String(producto.id);
    const nombreServicio =
      servicios.find((servicio) => servicio.id === producto.id_servicio)?.nombre ||
      "Servicio";

    setDatos((prev) => {
      const existe = prev.productos.some((item) => item.productoId === producto.id);
      if (existe) {
        return prev;
      }

      const nuevoProducto: Producto = {
        id: productoId,
        descripcion: producto.nombre || "Producto sin nombre",
        cantidad: 1,
        precioUnitario: producto.precio ?? 0,
        productoId: producto.id,
        servicioId: producto.id_servicio,
        nombreServicio,
        descripcionProducto: producto.descripcion ?? null,
      };

      return {
        ...prev,
        productos: [...prev.productos, nuevoProducto],
      };
    });

    toast.success("Producto agregado");
  };

  const handleAgregarTodos = () => {
    if (productosServicio.length === 0) {
      toast.error("No hay productos disponibles para este servicio");
      return;
    }

    setDatos((prev) => {
      const existentes = new Set(prev.productos.map((item) => item.productoId).filter(Boolean));
      const nuevos = productosServicio
        .filter((producto) => !existentes.has(producto.id))
        .map((producto) => {
          const nombreServicio =
            servicios.find((servicio) => servicio.id === producto.id_servicio)?.nombre ||
            "Servicio";
          return {
            id: String(producto.id),
            descripcion: producto.nombre || "Producto sin nombre",
            cantidad: 1,
            precioUnitario: producto.precio ?? 0,
            productoId: producto.id,
            servicioId: producto.id_servicio,
            nombreServicio,
            descripcionProducto: producto.descripcion ?? null,
          };
        });

      if (nuevos.length === 0) return prev;

      return {
        ...prev,
        productos: [...prev.productos, ...nuevos],
      };
    });

    toast.success("Productos agregados");
  };

  const handleEliminarProducto = (id: string) => {
    setDatos((prev) => ({
      ...prev,
      productos: prev.productos.filter((p) => p.id !== id),
    }));
    toast.info("Producto eliminado");
  };

  const handleCantidadChange = (id: string, cantidad: number) => {
    setDatos((prev) => ({
      ...prev,
      productos: prev.productos.map((p) =>
        p.id === id ? { ...p, cantidad: Math.max(1, cantidad) } : p
      ),
    }));
  };

  const handleGuardarCotizacion = async () => {
    if (!datos.cliente) {
      toast.error("Ingresa el nombre del cliente");
      return;
    }
    if (datos.productos.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }
    try {
      setGuardandoCotizacion(true);
      await crearCotizacion(datos, datos.productos);
      toast.success("Cotización guardada exitosamente");
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "No se pudo guardar la cotización";
      toast.error(mensaje);
    } finally {
      setGuardandoCotizacion(false);
    }
  };

  const handleAbrirDialogoPlantilla = () => {
    if (datos.productos.length === 0) {
      toast.error("Agrega al menos un producto antes de guardar como plantilla");
      return;
    }
    setDialogPlantillaAbierto(true);
  };

  const handleGuardarComoPlantilla = async () => {
    if (!nombrePlantilla.trim()) {
      toast.error("Ingresa un nombre para la plantilla");
      return;
    }

    try {
      setGuardandoPlantilla(true);
      await PlantillasService.crear(
        nombrePlantilla,
        descripcionPlantilla,
        datos,
        user?.name || "Usuario", // Usar el nombre del usuario logueado
        "FileText",
        "bg-blue-500"
      );

      toast.success("Plantilla guardada exitosamente");
      setDialogPlantillaAbierto(false);
      setNombrePlantilla("");
      setDescripcionPlantilla("");
    } catch (error) {
      toast.error("Error al guardar la plantilla");
      console.error(error);
    } finally {
      setGuardandoPlantilla(false);
    }
  };

  const handleDescargarWord = async () => {
    setDescargandoWord(true);
    try {
      await WordExportService.generarDocumento(datos);
      toast.success("Documento Word descargado correctamente");
    } catch (error) {
      toast.error("Error al generar el documento Word");
      console.error(error);
    } finally {
      setDescargandoWord(false);
    }
  };

  const handleLimpiarDatos = () => {
    setDatos({
      cliente: "",
      evento: "",
      consideraciones: "",
      descuento: 0,
      iva: 19,
      fecha: "",
      nombreEncargado: "Carlos Jaramillo",
      cargo: "Director general",
      productos: [],
    });
    setIvaHabilitado(true);
    ivaGuardadoRef.current = 19;
    setServicioSeleccionado("");
    setProductosServicio([]);
    toast.success("Datos limpiados correctamente");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
        <div className="mb-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Generador de cotizaciones</h1>
            <p className="text-sm text-muted-foreground">
              Crea cotizaciones de manera rápida y sencilla
            </p>
          </div>
          <div className="mt-2 flex justify-end">
            <Button
              onClick={handleLimpiarDatos}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpiar datos
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información de cotización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Cliente / Empresa
                    </label>
                    <Input
                      placeholder="Ingrese nombre completo"
                      value={datos.cliente}
                      onChange={(e) => handleInputChange("cliente", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Evento</label>
                    <Input
                      placeholder="Nombre del evento"
                      value={datos.evento}
                      onChange={(e) => handleInputChange("evento", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Consideraciones (una por línea)
                  </label>
                  <Textarea
                    placeholder="Consideraciones"
                    value={datos.consideraciones}
                    onChange={(e) => handleInputChange("consideraciones", e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Descuento (%)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={datos.descuento || ""}
                    onChange={(e) => handleInputChange("descuento", Number(e.target.value))}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-muted-foreground">IVA (%)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {ivaHabilitado ? "Habilitado" : "Deshabilitado"}
                      </span>
                      <Switch checked={ivaHabilitado} onCheckedChange={handleToggleIva} />
                    </div>
                  </div>
                  <Input
                    type="number"
                    placeholder="19"
                    min="0"
                    max="100"
                    disabled={!ivaHabilitado}
                    value={ivaHabilitado ? (datos.iva ?? 19) : ""}
                    onChange={(e) => handleInputChange("iva", Number(e.target.value))}
                    className={!ivaHabilitado ? "opacity-40 cursor-not-allowed" : ""}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
                    <Input
                      type="date"
                      value={datos.fecha}
                      onChange={(e) => handleInputChange("fecha", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Nombre del encargado
                    </label>
                    <Input
                      placeholder="Carlos Jaramillo"
                      value={datos.nombreEncargado}
                      onChange={(e) => handleInputChange("nombreEncargado", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Cargo</label>
                    <Input
                      placeholder="Director general"
                      value={datos.cargo}
                      onChange={(e) => handleInputChange("cargo", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Agregar servicios y productos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Servicio</label>
                  <Select value={servicioSeleccionado} onValueChange={setServicioSeleccionado}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          cargandoServicios ? "Cargando servicios..." : "Selecciona un servicio"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {servicios.length === 0 && !cargandoServicios ? (
                        <SelectItem value="sin-servicios" disabled>
                          No hay servicios disponibles
                        </SelectItem>
                      ) : (
                        servicios.map((servicio) => (
                          <SelectItem key={servicio.id} value={String(servicio.id)}>
                            {servicio.nombre || "Servicio sin nombre"}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                    <span className="text-sm font-medium text-foreground">
                      Productos del servicio
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAgregarTodos}
                      disabled={cargandoProductos || productosServicio.length === 0}
                    >
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Agregar todos</span>
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Producto</th>
                        <th className="text-right p-3 font-medium w-28">Precio</th>
                        <th className="text-right p-3 font-medium w-32">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cargandoProductos ? (
                        <tr>
                          <td className="p-3 text-muted-foreground" colSpan={3}>
                            Cargando productos...
                          </td>
                        </tr>
                      ) : productosServicio.length === 0 ? (
                        <tr>
                          <td className="p-3 text-muted-foreground" colSpan={3}>
                            Selecciona un servicio para ver productos
                          </td>
                        </tr>
                      ) : (
                        productosServicio.map((producto) => (
                          <tr key={producto.id} className="border-t border-border">
                            <td className="p-3">
                              <div className="font-medium text-foreground">
                                {producto.nombre || "Producto sin nombre"}
                              </div>
                              {producto.descripcion && (
                                <div className="text-xs text-muted-foreground">
                                  {producto.descripcion}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {formatCurrency(producto.precio ?? 0)}
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAgregarProducto(producto)}
                              >
                                Agregar
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>

                {/* Lista de productos agregados */}
                {datos.productos.length > 0 && (
                  <div className="border border-border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm min-w-[400px]">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Producto</th>
                          <th className="text-center p-3 font-medium w-20">Cant.</th>
                          <th className="text-right p-3 font-medium w-24">Total</th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {datos.productos.map((producto) => (
                          <tr key={producto.id} className="border-t border-border">
                            <td className="p-3">{producto.descripcion}</td>
                            <td className="p-3 text-center">
                              <Input
                                type="number"
                                min="1"
                                value={producto.cantidad}
                                onChange={(e) =>
                                  handleCantidadChange(producto.id, Number(e.target.value))
                                }
                                className="w-16 text-center mx-auto"
                              />
                            </td>
                            <td className="p-3 text-right">
                              {formatCurrency(producto.cantidad * producto.precioUnitario)}
                            </td>
                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminarProducto(producto.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Vista Previa */}
          <div className="space-y-4">
            <VistaPrevia ref={vistaPreviaRef} datos={datos} />
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={handleDescargarWord}
                disabled={descargandoWord}
                className="w-full sm:w-auto"
              >
                {descargandoWord ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {descargandoWord ? "Generando..." : "Descargar Cotización"}
              </Button>
              <Button
                variant="outline"
                onClick={handleAbrirDialogoPlantilla}
                disabled={guardandoPlantilla}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Plantilla
              </Button>
              <Button
                onClick={handleGuardarCotizacion}
                disabled={guardandoCotizacion}
                className="w-full sm:w-auto"
              >
                {guardandoCotizacion ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cotización"
                )}
              </Button>
            </div>
          </div>
        </div>

      {/* Diálogo para guardar como plantilla */}
      <Dialog open={dialogPlantillaAbierto} onOpenChange={setDialogPlantillaAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar como Plantilla</DialogTitle>
            <DialogDescription>
              Guarda esta configuración como plantilla para usarla en futuras cotizaciones.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-plantilla">
                Nombre de la plantilla <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre-plantilla"
                placeholder="Ej: Evento Corporativo Estándar"
                value={nombrePlantilla}
                onChange={(e) => setNombrePlantilla(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion-plantilla">Descripción (opcional)</Label>
              <Textarea
                id="descripcion-plantilla"
                placeholder="Breve descripción de la plantilla..."
                value={descripcionPlantilla}
                onChange={(e) => setDescripcionPlantilla(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPlantillaAbierto(false)} disabled={guardandoPlantilla}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarComoPlantilla} disabled={guardandoPlantilla}>
              {guardandoPlantilla ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Plantilla"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NuevaCotizacion;
