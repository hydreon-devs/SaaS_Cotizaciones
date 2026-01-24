import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CotizacionesService } from "@/services/cotizacionesService";
import { Cotizacion } from "@/types/cotizacion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, FileText, Trash2 } from "lucide-react";

const CotizacionesLista = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [clientes, setClientes] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [clienteFilter, setClienteFilter] = useState<string>("todos");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [cotizacionAEliminar, setCotizacionAEliminar] = useState<Cotizacion | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const itemsPerPage = 10;
  const esAdmin = user?.role === "admin";

  // Cargar cotizaciones y clientes al montar el componente
  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [cotizacionesData, clientesData] = await Promise.all([
          CotizacionesService.obtenerTodas(),
          CotizacionesService.obtenerClientes(),
        ]);
        if (!activo) return;
        setCotizaciones(cotizacionesData);
        setClientes(clientesData);
      } catch (error) {
        if (!activo) return;
        toast.error("Error al cargar las cotizaciones");
        console.error(error);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  // Convierte fecha dd/mm/yyyy o dd-mm-yyyy a Date para comparación
  const parseFechaCotizacion = (fechaStr: string): Date | null => {
    if (!fechaStr) return null;
    // Acepta tanto "/" como "-" como separadores (formato dd/mm/yyyy o dd-mm-yyyy)
    const parts = fechaStr.split(/[/-]/);
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, day);
  };

  // Convierte fecha del input date (yyyy-mm-dd) a Date local
  const parseFechaInput = (fechaStr: string): Date | null => {
    if (!fechaStr) return null;
    const parts = fechaStr.split("-");
    if (parts.length !== 3) return null;
    const [year, month, day] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, day);
  };

  const filteredData = useMemo(() => {
    return cotizaciones.filter((cot) => {
      // Filtro por cliente
      if (clienteFilter !== "todos" && cot.cliente !== clienteFilter) return false;

      // Filtro por rango de fechas
      const cotFecha = parseFechaCotizacion(cot.fecha);
      if (cotFecha) {
        if (fechaDesde) {
          const desde = parseFechaInput(fechaDesde);
          if (desde && cotFecha < desde) return false;
        }
        if (fechaHasta) {
          const hasta = parseFechaInput(fechaHasta);
          if (hasta) {
            hasta.setHours(23, 59, 59, 999);
            if (cotFecha > hasta) return false;
          }
        }
      }

      return true;
    });
  }, [cotizaciones, clienteFilter, fechaDesde, fechaHasta]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [clienteFilter, fechaDesde, fechaHasta]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleLimpiarFiltros = () => {
    setClienteFilter("todos");
    setFechaDesde("");
    setFechaHasta("");
    setCurrentPage(1);
  };

  const handleSeleccionarCotizacion = async (cotizacion: Cotizacion) => {
    try {
      const datos = await CotizacionesService.obtenerPorId(Number(cotizacion.id));
      if (datos) {
        navigate("/nueva", { state: { plantilla: datos } });
      } else {
        toast.error("No se pudo cargar la cotización");
      }
    } catch (error) {
      toast.error("Error al cargar la cotización");
      console.error(error);
    }
  };

  const handleClickEliminar = (cotizacion: Cotizacion, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se active el click de la fila
    if (!esAdmin) {
      toast.error("No tienes permisos para eliminar cotizaciones. Solo los administradores pueden realizar esta acción.");
      return;
    }
    setCotizacionAEliminar(cotizacion);
    setDialogEliminarAbierto(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!cotizacionAEliminar) return;

    try {
      setEliminando(true);
      await CotizacionesService.eliminar(Number(cotizacionAEliminar.id));
      setCotizaciones((prev) => prev.filter((c) => c.id !== cotizacionAEliminar.id));
      toast.success("Cotización eliminada correctamente");
      setDialogEliminarAbierto(false);
      setCotizacionAEliminar(null);
    } catch (error) {
      toast.error("Error al eliminar la cotización");
      console.error(error);
    } finally {
      setEliminando(false);
    }
  };

  const handleCancelarEliminar = () => {
    setDialogEliminarAbierto(false);
    setCotizacionAEliminar(null);
  };

  return (
    <>
      <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Cotizaciones Anteriores</CardTitle>
                <CardDescription>Consulta y gestiona tus cotizaciones guardadas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filtros */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Filtrar Cotizaciones</h3>
                <Link to="/nueva">
                  <Button>Nueva Cotización</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Cliente</label>
                  <Select value={clienteFilter} onValueChange={setClienteFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los clientes</SelectItem>
                      {clientes.length === 0 ? (
                        <SelectItem value="sin-clientes" disabled>
                          No hay clientes disponibles
                        </SelectItem>
                      ) : (
                        clientes.map((cliente) => (
                          <SelectItem key={cliente} value={cliente}>
                            {cliente}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fecha desde</label>
                  <Input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fecha hasta</label>
                  <Input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={handleLimpiarFiltros} className="w-full">
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </div>

            {/* Contenido */}
            {cargando ? (
              <div className="text-center py-12">
                <Loader2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Cargando cotizaciones...</p>
              </div>
            ) : cotizaciones.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No hay cotizaciones guardadas
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Crea tu primera cotización para comenzar
                </p>
                <Button onClick={() => navigate("/nueva")}>
                  Crear Nueva Cotización
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Resultados ({filteredData.length})
                  </span>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>N° Cotización</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Monto Total</TableHead>
                        <TableHead className="text-center w-16">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No hay cotizaciones que coincidan con los filtros
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((cotizacion) => (
                          <TableRow
                            key={cotizacion.id}
                            className="hover:bg-muted/30 cursor-pointer"
                            onClick={() => handleSeleccionarCotizacion(cotizacion)}
                          >
                            <TableCell className="font-medium text-primary">
                              {cotizacion.numero}
                            </TableCell>
                            <TableCell>{cotizacion.cliente}</TableCell>
                            <TableCell>{cotizacion.fecha}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(cotizacion.montoTotal)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                onClick={(e) => handleClickEliminar(cotizacion, e)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Mostrando {(currentPage - 1) * itemsPerPage + 1}-
                      {Math.min(currentPage * itemsPerPage, filteredData.length)} de{" "}
                      {filteredData.length} resultados
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        «
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        »
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      {/* Diálogo de confirmación para eliminar */}

      <Dialog open={dialogEliminarAbierto} onOpenChange={setDialogEliminarAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Cotización</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la cotización{" "}
              <span className="font-semibold text-foreground">
                {cotizacionAEliminar?.numero}
              </span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelarEliminar}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmarEliminar}
              disabled={eliminando}
            >
              {eliminando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CotizacionesLista;
