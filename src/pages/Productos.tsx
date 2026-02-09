import { useEffect, useMemo, useState } from "react";
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
import { ProductoServicio, Servicio } from "@/types/cotizacion";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "@/services/productosService";
import { obtenerServicios } from "@/services/serviciosService";
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

const formatCurrency = (amount: number | null) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);
};

const Productos = () => {
  const [productos, setProductos] = useState<ProductoServicio[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [idServicio, setIdServicio] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [estado, setEstado] = useState("activo");

  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductoServicio | null>(null);
  const [idServicioEditar, setIdServicioEditar] = useState("");
  const [nombreEditar, setNombreEditar] = useState("");
  const [descripcionEditar, setDescripcionEditar] = useState("");
  const [precioEditar, setPrecioEditar] = useState("");
  const [estadoEditar, setEstadoEditar] = useState("activo");

  const serviciosMap = useMemo(() => {
    return new Map(servicios.map((servicio) => [servicio.id, servicio.nombre ?? ""]));
  }, [servicios]);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [dataServicios, dataProductos] = await Promise.all([
        obtenerServicios(),
        obtenerProductos(),
      ]);
      setServicios(dataServicios);
      setProductos(dataProductos);
    } catch (errorCarga) {
      console.error(errorCarga);
      setError("No se pudieron cargar los productos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setIdServicio("");
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setEstado("activo");
  };

  const parsePrecio = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleCrear = async () => {
    if (!idServicio) {
      toast.error("Selecciona un servicio");
      return;
    }
    if (!nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    const precioValue = parsePrecio(precio);
    if (precio.trim() && precioValue === null) {
      toast.error("Precio inválido");
      return;
    }

    try {
      await crearProducto({
        id_servicio: Number(idServicio),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        precio: precioValue,
        estado,
      });
      toast.success("Producto creado correctamente");
      limpiarFormulario();
      await cargarDatos();
    } catch (errorCrear) {
      const mensaje =
        errorCrear instanceof Error
          ? errorCrear.message
          : "No se pudo crear el producto";
      toast.error(mensaje);
    }
  };

  const handleAbrirEditar = (producto: ProductoServicio) => {
    setProductoEditando(producto);
    setIdServicioEditar(String(producto.id_servicio));
    setNombreEditar(producto.nombre ?? "");
    setDescripcionEditar(producto.descripcion ?? "");
    setPrecioEditar(producto.precio !== null ? String(producto.precio) : "");
    setEstadoEditar(producto.estado ?? "activo");
    setDialogEditarAbierto(true);
  };

  const handleGuardarEdicion = async () => {
    if (!productoEditando) return;
    if (!idServicioEditar) {
      toast.error("Selecciona un servicio");
      return;
    }
    if (!nombreEditar.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    const precioValue = parsePrecio(precioEditar);
    if (precioEditar.trim() && precioValue === null) {
      toast.error("Precio inválido");
      return;
    }

    try {
      await actualizarProducto(productoEditando.id, {
        id_servicio: Number(idServicioEditar),
        nombre: nombreEditar.trim(),
        descripcion: descripcionEditar.trim() || null,
        precio: precioValue,
        estado: estadoEditar,
      });
      toast.success("Producto actualizado correctamente");
      setDialogEditarAbierto(false);
      await cargarDatos();
    } catch (errorActualizar) {
      toast.error("No se pudo actualizar el producto");
    }
  };

  const handleEliminar = async (producto: ProductoServicio) => {
    const confirmacion = window.confirm(
      `¿Seguro que deseas eliminar el producto "${producto.nombre ?? "sin nombre"}"?`
    );
    if (!confirmacion) return;

    try {
      await eliminarProducto(producto.id);
      toast.success("Producto eliminado correctamente");
      await cargarDatos();
    } catch (errorEliminar) {
      toast.error("No se pudo eliminar el producto");
    }
  };

  return (
    <div className="bg-background">
      <main className="">
        <div>
          <h1 className="text-2xl font-semibold text-foreground animate-fade-in">
            Productos
          </h1>
          <p className="text-sm text-muted-foreground mt-1 animate-fade-in [animation-delay:100ms]">
            Gestiona los productos asociados a cada servicio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="md:col-span-1 animate-fade-in [animation-delay:100ms]">
            <CardHeader>
              <CardTitle className="text-base">Crear producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Servicio</Label>
                <Select value={idServicio} onValueChange={setIdServicio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.length === 0 ? (
                      <SelectItem value="sin-servicios" disabled>
                        No hay servicios disponibles
                      </SelectItem>
                    ) : (
                      servicios.map((servicio) => (
                        <SelectItem key={servicio.id} value={String(servicio.id)}>
                          {servicio.nombre ?? "Servicio sin nombre"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre-producto">Nombre</Label>
                <Input
                  id="nombre-producto"
                  placeholder="Ej: Canapé gourmet"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion-producto">Descripción</Label>
                <Textarea
                  id="descripcion-producto"
                  placeholder="Describe el producto"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio-producto">Precio</Label>
                <Input
                  id="precio-producto"
                  type="number"
                  placeholder="0"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
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
              <Button className="w-full group" onClick={handleCrear}>
                <span className="transition-transform duration-200 group-hover:rotate-90">+</span>
                Crear producto
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 animate-fade-in [animation-delay:200ms]">
            <CardHeader>
              <CardTitle className="text-base">Listado de productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-auto max-h-[calc(100vh-280px)]">
                <Table className="min-w-[700px]">
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-muted/50 [&>th]:bg-muted/95 [&>th]:backdrop-blur-sm">
                      <TableHead>Producto</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cargando ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando productos...
                          </span>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-destructive">
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : productos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No hay productos registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      productos.map((producto, index) => (
                        <TableRow
                          key={producto.id}
                          className="transition-all duration-200 ease-out hover:bg-primary/5 animate-fade-in opacity-0"
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'forwards'
                          }}
                        >
                          <TableCell className="font-medium">
                            {producto.nombre ?? "Sin nombre"}
                            {producto.descripcion && (
                              <div className="text-xs text-muted-foreground">
                                {producto.descripcion}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {serviciosMap.get(producto.id_servicio) || "Sin servicio"}
                          </TableCell>
                          <TableCell>{formatCurrency(producto.precio)}</TableCell>
                          <TableCell className="text-sm">{producto.estado ?? "-"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(producto.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 transition-all duration-200 hover:scale-110 active:scale-95"
                                onClick={() => handleAbrirEditar(producto)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-destructive/10"
                                onClick={() => handleEliminar(producto)}
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
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription>
              Actualiza la información del producto seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Servicio</Label>
              <Select value={idServicioEditar} onValueChange={setIdServicioEditar}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {servicios.length === 0 ? (
                    <SelectItem value="sin-servicios" disabled>
                      No hay servicios disponibles
                    </SelectItem>
                  ) : (
                    servicios.map((servicio) => (
                      <SelectItem key={servicio.id} value={String(servicio.id)}>
                        {servicio.nombre ?? "Servicio sin nombre"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre-editar">Nombre</Label>
              <Input
                id="nombre-editar"
                value={nombreEditar}
                onChange={(e) => setNombreEditar(e.target.value)}
                placeholder="Nombre del producto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion-editar">Descripción</Label>
              <Textarea
                id="descripcion-editar"
                value={descripcionEditar}
                onChange={(e) => setDescripcionEditar(e.target.value)}
                placeholder="Descripción del producto"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio-editar">Precio</Label>
              <Input
                id="precio-editar"
                type="number"
                value={precioEditar}
                onChange={(e) => setPrecioEditar(e.target.value)}
                placeholder="0"
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

export default Productos;
