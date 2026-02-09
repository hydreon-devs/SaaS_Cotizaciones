import { useEffect, useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Servicio } from "@/types/cotizacion";
import {
  obtenerServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
} from "@/services/serviciosService";
import { toast } from "sonner";

const estadosDisponibles = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-CL").format(date);
};

const Servicios = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("activo");

  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null);
  const [nombreEditar, setNombreEditar] = useState("");
  const [descripcionEditar, setDescripcionEditar] = useState("");
  const [estadoEditar, setEstadoEditar] = useState("activo");

  const cargarServicios = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerServicios();
      setServicios(data);
    } catch (errorCarga) {
      console.error(errorCarga);
      setError("No se pudieron cargar los servicios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setDescripcion("");
    setEstado("activo");
  };

  const handleCrearServicio = async () => {
    if (!nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    try {
      await crearServicio({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        estado,
      });
      toast.success("Servicio creado correctamente");
      limpiarFormulario();
      await cargarServicios();
    } catch (errorCrear) {
      const mensaje =
        errorCrear instanceof Error
          ? errorCrear.message
          : "No se pudo crear el servicio";
      toast.error(mensaje);
    }
  };

  const handleAbrirEditar = (servicio: Servicio) => {
    setServicioEditando(servicio);
    setNombreEditar(servicio.nombre ?? "");
    setDescripcionEditar(servicio.descripcion ?? "");
    setEstadoEditar(servicio.estado ?? "activo");
    setDialogEditarAbierto(true);
  };

  const handleGuardarEdicion = async () => {
    if (!servicioEditando) return;
    if (!nombreEditar.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    try {
      await actualizarServicio(servicioEditando.id, {
        nombre: nombreEditar.trim(),
        descripcion: descripcionEditar.trim() || null,
        estado: estadoEditar,
      });
      toast.success("Servicio actualizado correctamente");
      setDialogEditarAbierto(false);
      await cargarServicios();
    } catch (errorActualizar) {
      toast.error("No se pudo actualizar el servicio");
    }
  };

  const handleEliminar = async (servicio: Servicio) => {
    const confirmacion = window.confirm(
      `¿Seguro que deseas eliminar el servicio "${servicio.nombre ?? "sin nombre"}"?`
    );
    if (!confirmacion) return;

    try {
      await eliminarServicio(servicio.id);
      toast.success("Servicio eliminado correctamente");
      await cargarServicios();
    } catch (errorEliminar) {
      toast.error("No se pudo eliminar el servicio");
    }
  };

  return (
    <div className="bg-background">
      <main className="">
        <div>
          <h1 className="text-2xl font-semibold text-foreground animate-fade-in">
            Servicios
          </h1>
          <p className="text-sm text-muted-foreground mt-1 animate-fade-in [animation-delay:100ms]">
            Administra el catálogo de servicios disponible para las cotizaciones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="md:col-span-1 animate-fade-in [animation-delay:100ms]">
            <CardHeader>
              <CardTitle className="text-base">Crear servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre-servicio">Nombre</Label>
                <Input
                  id="nombre-servicio"
                  placeholder="Ej: Servicio de catering"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion-servicio">Descripción</Label>
                <Textarea
                  id="descripcion-servicio"
                  placeholder="Describe el servicio"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosDisponibles.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full group" onClick={handleCrearServicio}>
                <span className="transition-transform duration-200 group-hover:rotate-90">+</span>
                Crear servicio
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 animate-fade-in [animation-delay:200ms]">
            <CardHeader>
              <CardTitle className="text-base">Listado de servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-auto max-h-[calc(100vh-280px)]">
                <Table className="min-w-[600px]">
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-muted/50 [&>th]:bg-muted/95 [&>th]:backdrop-blur-sm">
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cargando ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando servicios...
                          </span>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-destructive">
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : servicios.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No hay servicios registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      servicios.map((servicio, index) => (
                        <TableRow
                          key={servicio.id}
                          className="transition-all duration-200 ease-out hover:bg-primary/5 animate-fade-in opacity-0"
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'forwards'
                          }}
                        >
                          <TableCell className="font-medium">
                            {servicio.nombre ?? "Sin nombre"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {servicio.descripcion || "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {servicio.estado ?? "Sin estado"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(servicio.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 transition-all duration-200 hover:scale-110 active:scale-95"
                                onClick={() => handleAbrirEditar(servicio)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-destructive/10"
                                onClick={() => handleEliminar(servicio)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={dialogEditarAbierto} onOpenChange={setDialogEditarAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar servicio</DialogTitle>
            <DialogDescription>
              Actualiza la información del servicio seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-editar">Nombre</Label>
              <Input
                id="nombre-editar"
                value={nombreEditar}
                onChange={(e) => setNombreEditar(e.target.value)}
                placeholder="Nombre del servicio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion-editar">Descripción</Label>
              <Textarea
                id="descripcion-editar"
                value={descripcionEditar}
                onChange={(e) => setDescripcionEditar(e.target.value)}
                placeholder="Descripción del servicio"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={estadoEditar} onValueChange={setEstadoEditar}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosDisponibles.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarEdicion}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Servicios;
